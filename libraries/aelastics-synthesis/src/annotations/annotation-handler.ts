/*
 * Created Date: Monday, February 13th 2023, 10:02:26 am
 * Author: Sinisa Neskovic
 * 
 * Copyright (c) 2023 Aelastics
 */

import {Any, transducer} from "aelastics-types"
import { IObject } from "../types-metamodel/types-meta.model"

/**
 *  Three possible annotation forms:
 *  1. pure annotation - data structure keeping essential annotation data
 *  2. annotation model - annotation is a model, annotation data are model elements
 *  3. transformation context - annotations in the form of a Map, which is suitable for model transformations
 */

import {} from "aelastics-types"

type AnnotationContextType = {
    mappings:Map<object, object>
}

export function pure2Model() {

}

export function pure2Context<A extends Any>(inputType:A, input:IObject):AnnotationContextType {
 const act:AnnotationContextType = {mappings: new Map()}
 let makeMapping = () => {

 }
 
 /*
 Reducer<TypeCounter> = (
  [simple, objects, arrays, optional]: TypeCounter,
  item: any,
  { type }: Node
) => {
  switch (type.typeCategory) {
    case 'Object':
      return [simple, objects + 1, arrays, optional]
    case 'Array':
      return [simple, objects, arrays + 1, optional]
    case 'String':
      return [simple + 1, objects, arrays, optional]
    case 'Number':
      return [simple + 1, objects, arrays, optional]
    case 'Boolean':
      return [simple + 1, objects, arrays, optional]
    case 'Optional':
      return [simple, objects, arrays, optional + 1]
  }
  return [simple, objects, arrays, optional]
}
*/

 let tr = transducer().recurse('accumulate').reduce(makeMapping, act)
 let n = inputType.transduce(tr, input)
    return act
}


export function model2Context() {

}


/*

  it('should count number of category types', () => {
    let tr = transducer().recurse('accumulate').reduce(countTypes, initCounter())
    let n = Person.transduce(tr, p)
    expect(n).toEqual([6, 0, 1, 0])
  })

const initCounter = (): TypeCounter => [0, 0, 0, 0]

let countTypes: Reducer<TypeCounter> = (
  [simple, objects, arrays, optional]: TypeCounter,
  item: any,
  { type }: Node
) => {
  switch (type.typeCategory) {
    case 'Object':
      return [simple, objects + 1, arrays, optional]
    case 'Array':
      return [simple, objects, arrays + 1, optional]
    case 'String':
      return [simple + 1, objects, arrays, optional]
    case 'Number':
      return [simple + 1, objects, arrays, optional]
    case 'Boolean':
      return [simple + 1, objects, arrays, optional]
    case 'Optional':
      return [simple, objects, arrays, optional + 1]
  }
  return [simple, objects, arrays, optional]
}

*/

