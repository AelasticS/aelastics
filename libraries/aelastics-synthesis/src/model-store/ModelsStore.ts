import * as fs from 'fs';
import {stepperReducer, transducer} from 'aelastics-types'
import { Store, AddEventListeners, ObjectObservable } from "aelastics-store";
import {
  IModel,
  IModelElement,
  INamespace,
  Model,
  ModelElement,
  Namespace,
} from "generic-metamodel";
import * as t from "aelastics-types";
import { ServerProxy } from "aelastics-store";
import { Element,  } from '../index'
import { doParseURL } from "../jsx/path";
import { Context } from "../jsx/context";
import { FILE } from "dns";
import { IStoreObject } from 'aelastics-store/lib/store/CommonConstants';

// "^[\\$a-zA-Z0-9_\\.\\-]+$"
const reg = new RegExp("^[\\$a-zA-Z0-9_\\.\\-]+$"); // old "^[a-zA-Z0-9_\.\-/]+$"

export enum AccessProtocol {
  "repo", // access model repository
  "jsx-file", // access typescript file with a model in jsx notation
  "json-file", // access typescript file with a model serialized with aelastic-types in json notation
  "types-file",
} // access typescript file with a  meta-model expressd using aelastic-types definition functions

export class ModelStore {
  private store: Store<string>;
  private mapOfNames: Map<string, IModelElement> = new Map();
  constructor(server?: ServerProxy) {
    this.store = new Store(server);
  }
  static getRandomInt() {
    return Math.floor(Math.random() * 999999999999);
  }

  public async fetchModel(type: t.Any, id: string): Promise<IModel|undefined> {
    this.store.registerTypeSchema(type.ownerSchema);
    const m = (await this.store.fetchObjectByID(type, id)) as IModel|undefined
    
    m?.elements.forEach((e) => {
      //@ts-ignore
      this.store.add(e);
    });

    return m;
  }

  public getByName(name: string): IModelElement | undefined {
    return this.mapOfNames.get(name);
  }

  public getByID(id: string): IModelElement | undefined {
    return this.store.getObjectByID(id) as IModelElement | undefined;
  }

  public newModel(
    type: t. ObjectType<any,any>,
    initValue: Partial<IModel>,
    ownerModel?: IModel,
    namespace?: INamespace
  ): IModel {
    if (!type.isOfType(Model))
      throw new Error(`newModel: type ${type.name} is not a model.`);
    const data = { ...initValue };
    this.normalizeName(data, type.name, namespace);
    const fullQName = this.getNameWithPath(data as INamespace);
    // check duplicates
    if (this.mapOfNames.has(fullQName))
      throw new Error(`newModel: Duplicate name "${fullQName}"`);
    const m = this.store.deepCreate<IModel>(type, data);
    if (ownerModel) ownerModel.elements.push(m);
    if (namespace) namespace.elements.push(m);
    // add to map of names
    this.mapOfNames.set(fullQName, m);
    return m;
  }

  /*
  public addNamespace(
    type: t.Any,
    initValue: Partial<INamespace>,
    ownerModel?: IModel,
    namespace?: INamespace
  ): INamespace {
    const fullQName = this.getNameWithPath(initValue as INamespace);
    // check duplicates
    if (this.mapOfNames.has(fullQName))
      throw new Error(`addNamespace: Duplicate name "${fullQName}"`);
    // TODO: check that id is reused, not generated (from serialization?) - if id exist, do not generate on multistore
    this.store.add(initValue);
    return initValue as INamespace;
  }
*/

  public newNamespace(
    type: t. ObjectType<any,any>,
    initValue: Partial<INamespace>,
    ownerModel?: IModel,
    namespace?: INamespace
  ): INamespace {
    if (!type.isOfType(Namespace))
      throw new Error(`newNamespace: type ${type.name} is not a namespace.`);
    const data = { ...initValue };
    this.normalizeName(data, type.name, namespace);
    const fullQName = this.getNameWithPath(data as INamespace);
    // check duplicates
    if (this.mapOfNames.has(fullQName))
      throw new Error(`newNamespace: Duplicate name "${fullQName}"`);

    const n = this.store.deepCreate<INamespace>(type, data);
    if (ownerModel) ownerModel.elements.push(n);
    if (namespace) namespace.elements.push(n);
    // add to map of names
    this.mapOfNames.set(fullQName, n);
    return n;
  }

