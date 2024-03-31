/*
 * Copyright (c) AelasticS 2020.
 */

import * as t from '../../common/DefinitionAPI'
import { Node } from '../../common/Node'
import { naturalReducer , transducer } from '../../transducers/Transducer'
import { isFailure, ServiceError, ServiceResult } from 'aelastics-result'
import { DefaultSchema } from '../../type/TypeSchema'

/**
 *  test
 */

let Child = t.object(
  {
    name: t.string,
    age: t.number,
    male: t.boolean,
    parent: t.optional(t.link(DefaultSchema, 'Person')),
  },
  'Child'
)
let ChildArray = t.arrayOf(Child)

ChildArray.addValidator({
  predicate: (value) => value.length > 2,
  message: (v, label?: string, result?: any): string => 'minimal length is 3',
})

let Person = t.object(
  {
    age: t.number,
    name: t.string,
    children: ChildArray,
    male: t.boolean,
    employed: t.boolean,
  },
  'Person'
)

Person.addValidator({
  predicate: (value) => (value.male ? value.employed : true),
  message: (v, label?: string, result?: any): string => 'male persons should be employed',
})
type IPerson = t.TypeOf<typeof Person>

describe('test transduce on cyclic object with optional properties', () => {
  const validateNode = (result: ServiceError[], currNode: Node, item: any) => {
    if (currNode.isRevisited) return result
    let res = currNode.type.checkValidators(item)
    if (isFailure(res)) {
      result.push(...res.errors)
    }
    return result
  }

  test('validate errors with reduce accumulate operation', () => {
    let p: IPerson = {
      children: [
        { name: 'Ana', age: 10, male: 34 }, // male error
        { name: 23, male: true, age: 15 }, // name error
      ],
      name: 'Peter',
      age: '35', // age error
      male: true,
      employed: false,
    } as any

    p.children[0].parent = p
    p.children[1].parent = p

    let tr = transducer().recurse('accumulate').reduce(validateNode, [])
    let res = Person.transduce<ServiceResult<boolean>>(tr, p)
    expect(isFailure(res)).toBeTruthy
  })

  test('validate an object with reduce makeItem operation', () => {
    let p: IPerson = {
      children: [
        { name: 'Ana', age: 10, male: 34 }, // male error
        { name: 23, male: true, age: 15 }, // name error
      ],
      name: 'Peter',
      age: '35', // age error
      male: true,
      employed: false,
    } as any
    p.children[0].parent = p
    p.children[1].parent = p

    let mapValidate = (item: any, currNode: Node) => {
      let res = currNode.type.checkValidators(item)
      if (isFailure(res)) {
        if (currNode.type.isSimple()) {
          return res
        } else return { errors: res.errors, origin: item }
      } else return item
    }

    let tr = transducer().recurse('makeItem').map(mapValidate).doFinally(naturalReducer())
    let res = Person.transduce<ServiceResult<boolean>>(tr, p)
    expect(isFailure(res)).toBeTruthy
  })

  test('validate an object with validate() operation', () => {
    let p: IPerson = {
      age: 35,
      children: [
        { name: 'Ana', age: 10, male: false },
        { name: 'John', male: true, age: 15 },
        { name: 'Maria', male: false, age: 5 },
      ],
      name: 'Peter',
      male: true,
      employed: true,
    } as any
    p.children[0].parent = p
    p.children[1].parent = p
    p.children[2].parent = p

    let tr = transducer().recurse('makeItem').validate().doFinally(naturalReducer())
    let res = Person.transduce<ServiceResult<boolean>>(tr, p)
    expect(res).toEqual(p)
  })

  it('should find errors in validating an object with an array with validate() transformer', () => {
    let p: IPerson = {
      age: '35', // age.error
      children: [
        { name: 'Ana', age: 10, male: 34 }, // male.error
        { name: 23, male: true, age: 15 }, // name.error
      ],
      name: 'Peter',
      male: true,
      employed: false,
    } as any

    p.children[0].parent = p
    p.children[1].parent = p

    let tr = transducer()
      .recurse('makeItem')
      .validate()
      .filter((item, currNode) => item['@hasErrors'])
      .doFinally(naturalReducer())
    let res = Person.transduce<ServiceResult<boolean>>(tr, p)
    expect(isFailure(res)).toBeTruthy
  })

  it('should find errors with validate() method', () => {
    let p: IPerson = {
      age: '35', // age.error
      children: [
        { name: 'Ana', age: 10, male: 34 }, // male.error
        { name: 23, male: true, age: 15 }, // name.error
      ],
      name: 'Peter',
      male: true,
      employed: false,
    } as any

    p.children[0].parent = p
    p.children[1].parent = p

    let [hasErrors, errObj] = Person.validateAndReport(p)
    expect(hasErrors).toBeTruthy
  })
})
