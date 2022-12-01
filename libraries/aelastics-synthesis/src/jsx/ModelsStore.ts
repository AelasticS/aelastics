import {MultiStore} from 'aelastics-store'
import { IModel, IModelElement } from 'generic-metamodel'
import * as t from 'aelastics-types'
import { ServerProxy } from 'aelastics-store'

export class ModelStore  {
    private  store: MultiStore<string>

    constructor(server?: ServerProxy) {
        this.store = new MultiStore(server)
    }

    public async fetchModel (type: t.Any, id:string) {
      this.store.registerTypeSchemas([type.ownerSchema])
      const m = await this.store.fetchObjectByID(type, id) as IModel
      
      m.elements.forEach((e) => {
        const elType = this.store.getType(e)
        this.store.add(elType, e)})
        
      return m
    }

    public getModel (id:string) {
      return this.store.getObjectByID(id)
    }

    public getModelElement (id:string) {
      return this.store.getObjectByID(id)
    }

    public newModel(type: t.Any, initValue: IModel, ownerModel?:IModel): t.ObjectLiteral {
      const m = this.store.new<IModel>(type, initValue)
      if (ownerModel)
        ownerModel.elements.push(m)
      return m
    }

    public newModelElement(model:IModel, type: t.Any, initValue: IModelElement): IModelElement {
      const el = this.store.new<IModelElement>(type, initValue)
      model.elements.push(el)
      return el
    }

    public getTypeOf(e:IModelElement):t.Any {
      return this.store.getType(e)
    }

}