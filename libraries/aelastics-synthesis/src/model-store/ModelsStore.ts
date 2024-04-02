import * as fs from "fs";
import { Store } from "aelastics-store";
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
import { Element } from "../index";
import { doParseURL } from "./path";
import { Context } from "../jsx/context";
import { JSX_Export as je } from "../index";
import { AnnotationTypes as a } from "aelastics-types";
import { Typed_JSX_Annotation } from "../jsx-export";

// "^[\\$a-zA-Z0-9_\\.\\-]+$"
const reg = new RegExp("^[\\$a-zA-Z0-9_\\.\\-]+$"); // old "^[a-zA-Z0-9_\.\-/]+$"

export enum AccessProtocol {
  "repo", // access model repository
  "jsx-file", // access typescript file with a model in jsx notation
  "json-file", // access typescript file with a model serialized with aelastics-types in json notation
  "types-file",
} // access typescript file with a  meta-model expressed using aelastics-types definition functions

export class ModelStore {
  private store: Store<string>;
  private mapOfNames: Map<string, IModelElement> = new Map();
  constructor(server?: ServerProxy) {
    this.store = new Store(server);
  }
  static getRandomInt() {
    return Math.floor(Math.random() * 999999999999);
  }

  public async fetchModel(
    type: t.Any,
    id: string
  ): Promise<IModel | undefined> {
    this.store.registerTypeSchema(type.ownerSchema);
    const m = (await this.store.fetchObjectByID(type, id)) as
      | IModel
      | undefined;

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

  public newModel<T extends IModel>(
    type: t.ObjectType<any, any>,
    initValue: Partial<T>,
    ownerModel?: IModel,
    namespace?: INamespace
  ): T {
    if (!type.isOfType(Model))
      throw new Error(`newModel: type ${type.name} is not a model.`);
    const data = { ...initValue };
    this.normalizeName(data, type.name, namespace);
    const fullQName = this.getNameWithPath(data as INamespace);
    // check duplicates
    if (this.mapOfNames.has(fullQName))
      throw new Error(`newModel: Duplicate name "${fullQName}"`);
    const m = this.store.deepCreate<T>(type, data);
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
    type: t.ObjectType<any, any>,
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

  public newModelElement<E extends IModelElement>(
    model: Partial<IModel>,
    namespace: INamespace,
    type: t.ObjectType<any, any>,
    initValue: Partial<E>
  ): E {
    if (!type.isOfType(ModelElement))
      throw new Error(
        `newModelElement: type ${type.name} is not a model element.`
      );
    const data = { ...initValue };
    this.normalizeName(data, type.name, namespace);
    const fullQName = this.getNameWithPath(data as IModelElement);
    // check duplicates
    if (this.mapOfNames.has(fullQName))
      throw new Error(`newModelElement: Duplicate name "${fullQName}"`);

    const el = this.store.deepCreate<E>(type, data);
    model.elements!.push(el);
    if (namespace != model) namespace.elements.push(el);
    // add to map of names
    this.mapOfNames.set(fullQName, el);
    return el;
  }

  // it should be fully qualified name without whitespace (i.e absolute path)
  private normalizeName(
    el: Partial<IModelElement>,
    typeName: string,
    namespace?: INamespace
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
      el.path = namespace ? this.getNameWithPath(namespace) : "";
    }
  }

  public addElement() {}

  public getNameWithPath(el: IModelElement): string {
    return el.path || el.path != "" ? `${el.path}/${el.name}` : `//${el.name}`;
  }

  public getTypeOf(e: IModelElement): t.AnyObjectType {
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
      case AccessProtocol["json-file"]:
        throw new Error("AccessProtocol.json-file is not yet supported");
      case AccessProtocol["types-file"]:
        throw new Error("AccessProtocol.types-file is not yet supported");
    }
    throw new Error("protocol is not yet supported");
  }

  importModel(modelPath: AccessProtocol, namespace: INamespace) {
    throw new Error("Function not implemented.");
  }

  importModelFromJSON(modelPath: string, namespace: INamespace) {
    const jsonString = fs.readFileSync(modelPath, "utf8");
  }

  exportModelToJSonFile() {
    throw new Error("Function not implemented.");
  }

  validateModel() {
    throw new Error("Function not implemented.");
  }

  exportToJSX(
    obj: IModelElement,
    annotation?: Typed_JSX_Annotation<any>
  ): string {
    let el: je.Complex_JSX_Element;
    if (annotation) el = je.makeWith(obj, annotation) as je.Complex_JSX_Element;
    else {
      const objType = this.getTypeOf(obj);
      el = je.make(obj, objType) as je.Complex_JSX_Element;
    }
    return el.toJSX();
  }
}
