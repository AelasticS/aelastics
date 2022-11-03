/*
 * Copyright (c) AelasticS 2020.
 */

import * as t from '../common/DefinitionAPI'
import { Node } from '../common/Node'
import { naturalReducer , transducer } from '../transducers/Transducer'

/**
 *  test
 */
let Person = t.object(
  {
    name: t.string,
    children: t.arrayOf(t.boolean),
    age: t.number,
    male: t.boolean,
    employed: t.boolean,
  },
  'Person'
)
let PersonOptional = t.object(
  { name: t.string, age: t.optional(t.number), male: t.boolean, children: t.arrayOf(t.boolean) },
  'PersonOptional'
)

type IPerson = t.TypeOf<typeof Person>
let p: IPerson = {
  children: [false, true, false],
  name: 'Peter',
  age: 25,
  male: true,
  employed: false,
}
type TypeCounter = [number, number, number, number]

type IPersonOptional = t.TypeOf<typeof PersonOptional>
let pOpt: IPersonOptional = {
  name: 'Peter',
  age: undefined,
  male: true,
  children: [1, 2, 3, undefined as any],
}

describe('test transduce on object without optional properties', () => {

  test ("simple type transduce",   () =>{
    let tr = transducer().count()
    let res = t.string.transduce(tr,"5",0)
    expect(res).toEqual(1)
  })

  test('count number of true', () => {
    let p: IPerson = {
      children: [false, true, false],
      name: 'Peter',
      age: 25,
      male: true,
      employed: false,
    }
    let tr = transducer()
      .filter((i:any, n: Node) => n.type.typeCategory === 'Boolean')
      .filter((i:any, n: Node) => n.instance === true)
      .count()
    let cpy = Person.transduce(tr, p)

    expect(cpy).toEqual(1)
  })

  test('count number of trues recursively', () => {
    let p: IPerson = {
      children: [false, true, false],
      name: 'Peter',
      age: 25,
      male: true,
      employed: false,
    }
    let tr = transducer()
      .recurse('accumulate')
      .reduce((result:number, item, currNode) => {
        if ( currNode.type.typeCategory === 'Boolean' && item === true)
          return result + 1
        else
          return  result
      }, 0)
    /*
      .filter((i:any, n: Node) => n.type.typeCategory!=='Boolean' ||  ( n.type.typeCategory === 'Boolean' && i === true))
      .count()

     */
    let cpy = Person.transduce(tr, p)
    expect(cpy).toEqual(2)
  })

  let f = (acc: any, item: Node) => {
    return
  }
  test('transform/copy recursively', () => {
    let tr = transducer().recurse('makeItem').doFinally(naturalReducer())

    let cpy:t.TypeOf<typeof Person> = Person.transduce(tr, p)
    expect(cpy).toEqual(p)
    cpy.children[0] = true
    expect(cpy).not.toEqual(p)
  })

  test('transform only true booleans recursively', () => {
    let tr = transducer()
      .recurse('makeItem')
      .filter((i:any, n: Node) =>  !n.type.isSimple() ||(n.type.typeCategory === 'Boolean' && i === true))
      .doFinally(naturalReducer())

    let cpy = Person.transduce(tr, p)
    expect(cpy).toEqual({ male:true, children:[true] })
  })
})
