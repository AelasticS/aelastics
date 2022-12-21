import { MultiStore } from "aelastics-store";
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
import { Element } from "./element";
import { doParseURL } from "./path";
import { Context } from "./context";

// "^[\\$a-zA-Z0-9_\\.\\-]+$"
const reg = new RegExp("^[\\$a-zA-Z0-9_\\.\\-]+$"); // old "^[a-zA-Z0-9_\.\-/]+$"

export class ModelStore {
  private store: MultiStore<string>;
  private mapOfNames: Map<string, IModelElement> = new Map();
  constructor(server?: ServerProxy) {
    this.store = new MultiStore(server);
  }
  static getRandomInt() {
    return Math.floor(Math.random() * 999999999999);
  }

  public async fetchModel(type: t.Any, id: string) {
    this.store.registerTypeSchema(type.ownerSchema);
    const m = (await this.store.fetchObjectByID(type, id)) as IModel;

    m.elements.forEach((e) => {
      const elType = this.store.getType(e);
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
    type: t.Any,
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
    const m = this.store.new<IModel>(type, data);
    if (ownerModel) ownerModel.elements.push(m);
    if (namespace) namespace.elements.push(m);
    // add to map of names
    this.mapOfNames.set(fullQName, m);
    return m;
  }

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
    this.store.add(initValue)
    return initValue as INamespace;
  }

  public newNamespace(
    type: t.Any,
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

    const n = this.store.new<INamespace>(type, data);
    if (ownerModel) ownerModel.elements.push(n);
    if (namespace) namespace.elements.push(n);
    // add to map of names
    this.mapOfNames.set(fullQName, n);
    return n;
  }

  public newModelElement(
    model: Partial<IModel>,
    namespace: INamespace,
    type: t.Any,
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

    const el = this.store.new<IModelElement>(type, data);
    model.elements!.push(el);
    if (namespace != model) namespace.elements.push(el);
    // add to map of names
    this.mapOfNames.set(fullQName, el);
    return el;
  }

  // TODO: add repository owner as a top level namespace
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
    return this.store.getType(e);
  }

  public isTypeOf(e: IModelElement, type: t.Any): boolean {
    const elType = this.store.getType(e);
    return elType.isOfType(type);
  }

  public registerTypeSchemas(schemas: t.TypeSchema[]) {
    schemas.forEach((s) => this.store.registerTypeSchema(s));
  }

  async importNamespace(path: string, ctx: Context) {
    const [pathType, segments] = doParseURL(path);
    const dynElemennt: Element<IModelElement> = await import(path);
    dynElemennt.render(ctx);
  }

  importModel(modelPath: string, namesepace: INamespace) {}

  exportModel() {}
  serializeModel() {}
  deserializeModel() {}
  validateModel() {}
}
