import { Any, TypeCategory } from 'aelastics-types'
import { IModel, IModelElement } from 'generic-metamodel'
import { MapStore, Store } from "./store"

export type Instance = { [key: string]: any }

export namespace STX {
  export type InstanceProps = { $id?: string, $ref?: Instance, $ref_id?: string }

  export type Child<P extends Instance> = {
    instance: P,
    cn: ConnectFun | undefined

  }
  export type Template<P extends InstanceProps, R extends Instance> = (props: P, store:Store, model?:IModel) => Child<R>

  export type ConnectFun = ((parent: Instance, child: Instance) => void)

  export type Assoc = {
    childPropName?: string
    childPropType?: TypeCategory
    parentPropName?: string
    parentPropType?: TypeCategory
  }

  export function createConnectFun(a: Assoc, model?:IModel): ConnectFun {
    let fcn: ConnectFun = (parent: Instance, child: Instance) => {
      if (!child)
        return 
      
      // add child to model(schema)
      if(model) {
        let me= child as IModelElement
        model.elements.push(me)
        me.parentModel = model
      }

      if (!parent)
        return

      // local function to connect parent and child  
      let cn = (prop: string | undefined, propType: TypeCategory | undefined, obj1:any, obj2:any) => {
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
      
      // connect in both directions
      cn(a.parentPropName, a.parentPropType, parent, child)
      cn(a.childPropName, a.childPropType, child, parent)


    }
    return fcn
  }

/*
  export type HigherOrderTemplate<P extends InstanceProps , R extends Instance> = (
    c: Template<P, R>
  ) => Template<P, R>
  export type HOT<P extends InstanceProps> = HigherOrderTemplate<P>
*/

  function instatiate (t: Any, props?: Object): Instance {
    return { __type: t.name, ...props }
  }

  /**
   * 
   * @param t 
   * @param props 
   * @param cnF - a function for creating elements; it contains a property store for storing created elements
   * @returns 
   */
  export function createChild<R extends Instance>(t: Any, props: InstanceProps, cnF: ConnectFun, store:Store): Child<R> {
    let i: R
    if (props?.$ref)
      i = props.$ref as R
    else if (props?.$ref_id) {
      if (!store.has(props.$ref_id))
        throw new ReferenceError(`Not existing object referenced with ref_id=${props.$ref_id} by element '${t.fullPathName}'`)
      else
        i = store.get(props.$ref_id)! as R
    }
    else {
      i = instatiate(t, { ...props }) as R
      if (props?.$id && store)
        store.add(props.$id, i)
    }
    return {
      instance: i,
      cn: cnF
    }

  }


  

// export const h1 = <P extends InstanceProps, R extends Instance>(t: Template<P, R>, props: any, ...children: Child<R>[]): Child<R> => {
//     let parent = t(props, h["store"], h["model"])
//     children.forEach((c: Child<R>) => {
//       if (c.cn) {
//         c.cn(parent.instance, c.instance)
//       }
//     })
//     return parent
//   }

 // create a deafult store for h function 
 type HandleFunc<P extends InstanceProps, R extends Instance> = {
  (t: Template<P, R>, props: any, ...children: Child<R>[]): Child<R>;
  store?: Store;
  model?:IModel
};

 export const h:HandleFunc<InstanceProps, Instance> = <P extends InstanceProps, R extends Instance>(t: Template<P, R>, props: any, ...children: Child<R>[]): Child<R> => {
  let parent = t(props, h.store!, h.model)
  children.forEach((c: Child<R>) => {
    if (c.cn) {
      c.cn(parent.instance, c.instance)
    }
  })
  return parent
} 

export function initHandleFun(s:Store = new MapStore(), m:IModel) {
  h["store"] = s
  h["model"] = m
 }


  export interface HConfig {
    store?: Store,
    clearStore?: boolean,
    createNew?:boolean
  }

  export const create = <P extends InstanceProps, R extends Instance>(
    f:()=>Child<R>, cfg:HConfig = {store:new MapStore}): R =>
 {
   if (cfg.store)
      h.store = cfg.store
    if(cfg.clearStore)
      h.store?.clear()
    if(cfg.createNew)
      h.store = new MapStore()  
    return f().instance as R
  }

}


/* old version based on property names
export type Child1 = {
  instance: any
  childPropName?: string
  childPropType?: TypeCategory
}

export function createChild1(
  t: Any ,
  props?: InstanceProps ,
  childPropName?: string ,
  childPropType?: TypeCategory
): Child1 {
  if (props?.$ref) {
    return {
      instance : props.$ref ,
      childPropName : childPropName ,
      childPropType : childPropType ,
    }
  } else {
    return {
      instance : createInstance(t , { ...props }) ,
      childPropName : childPropName ,
      childPropType : childPropType ,
    }
  }
}
*/
