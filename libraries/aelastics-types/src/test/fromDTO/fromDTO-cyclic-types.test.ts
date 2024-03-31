/*
 * Copyright (c) AelasticS 2020.
 */

import * as t from '../../common/DefinitionAPI'
import { identityReducer , naturalReducer , transducer } from '../../transducers/Transducer'
import { isFailure, ServiceResult } from 'aelastics-result'
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
type IPersonDtoGraph = t.DtoGraphTypeOf<typeof Person>

describe('test fromDTO on cyclic object with optional properties', () => {
  test('fromDTO an object with array of objects ', () => {
 /*   let pg1:IPersonDtoGraph = {

    }*/
      let pg:IPersonDtoGraph = {
      "ref": {
        "typeName": "/DefaultSchema/Person",
          "category": "Object",
          "id": 1
      },
      "object": {
        "age": 35,
          "name": "Peter",
          "children": {
          "ref": {
            "typeName": "/DefaultSchema/Array<Child>_1",
              "category": "Array",
              "id": 2
          },
          "array": [
            {
              "ref": {
                "typeName": "/DefaultSchema/Child",
                "category": "Object",
                "id": 3
              },
              "object": {
                "name": "Ana",
                "age": 10,
                "male": true,
                "parent": {
                  "ref": {
                    "typeName": "/DefaultSchema/Person",
                    "category": "Object",
                    "id": 1
                  }
                }
              }
            },
            {
              "ref": {
                "typeName": "/DefaultSchema/Child",
                "category": "Object",
                "id": 4
              },
              "object": {
                "name": "John",
                "age": 15,
                "male": true,
                "parent": {
                  "ref": {
                    "typeName": "/DefaultSchema/Person",
                    "category": "Object",
                    "id": 1
                  }
                }
              }
            }
          ]
        },
        "male": true,
          "employed": false
      }
    }
    let p: IPerson = Person.createInstance({
      children: [
        { name: 'Ana', age: 10, male: true },
        { name: 'John', male: true, age: 15 },
      ],
      name: 'Peter',
      age: 35,
      male: true,
      employed: false,
    }) as any
    p.children[0].parent = p
    p.children[1].parent = p

    let tr = transducer().recurse('makeItem').fromDtoGraph().doFinally(identityReducer())
    let res = Person.transduce<t.DtoGraphTypeOf<typeof Person>>(tr, pg as any)
    expect(res).toEqual(p)
  })

  test('validate an object with validate() operation', () => {
    let p: IPerson = Person.createInstance ({
      age: 35,
      children: [
        { name: 'Ana', age: 10, male: false },
        { name: 'John', male: true, age: 15 },
        { name: 'Maria', male: false, age: 5 },
      ],
      name: 'Peter',
      male: true,
      employed: true,
    }) as any
    p.children[0].parent = p
    p.children[1].parent = p
    p.children[2].parent = p

    let tr = transducer().recurse('makeItem').validate().doFinally(naturalReducer())
    let res = Person.transduce<ServiceResult<boolean>>(tr, p)
    expect(res).toEqual(p)
  })

  it('should find errors in validating an object with an array with validate() operation', () => {
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

    let tr = transducer().recurse('makeItem').validate().doFinally(naturalReducer())
    let res = Person.transduce<ServiceResult<boolean>>(tr, p)
    expect(isFailure(res)).toBeTruthy
  })
})
