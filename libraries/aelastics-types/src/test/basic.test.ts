/*
 * Copyright (c) AelasticS 2020.
 */

import * as t from '../common/DefinitionAPI'
import { DefaultSchema } from '../type/TypeSchema'
import { compose } from '../transducers/Processor'

let OptionalNumber = t.optional(t.number)
let LinkToPerson = t.link(DefaultSchema, "Person")

let Child = t.object(
  {
    name: t.string,
    age: t.number,
    male: t.boolean,
    parent:t.optional(LinkToPerson)
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

let PersonOptional = t.object(
  { name: t.string, age: OptionalNumber, male: t.boolean, children: t.arrayOf(t.number) },
  'PersonOptional'
)

describe('basic test for API aelastic types', () => {

  it('should correctly distinguish between simple and complex types' , () => {
    expect(Person.isSimple()).toBeFalsy
    expect(OptionalNumber.isSimple()).toBeTruthy
    expect(LinkToPerson.isSimple()).toBeFalsy
  })
  it('should correctly compose functions' , () => {
    let MultbyTwo = (n:number) => n*2
    let plusTwo = (n:number) => n+2
    let cmpF =
    expect(compose(MultbyTwo, plusTwo)(1)).toEqual(6)
    expect(compose(plusTwo, MultbyTwo)(1)).toEqual(4) })
})
