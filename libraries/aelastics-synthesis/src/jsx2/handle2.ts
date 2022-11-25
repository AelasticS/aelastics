import * as t from 'aelastics-types'
import * as g from 'generic-metamodel'
import { IModel, IModelElement } from 'generic-metamodel'
import { ModelStore } from './ModelsStore'

export type ChildParentAssoc = {
  childPropName?: string
  childPropType?: t.TypeCategory
  parentPropName?: string
  parentPropType?: t.TypeCategory
}

// export type IModelElement = Partial<g.IModelElement>

export type RefProps = {
  $local_id?: string,
  $ref?: g.IModelElement,
  $ref_local_id?: string
  $ref_id?: string
}


export type WithRefProps<P> = RefProps & Partial<P>
export type WithoutRefProps<P> = Exclude<P, RefProps>
export type RenderPros = {
  children: ElementInstance<g.IModelElement>[]
  model: IModel
  store: ModelStore
}

export type WithRenderProps<P> = WithRefProps<P> & RenderPros

export type Template<P extends WithRefProps<g.IModelElement>> = (props: P) => Element<P>

export type Element<P extends WithRefProps<g.IModelElement>> = {
  create: (props: P) => ElementInstance<g.IModelElement>,
  props: P,
  children: Element<any>[],
  assoc: ChildParentAssoc
}

export type ElementInstance<P extends g.IModelElement> = {
  type: t.Any,
  instance: P
}

export type Context = {
  store: ModelStore,
  localIDs: Map<string, g.IModelElement>,
  model: g.IModel
}

export function create<R extends g.IModelElement>
  (t: t.Any, props: WithRefProps<R>, {
    store, localIDs, model }: Context): ElementInstance<R> {
  let el: R

  if (props?.$ref) // is object reference to an existing element
    el = props.$ref as R
  else if (props?.$ref_id) {
    el = store.getModelElement(props.$ref_id) as R
    if (!el)
      throw new ReferenceError(`Not existing object referenced with ref_id=${props.$ref_id} by element '${t.fullPathName}'`)
  }
  else if (props?.$ref_local_id) { // is local id reference to an existing element
    el = localIDs.get(props.$ref_local_id) as R
    if (!el)
      throw new ReferenceError(`Not existing object referenced with ref_id=${props.$ref_local_id} by element '${t.fullPathName}'`)
  }
  else {
    // create element
    if (t.isOfType(g.Model))
      el = store.newModel(t, props) as R
    else
      el = store.newModelElement(model, t, props as R) as R

    if (props?.$local_id) // if exist local id
      localIDs.set(props.$local_id, el)
  }

  return {
    type: t,
    instance: el
  }
}

export function hm<P extends WithRefProps<g.IModelElement>>(t: Template<P>, props: P, ...children: Element<any>[]): Element<P> {
  let childElem = t(props)
  childElem.children.push(...children)
  return childElem
}

const modelStack: Array<g.IModel> = []

export const pushModel = (m: g.IModel) => {
  modelStack.push(m)
  globalConext.model = m
}

export const popModel = () => {
  modelStack.pop()
  globalConext.model = modelStack[modelStack.length - 1]
}

const storeStack: Array<ModelStore> = []

export const pushStore = (s: ModelStore) => {
  storeStack.push(s)
  globalConext.store = s
}

export const popStore = () => {
  storeStack.pop()
  globalConext.store = storeStack[storeStack.length - 1]
}

const globalConext: Context = {
  localIDs: new Map<string, g.IModelElement>(),
  model: { name: "Model1" } as g.IModel,
  store: undefined as unknown as ModelStore,
}
export const useContext: () => Context = () => {
  return globalConext
}

const cnParentChild = (parent: g.IModelElement, child: g.IModelElement, a: ChildParentAssoc) => {
  if (!child)
    return
  if (!parent)
    return
  // local function to connect parent and child  
  let cn = (prop: string | undefined, propType: t.TypeCategory | undefined, obj1: any, obj2: any) => {
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



export function render<P extends g.IModelElement>(el: Element<P>): P {
  if('store' in el.props) {
    pushStore( (<any>el.props).store) 
  }
  const parent = el.create(el.props)
  if (parent.type.isOfType(g.Model)) { // push model to context
    pushModel(<g.IModel>parent.instance)
  }
  el.children.forEach((childElement) => {
    const child = render<g.IModelElement>(childElement)
    cnParentChild(parent.instance, child, el.assoc)
  })
  if (parent.type.isOfType(g.Model)) { // return old model
    popModel()
  }
  if('store' in el.props) {
    popStore() 
  }
  return parent.instance as P
}
