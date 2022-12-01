import * as t from 'aelastics-types'
import { Any } from 'aelastics-types'
import * as g from 'generic-metamodel'
import { Context } from './context'
import { ModelStore } from './ModelsStore'

export type RefProps = {
    $id?:string,
    $local_id?: string,
    $ref?: g.IModelElement,
    $ref_local_id?: string
    $ref_id?: string
}

export type ElementInstance<P extends g.IModelElement> = {
    type: t.Any,
    instance: P
}

export type WithRefProps<P> = RefProps & Partial<P>
export type WithoutRefProps<P> = Exclude<P, RefProps>
export type InstanceCreation<P extends WithRefProps<g.IModelElement>> = 
        (props: P) => ElementInstance<g.IModelElement>

export type RenderPros = {
    children: ElementInstance<g.IModelElement>[]
    model: g.IModel
    store: ModelStore
}

// export type Template<P extends WithRefProps<g.IModelElement>, 
//       R extends Partial<g.IModelElement> = P> = (props: P) => Element<R>


export type Template<P extends g.IModelElement> = (props: WithRefProps<P>) => Element<WithRefProps<P>, P>

export type CpxTemplate<P extends {}, R extends g.IModelElement> = (props: P) => Element<P, R>

export type Super<P extends {}, R extends g.IModelElement> = Template<R> | CpxTemplate<P, R>


export class Element<P extends WithRefProps<g.IModelElement>, R = P> {
    public children: Element<any>[] = []
    constructor(
        public readonly type: t.Any, 
        public readonly props: P, 
        public readonly parentProp?:string) {
    }
    public create<R extends g.IModelElement>({ store, localIDs, model }: Context): ElementInstance<g.IModelElement> {
        let el: g.IModelElement

        if (this.props?.$ref) // is object reference to an existing element
            el = this.props.$ref as R
        else if (this.props?.$ref_id) {
            el = store.getModelElement(this.props.$ref_id) as R
            if (!el)
                throw new ReferenceError(`Not existing object referenced with ref_id=${this.props.$ref_id} by element '${this.type.fullPathName}'`)
        }
        else if (this.props?.$ref_local_id) { // is local id reference to an existing element
            el = localIDs.get(this.props.$ref_local_id) as R
            if (!el)
                throw new ReferenceError(`Not existing object referenced with ref_id=${this.props.$ref_local_id} by element '${this.type.fullPathName}'`)
        }
        else {
            // create element
            if (this.type.isOfType(g.Model))
                el = store.newModel(this.type, this.props as unknown as g.IModel, model) as R
            else if (!model)
                throw new Error("No model in the context!")
            else
                el = store.newModelElement(model, this.type, this.props as g.IModelElement) as R

            if (this.props?.$local_id) // if exist local id
                localIDs.set(this.props.$local_id, el)
        }

        return {type: this.type, instance: el}
    }

    // produce/create elements
    public  render<P extends g.IModelElement>(ctx: Context): P {
        if ('store' in this.props) {
          ctx.pushStore((<any>this.props).store)
        }
        const parent = this.create(ctx)
        if (parent.type.isOfType(g.Model)) { // push model to context
          ctx.pushModel(<g.IModel>parent.instance)
        }
        let objType = parent.type as t.ObjectType<any, any>
        let mapPropTypes = objType.allProperties
        this.children.forEach((childElement) => {
          const child = childElement.render(ctx)
          if(childElement.parentProp) { // connect parent and child
           let propType = mapPropTypes.get(childElement.parentProp)
           if(!propType)
                throw new Error()
           cnParentChild(childElement.parentProp, t.findTypeCategory(propType), parent.instance, child)
            // toDO: create trace!
          }
        })
        if (parent.type.isOfType(g.Model)) { // return old model
          ctx.popModel()
        }
        if ('store' in this.props) {
          ctx.popStore()
        }
        return parent.instance as P
      }

}

let cnParentChild = (prop: string | undefined, propType: t.TypeCategory | undefined, obj1: any, obj2: any) => {
    if (prop) {
      switch (propType) {
        case 'Object':
          obj1[prop] = obj2;
          break;
        case 'Array':
          if (obj1[prop] === undefined)
            obj1[prop] = new Array();
          (obj1[prop] as Array<any>).push(obj2)
          break;
      }
    }
  }
  

// const cnParentChild = (parent: g.IModelElement, child: g.IModelElement, propName:string) => {
//     if (!child)
//       return
//     if (!parent)
//       return
//     // local function to connect parent and child  

    
//     cn(a.parentPropName, a.parentPropType, parent, child)
//     cn(a.childPropName, a.childPropType, child, parent)
//   }