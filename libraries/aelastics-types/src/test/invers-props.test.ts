import * as t from '../common/DefinitionAPI'

describe('Test inverseProps() function', () => {
  const SchemaPerson = t.schema('SchemaPerson')
  const Person = t.entity(
    {
      id: t.number,
      name: t.string,
      children: t.arrayOf(t.link(SchemaPerson, 'Child', undefined,SchemaPerson),"Children",SchemaPerson),
    },
    ['id'] as const,
    'Person',
    SchemaPerson
  )

  const Child = t.object(
    {
      name: t.string,
      parent: Person,
    },
    'Child',
    SchemaPerson
  )
  t.inverseProps(Person, 'children', Child, 'parent')
  SchemaPerson.validate()

  it(`should by changing object's property, add it to the inverse array property`, () => {
    expect(Child.inverseCollection.size).toEqual(1)
    expect(Array.from(Child.inverseCollection.values())[0].propName).toEqual('children')
    expect(Array.from(Child.inverseCollection.values())[0].propType).toEqual('Array')
    expect(Person.inverseCollection.size).toEqual(1)
    expect(Array.from(Person.inverseCollection.values())[0].propName).toEqual('parent')
    expect(Array.from(Person.inverseCollection.values())[0].propType).toEqual('Object')
  })
})

describe('Test findTypeCategory function for link and optional', () => {
  const SchemaPerson = t.schema('SchemaPerson')
  const Person = t.entity(
    {
      id: t.number,
      name: t.string,
      place: t.optional(t.link(SchemaPerson, 'Place', 'place')),
      children: t.arrayOf(t.link(SchemaPerson, 'Child', undefined), 'Children', SchemaPerson),
    },
    ['id'] as const,
    'Person',
    SchemaPerson
  )

  const Child = t.object(
    {
      name: t.string,
      parent: Person,
    },
    'Child',
    SchemaPerson
  )

  const Place = t.object(
    {
      name: t.string,
      persons: t.arrayOf(Person),
    },
    'Place',
    SchemaPerson
  )
  t.inverseProps(Person, 'place', Place, 'persons')
  SchemaPerson.validate()

  it(`should by changing object's property, add it to the inverse array property`, () => {
    expect(Person.inverseCollection.size).toEqual(1)
    expect(Array.from(Person.inverseCollection.values())[0].propName).toEqual('persons')
    expect(Array.from(Person.inverseCollection.values())[0].propType).toEqual('Array')
    expect(Place.inverseCollection.size).toEqual(1)
    expect(Array.from(Place.inverseCollection.values())[0].propName).toEqual('place')
    expect(Array.from(Place.inverseCollection.values())[0].propType).toEqual('Object')
  })

})
