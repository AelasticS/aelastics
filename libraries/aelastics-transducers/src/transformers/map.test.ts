/*
 * Copyright (c) AelasticS 2020.
 */

import * as t from 'aelastics-types'
import { identityReducer , naturalReducer , transducer } from '../Transducer'

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
let pOpt: IPersonOptional = {
  name: 'Peter',
  age: undefined,
  male: true,
  children: [1, 2, 3, undefined as any],
}

describe('test reduce operation for Object without optional', () => {
  it('should count number of category types', () => {
    let tr = transducer().recurse('makeItem').doFinally(naturalReducer()) // natural reducer
    //    let cpy = Person.map(copy , p)
    let cpy = Person.transduce(tr, p)
    expect(cpy).toEqual(p)
  })

  it('should multiply numbers by two', () => {
    let tr = transducer()
      .recurse('makeItem')
      .map((item, node) => (node.type.typeCategory === 'Number' ? item * 2 : item))
      .doFinally(naturalReducer())
    let cpy = <IPerson>Person.transduce(tr, p)
    expect(p.age).toEqual(25)
    expect(cpy.age).toEqual(50)
    expect(cpy.children.length).toEqual(3)
    for (let i = 0; i < cpy.children.length; i++) {
      expect(cpy.children[i]).toEqual((i + 1) * 2)
    }
  })
})

