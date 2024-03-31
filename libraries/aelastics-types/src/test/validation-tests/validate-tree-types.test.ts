/*
 * Copyright (c) AelasticS 2020.
 */

import * as t from '../../common/DefinitionAPI'
import { Node } from '../../common/Node'
import { identityReducer , naturalReducer , transducer } from '../../transducers/Transducer'
import { isFailure, ServiceError, ServiceResult } from 'aelastics-result'

/**
 *  test
 */

let Child = t.object(
  {
    name: t.string,
    age: t.number,
    male: t.boolean,
  },
  'Child'
)
let ChildArray = t.arrayOf(Child)

ChildArray.addValidator({
  predicate: (value) => value.length > 3,
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


describe('test transduce on object without optional properties', () => {

  const validateNode = (result: ServiceError[], currNode: Node, item: any) => {
    let res = currNode.type.checkValidators(item)
    if (isFailure(res)) {
      result.push(...res.errors)
    }
    return result
  }

  test('validate an object with an array with reduce accumulate operation', () => {
    let p: IPerson = {
      children: [
        { name: 'Ana', age: 10, male: 34},
        { name: 23, male: true, age: 15 }
      ],
      name: 'Peter',
      age: '35',
      male: true,
      employed: false,
    } as any

    let tr = transducer().recurse('accumulate').reduce(validateNode, [])
    let res = Person.transduce<ServiceResult<boolean>>(tr, p)
    expect(isFailure(res)).toBeTruthy
  })

  test('validate an object with an array with reduce makeItem operation', () => {
    let p: IPerson = {
      children: [
        { name: 'Ana', age: 10, male: 34},
        { name: 23, male: true, age: 15 }
      ],
      name: 'Peter',
      age: '35',
      male: true,
      employed: false,
    } as any

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

  test('validate an object with an array with validate() operation', () => {
    let p: IPerson = {
      age: '35',   // age.error
      children: [
        { name: 'Ana', age: 10, male: 34 }, // male.error
        { name: 23, male: true, age: 15 }, // name.error
      ],
      name: 'Peter',
      male: true,
      employed: false,
    } as any

    let tr = transducer()
      .recurse('makeItem')
      .validate()
      .doFinally(naturalReducer())
    let res = Person.transduce<ServiceResult<boolean>>(tr, p)
    expect(isFailure(res)).toBeTruthy
  })

  it('should find errors in validating an object with an array with validate() operation', () => {
    let p: IPerson = {
      age: '35',   // age.error
      children: [
        { name: 'Ana', age: 10, male: 34 }, // male.error
        { name: 23, male: true, age: 15 }, // name.error
      ],
      name: 'Peter',
      male: true,
      employed: false,
    } as any

    let tr = transducer()
      .recurse('makeItem')
      .validate()
      .doFinally(naturalReducer())
    let res = Person.transduce<ServiceResult<boolean>>(tr, p)
    expect(isFailure(res)).toBeTruthy
  })
})
