/*
 * Copyright (c) AelasticS 2019.
 *
 */

import * as t from '../../src/aelastics-types'
import { isSuccess } from 'aelastics-result'

describe('Test cases for type schemas', () => {
  let schema1 = t.schema('Schema1')
  let schema2 = t.schema('Schema2', schema1)
  let schema3 = t.schema('Schema3', schema2)
  let schema4 = t.schema('Schema4')
  let schema5 = t.schema('Schema5')
  let p = t.object({ name: t.string, parent: t.link(schema2, 'Person') }, 'Person', schema2)
  let p1 = t.object(
    {
      name: t.string,
      parent: t.link(schema3, 'Person1')
    },
    'Person1',
    schema3
  )
  let p2 = t.object(
    {
      name: t.string,
      parent: t.link(schema1, 'Person2')
    },
    'Person2',
    schema1
  )

  it('schema1 should contain schema2 ', () => {
    expect(schema1.subSchemas.includes(schema2)).toBeTruthy()
  })

  it('schema2 should contain person object ', () => {
    schema1.validate()
    expect(schema1.getType('Schema2/Person')).toEqual(p)
  })
  it('schema3 should contain person object ', () => {
    schema3.addType(p)
    schema3.validate()
    schema1.validate()
    expect(schema1.getType('Schema2/Schema3/Person')).toEqual(p)
    schema3.removeType(p)
  })
  it('schema1 should contain person object ', () => {
    schema1.addType(p)
    schema1.validate()
    expect(schema1.getType('Person')).toEqual(p)
    schema1.removeType(p)
  })

  it('schema1 should NOT contain worker object ', () => {
    schema1.addType(p)
    schema1.validate()
    expect(schema1.getType('Worker')).not.toBeDefined()
    schema1.removeType(p)
  })

  it('schema1 should be valid ', () => {
    expect(isSuccess(schema1.validate())).toBe(true)
  })
  it('schema1 should be invalid ', () => {
    let a = t.object(
      {
        name: t.string,
        parent: t.link(schema2, 'Person6')
      },
      'Person',
      schema3
    )
    expect(isSuccess(schema1.validate())).toBe(false)
    schema3.removeType(a)
  })

  it('Schemas with cyclic links should be valid', () => {
    schema1.addType(p)
    schema2.addType(p1)
    schema3.addType(p2)
    expect(isSuccess(schema1.validate())).toBe(true)
    schema1.removeType(p)
    schema2.removeType(p1)
    schema3.removeType(p2)
  })

  it('Schema4 should contain map with linkType as map value', () => {
    let someMap = t.mapOf(t.string, t.link(schema1, 'Person2'), 'SomeMap')
    schema4.addType(someMap)
    schema4.validate()
    expect(schema4.getType('SomeMap')).toEqual(someMap)
    schema4.removeType(someMap)
  })

  it('Schema4 should be validate with map with linkType as map key', () => {
    let someMap = t.mapOf(t.link(schema1, 'Person2'), t.string, 'SomeMap')
    schema4.addType(someMap)
    expect(isSuccess(schema4.validate())).toBe(true)
    schema4.removeType(someMap)
  })

  it('Schema4 should not be validate, because map inside have linkType with wrong path as map key', () => {
    let someMap = t.mapOf(t.link(schema1, 'Person22'), t.string, 'SomeMap')
    schema4.addType(someMap)
    expect(isSuccess(schema4.validate())).toBe(false)
    schema4.removeType(someMap)
  }) // validation trows error as we expect, we need to find right format of error.

  it('Schema4 should be validate with arrayType inside with linkType as baseType', () => {
    let a = t.arrayOf(t.link(schema1, 'Person2'), 'someArray')
    schema4.addType(a)
    expect(isSuccess(schema4.validate())).toBe(true)
    schema4.removeType(a)
  })

  it('Schema4 should not be validate because arrayType inside have linkType with invalid path as baseType', () => {
    let a = t.arrayOf(t.link(schema1, 'Person22'), 'someArray')
    schema4.addType(a)
    expect(isSuccess(schema4.validate())).toBe(false)
    schema4.removeType(a)
  })

  it('Schema5 should be validate with subtype inside with linkType as propertie', () => {
    let a = t.subtype(p, { age: t.number }, 'newPerson')
    schema5.addType(a)
    expect(isSuccess(schema5.validate())).toBe(true)
    schema5.removeType(a)
  })

  it('Schema5 should not be validate with subtype inside with invalid linkType as propertie', () => {
    let a = t.subtype(p, { someLink: t.link(schema1, 'Person22') }, 'newPerson')
    schema5.addType(a)
    expect(isSuccess(schema5.validate())).toBe(false)
    schema5.removeType(a)
  })

  it('Schema5 should be validate with intersection type with linktype inside', () => {
    let a = t.intersectionOf([p, t.object({ someLink: t.link(schema1, 'Person2') })])
    schema5.addType(a)
    expect(isSuccess(schema5.validate())).toBe(true)
    schema5.removeType(a)
  })

  it('Schema5 should not be validate with intersection type with invalid linktype inside', () => {
    let a = t.intersectionOf([p, t.object({ someLink: t.link(schema1, 'Person22') })])
    schema5.addType(a)
    expect(isSuccess(schema5.validate())).toBe(false)
    schema5.removeType(a)
  })

  it('Schema5 should be validate with objReference type with linktype inside', () => {
    let a = t.ref(p, 'pRef')
    schema5.addType(a)
    expect(isSuccess(schema5.validate())).toBe(true)
    schema5.removeType(a)
  })

  it('Schema5 should not be validate with objReference type with invalid linktype inside', () => {
    let a = t.ref(t.object({ someLink: t.link(schema1, 'Person22') }), 'pRef')
    schema5.addType(a)
    expect(isSuccess(schema5.validate())).toBe(false)
    schema5.removeType(a)
  })

  it('Schema5 should be validate with Union type with valid linktype inside', () => {
    let a = t.unionOf([t.link(schema1, 'Person2'), t.string], 'someUnion')
    schema5.addType(a)
    expect(isSuccess(schema5.validate())).toBe(true)
    schema5.removeType(a)
  })

  it('Schema5 should not be validate with Union type with invalid linktype inside', () => {
    let a = t.unionOf([t.link(schema1, 'Person22'), t.string], 'someUnion')
    schema5.addType(a)
    expect(isSuccess(schema5.validate())).toBe(false)
    schema5.removeType(a)
  })

  it('Schema5 should  be validate with TaggedUnion type with valid linktype inside', () => {
    let a = t.taggedUnion(
      {
        prop1: t.link(schema1, 'Person2'),
        prop2: t.string
      },
      'test',
      'someTaggedUnion'
    )
    schema5.addType(a)
    expect(isSuccess(schema5.validate())).toBe(true)
    schema5.removeType(a)
  })

  it('Schema5 should not be validate with TaggedUnion type with invalid linktype inside', () => {
    let a = t.taggedUnion(
      {
        prop1: t.link(schema1, 'Person22'),
        prop2: t.string
      },
      'test',
      'someTaggedUnion'
    )
    schema5.addType(a)
    expect(isSuccess(schema5.validate())).toBe(false)
    schema5.removeType(a)
  })

  it('Testing a single valid link ', () => {
    let someLink = t.link(schema1, 'Person2')
    let traversed = new Map()
    expect(isSuccess(someLink.validateLinks(traversed))).toBe(true)
  })

  it('Testing a single invalid link ', () => {
    let someLink = t.link(schema1, 'Person22')
    let traversed = new Map()
    expect(isSuccess(someLink.validateLinks(traversed))).toBe(false)
  })
})
