/*
 * Copyright (c) AelasticS 2020.
 */

import * as t from '../common/DefinitionAPI'
import { transducer } from '../transducers/Transducer'
import { Node } from '../common/Node'
import { Reducer } from '../transducers/Transformer'

/**
 *  test
 */
let Person = t.object(
  { name: t.string, age: t.number, male: t.boolean, children: t.arrayOf(t.number) },
  'Person'
)
let PersonOptional = t.object(
  { name: t.string, age: t.optional(t.number), male: t.boolean, children: t.arrayOf(t.number) },
  'PersonOptional'
)

type IPerson = t.TypeOf<typeof Person>
let p: IPerson = { name: 'Peter', age: 25, male: true, children: [1, 2, 3] }
type TypeCounter = [number, number, number, number]

type IPersonOptional = t.TypeOf<typeof PersonOptional>
let pOpt: IPersonOptional = { name: 'Peter', age: undefined, male: true, children: [1, 2, 3] }
const initCounter = (): TypeCounter => [0, 0, 0, 0]

let countTypes: Reducer<TypeCounter> = (
  [simple, objects, arrays, optional]: TypeCounter,
   { type }: Node,
   item: any
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

let sumNumbers: Reducer<number> = (acc: number, { instance, type }: Node, item: any) => {
  switch (type.typeCategory) {
    case 'Number':
      return acc + instance
  }
  return acc
}

describe('test reduce operation for Object without optional', () => {
  it('should count number of category types', () => {
    let tr = transducer().recurse('accumulate').reduce(countTypes, initCounter())
    let n = Person.transduce(tr, p)
    expect(n).toEqual([6, 0, 1, 0])
  })

  it('should return 31 when summarizing all numbers', () => {
    let tr = transducer().recurse('accumulate').reduce(sumNumbers, 0)
    let sum = Person.transduce(tr, p)
    expect(sum).toEqual(31)
  })
})

describe('test reduce operation for Object with optional', () => {
  it('should count number of category types', () => {
    let tr = transducer().recurse('accumulate').reduce(countTypes, initCounter())
    let n = PersonOptional.transduce(tr, p)
    expect(n).toEqual([5, 0, 1, 1])
  })

  it('should return 31 when summarizing all numbers', () => {
    let tr = transducer().recurse('accumulate').reduce(sumNumbers, 0)
    let sum = PersonOptional.transduce(tr, p)
    expect(sum).toEqual(6)
  })
})
