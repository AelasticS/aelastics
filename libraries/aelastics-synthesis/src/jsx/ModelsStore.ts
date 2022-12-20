import { MultiStore } from 'aelastics-store'
import { IModel, IModelElement, INamespace, Model, ModelElement, Namespace } from 'generic-metamodel'
import * as t from 'aelastics-types'
import { ServerProxy } from 'aelastics-store'

const reg = new RegExp("^[a-zA-Z0-9_.-]+$")

export class ModelStore {
  private store: MultiStore<string>
  private mapOfNames: Map<string, IModelElement> = new Map()
  constructor(server?: ServerProxy) {
    this.store = new MultiStore(server)
  }
  static getRandomInt() {
    return Math.floor(Math.random() * 999999999999);
  }

  public async fetchModel(type: t.Any, id: string) {
    this.store.registerTypeSchema(type.ownerSchema)
    const m = await this.store.fetchObjectByID(type, id) as IModel

    m.elements.forEach((e) => {
      const elType = this.store.getType(e)
      this.store.add(elType, e)
    })

    return m
  }

  public getByName(name: string): IModelElement | undefined {
    return this.mapOfNames.get(name)
  }

  public getByID(id: string) :IModelElement | undefined {
    return this.store.getObjectByID(id) as IModelElement | undefined
  }

  public newModel(type: t.Any, initValue: IModel, ownerModel?: IModel, namespace?: INamespace,): IModel {
    if (!type.isOfType(Model))
      throw new Error(`newModel: type ${type.name} is not a model.`)
    const data = { ...initValue }
    this.normalizeName(data, type.name, namespace)
    const m = this.store.new<IModel>(type, data)
    if (ownerModel)
      ownerModel.elements.push(m)
    if (namespace)
      namespace.elements.push(m)
    // add to map of names
    this.mapOfNames.set(this.getNameWithPath(m), m)
    return m
  }

  public newNamespace(type: t.Any, initValue: INamespace, ownerModel?: IModel, namespace?: INamespace,): INamespace {
    if (!type.isOfType(Namespace))
      throw new Error(`newNamespace: type ${type.name} is not a namespace.`)
    const data = { ...initValue }
    this.normalizeName(data, type.name, namespace)
    const n = this.store.new<INamespace>(type, data)
    if (ownerModel)
      ownerModel.elements.push(n)
    if (namespace)
      namespace.elements.push(n)
    // add to map of names
    this.mapOfNames.set(this.getNameWithPath(n), n)
    return n
  }

  public newModelElement(model: IModel, namespace: INamespace, type: t.Any, initValue: IModelElement): IModelElement {
    if (!type.isOfType(ModelElement))
      throw new Error(`newModelElement: type ${type.name} is not a model element.`)
    const data = { ...initValue }
    this.normalizeName(data, type.name, namespace)
    const el = this.store.new<IModelElement>(type, data)
    model.elements.push(el)
    if (namespace != model)
      namespace.elements.push(el)
    // add to map of names
    this.mapOfNames.set(this.getNameWithPath(el), el)
    return el
  }

  // TODO: add repository owner as a top level namespace
  private normalizeName(el: IModelElement, typeName: string, namesepace?: INamespace) {
    // trim
    if (!el.name) {
      el.name = `${typeName}_${ModelStore.getRandomInt()}`
    }
    else {
      const newName = el.name.replace(/\s/g, '')
      // validate
      if (!reg.test(newName))
        throw new Error(`Name ${el.name} is not valid`)
      // set label to the non-normalized name, if label is not provided  
      if (!el.label) {
        el.label = el.name
      }
      // set normalized name
      el.name = newName
      // set full name - starting with topmost namespace
      el.path = namesepace ?
        `${this.getNameWithPath(namesepace)}/${el.name}`
        : `/`
    }
  }

  public getNameWithPath(el: IModelElement): string {
    return `${el.path}/${el.name}`
  }


  public getTypeOf(e: IModelElement): t.Any {
    return this.store.getType(e)
  }

  public isTypeOf(e: IModelElement, type: t.Any): boolean {
    const elType = this.store.getType(e)
    return elType.isOfType(type)
  }

  public registerTypeSchemas(schemas: t.TypeSchema[]) {
    schemas.forEach((s) => this.store.registerTypeSchema(s))
  }

  importModel() { }
  exportModel() { }
  serializeModel() { }
  deserializeModel() { }
  validateModel() { }

}