  public newModelElement(
    model: Partial<IModel>,
    namespace: INamespace,
    type: t. ObjectType<any,any>,
    initValue: IModelElement
  ): IModelElement {
    if (!type.isOfType(ModelElement))
      throw new Error(
        `newModelElement: type ${type.name} is not a model element.`
      );
    const data = { ...initValue };
    this.normalizeName(data, type.name, namespace);
    const fullQName = this.getNameWithPath(data);
    // check duplicates
    if (this.mapOfNames.has(fullQName))
      throw new Error(`newModelElement: Duplicate name "${fullQName}"`);

    const el = this.store.deepCreate<IModelElement>(type, data);
    model.elements!.push(el);
    if (namespace != model) namespace.elements.push(el);
    // add to map of names
    this.mapOfNames.set(fullQName, el);
    return el;
  }

  // it should be fully qualified name without whitespaces (i.e absoluth path)  
  private normalizeName(
    el: Partial<IModelElement>,
    typeName: string,
    namesepace?: INamespace
  ) {
    if (!el.name) {
      el.name = `${typeName}_${ModelStore.getRandomInt()}`;
    } else {
      // trim
      const newName = el.name.replace(/\s/g, "");
      // validate
      if (!reg.test(newName)) throw new Error(`Name ${el.name} is not valid`);
      // set label to the non-normalized name, if label is not provided
      if (!el.label) {
        el.label = el.name;
      }
      // set normalized name
      el.name = newName;
      // set path to its namespace
      el.path = namesepace ? this.getNameWithPath(namesepace) : "";
    }
  }

  public addElement() {}

  public getNameWithPath(el: IModelElement): string {
    return el.path || el.path != "" ? `${el.path}/${el.name}` : `//${el.name}`;
  }

  public getTypeOf(e: IModelElement): t.Any {
    // @ts-ignore
    return this.store.getType(e);
  }

  public isTypeOf(e: IModelElement, type: t.Any): boolean {
    //@ts-ignore
    const elType = this.store.getType(e);
    return elType.isOfType(type);
  }

  public registerTypeSchemas(schemas: t.TypeSchema[]) {
    schemas.forEach((s) => this.store.registerTypeSchema(s));
  }

  async importNamespace(protocol: AccessProtocol, path: string, ctx: Context) {
    switch (protocol) {
      case AccessProtocol["jsx-file"]:
        const [pathType, segments] = doParseURL(path);
        const module = await import(path);
        const el: Element<IModelElement> = module.default();
        if (el.type.isOfType(Namespace)) return el.render(ctx);
        throw new Error(
          `ImportNamespace: element ${el.type.name} is not a namespace or model`
        );
        break;
      case AccessProtocol.repo:
        throw new Error("AccessProtocol.repo is not yet supported");
      case AccessProtocol["jsx-file"]:
        throw new Error("AccessProtocol.jsx-file is not yet supported");
      case AccessProtocol["types-file"]:
        throw new Error("AccessProtocol.types-file is not yet supported");
    }
  }

  importModel(modelPath: AccessProtocol, namesepace: INamespace) {
    throw new Error("Function not implemented.");
  }

  importModelFromJSON(modelPath: string, namesepace: INamespace) {
    const jsonString = fs.readFileSync(modelPath,'utf8');

  }

  exportModelToJSonFile() {
    throw new Error("Function not implemented.");
  }

  validateModel() {
    throw new Error("Function not implemented.");
  }
}
function swicth(protocol: AccessProtocol) {
  throw new Error("Function not implemented.");
}
