/*
 * Copyright (c) AelasticS 2020.
 */

// import { Mapper } from './Type'

// All currently implemented categories of types

export type TypeCategory = SimpleTypeCategory | ComplexTypeCategory | 'Optional' | 'Link'

export type SimpleTypeCategory =
  | 'Boolean'
  | 'Number'
  | 'String'
  | 'Literal'
  | 'Null'
  | 'Undefined'
  | 'Void'
  | 'Date'

export type ComplexTypeCategory =
  | 'Object'
  | 'Array'
  | 'Map'
  | 'TaggedUnion'
  | 'Union'
  | 'Intersection'
  | 'Function'
  | 'Tuple'
  | 'Reference'

/**
 *  ToDo: Conditional typing, Partial, DeepPartial, Pick, Omit,
 *  Generics types - with function with deepPartial which will replace all type place holders
 *  a step toward templates
 *  linkedList = generics (object("LinkedList", {info:param("ElemType"), next:link("LinkedList"))
 *  definition treeOf = generics(object({info:param("InfoType"), children:arrayOf(link("treeOf")),
 *  {InfoType: [extends, number]}
 *  }
 *
 *  generics wildcards (? extends) and (? super)
 *  ))
 */
/*
export const Partial:Mapper = t => {
  return t
}
*/

// Reference metadata for instances of complex  types
export interface InstanceReference {
  id: number // unique identifier within object graph
  category: string // instance category
  typeName: string // basic type name
}

// export const Functor = (t:Any):

export type ErrorObject = any

/*
export type ErrorObject = {
  [key: string]: { '@hasErrors': boolean; '@errors': string[]}
}
export type ExtendedErrObject =  {[key:string]:ErrorObject} | ErrorObject

let e: ExtendedErrObject = {
  pera: { '@hasErrors': true, '@errors': [], ime: 'pera' },
}*/
