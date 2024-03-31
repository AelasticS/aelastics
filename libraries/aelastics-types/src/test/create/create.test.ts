/*
 * Copyright (c) AelasticS 2020.
 */

import * as t from '../../common/DefinitionAPI'
import { DefaultSchema } from '../../type/TypeSchema'
import { identityReducer , naturalReducer , transducer } from '../../transducers/Transducer'
import { ServiceError } from 'aelastics-result'
import { NewInstance } from '../../transducers/NewInstance'

let OptionalNumber = t.optional(t.number)
let LinkToPerson = t.link(DefaultSchema, 'Person')

let Child = t.object(
  {
    name: t.string,
    age: t.number,
    male: t.boolean,
    parent: t.optional(LinkToPerson),
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
    name: t.string,
    children: ChildArray,
    male: t.boolean,
    place: t.object(
      {
        name: t.string,
        state: t.object({
          state: t.string,
        }),
      },
      'Place'
    ),
  },
  'Person'
)

let PersonOptional = t.object(
  { name: t.string, age: OptionalNumber, male: t.boolean, children: t.arrayOf(t.number) },
  'PersonOptional'
)
let person: Partial<t.TypeOf<typeof Person>> = {
  name: 'John',
  male: true,
  children: [],
  place: { name: 'London', state: { state: 'UK' } },
}

let defaultPerson: t.TypeOf<typeof Person> = {
  name: '',
  male: true,
  children: [],
  place: { name: '', state: { state: '' } },
}

let emptyPerson: Partial<t.TypeOf<typeof Person>> = {}

let PersonCyclic = t.object(
  {
    name: t.string,
    parent: t.link(DefaultSchema, 'PersonCyclic'),
  },
  'PersonCyclic'
)

let personCyclic: Partial<t.TypeOf<typeof PersonCyclic>> = {
  name: 'John',
}

let PersonCyclicOptional = t.object(
  {
    name: t.string,
    parent: t.optional(t.link(DefaultSchema, 'PersonCyclicOptional')),
  },
  'PersonCyclicOptional'
)

let personCyclicOptional1: Partial<t.TypeOf<typeof PersonCyclicOptional>> = {
  name: 'John',
}
let defaultPersonCyclicOptional /*: t.TypeOf<typeof PersonCyclicOptional> */ = {
  name: '',
  parent: undefined,
}

let personCyclicOptionalWithParent: Partial<t.TypeOf<typeof PersonCyclicOptional>> = {
  name: 'John',
  parent: { name: 'Peter' },
}

describe('test for instance creation aelastic types', () => {

  it('should create a default person from undefined one', () => {
    let tr = transducer().recurse('makeItem').newInstance().doFinally(naturalReducer())
    let r = Person.transduce(tr, emptyPerson as any)
    expect(r).toEqual(defaultPerson)
  })

  it('should create a default person from empty one', () => {
    let tr = transducer().recurse('makeItem').newInstance(emptyPerson).doFinally(naturalReducer())
    let r = Person.transduce(tr, emptyPerson as any)
    expect(r).toEqual(defaultPerson)
  })

  it('should create a person from partial one', () => {
    let tr = transducer().recurse('makeItem').newInstance(person).doFinally(naturalReducer())
    let r = Person.transduce(tr, person as any)
    expect(r).toEqual(person)
  })

  it('should create a default person cyclic optional', () => {
    let tr = transducer().recurse('makeItem').newInstance(emptyPerson).doFinally(naturalReducer())
    let r = PersonCyclicOptional.transduce(tr, defaultPersonCyclicOptional as any)
    expect(r).toEqual(defaultPersonCyclicOptional)
  })

  it('should detect a person cyclic', () => {
    let tr = transducer().recurse('makeItem').newInstance(personCyclic).doFinally(naturalReducer())
    let f = () => PersonCyclic.transduce(tr, defaultPersonCyclicOptional as any)
    expect(f).toThrowError(ServiceError)
  })

})
