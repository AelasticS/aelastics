import * as ts from '../../src/common/TypeSchema'
import * as t from '../../src/aelastics-types'
import { isFailure, isSuccess } from 'aelastics-result'
import * as examples from '../example/instances-example'
import { InvoiceType, SingerType } from '../example/types-example'

describe(' TypeSchema test cases', () => {
  let schema1 = t.schema('Schema1')
  let schema2 = t.schema('Schema2', schema1)
  let schema3 = t.schema('Schema3', schema2)
  let schema4 = t.schema('Schema4')

  let person1 = t.object({ name: t.string, parent: t.link(schema1, 'Person1') }, 'Person1', schema1)
  let person2 = t.object({ name: t.string, parent: t.link(schema2, 'Person2') }, 'Person2', schema2)
  let person3 = t.object({ name: t.string, parent: t.link(schema3, 'Person3') }, 'Person3', schema3)

  it('Schema1 should be valid', () => {
    expect(isSuccess(schema1.validate())).toBe(true)
  })
  it('Schema1 should be invalid', () => {
    let person5 = t.object(
      { name: t.string, parent: t.link(schema2, 'Person5') },
      'Person1',
      schema3
    )
    expect(isSuccess(schema1.validate())).toBe(false)
    schema3.removeType(person5)
  })
  it('Schema1 should contain schema2', () => {
    expect(schema1.subSchemas.includes(schema2)).toBe(true)
  })
  it('Schema2 should contain person2 object', () => {
    schema1.validate()
    expect(schema1.getType('Schema2/Person2')).toEqual(person2)
  })

  it('Schema3 should contain person1 object', () => {
    schema3.addType(person1)
    schema3.validate()
    schema1.validate()
    expect(schema1.getType('Schema2/Schema3/Person1')).toEqual(person1)
    schema3.removeType(person1)
  })

  it('Schema1 should contain person2 object', () => {
    schema1.addType(person2)
    schema1.validate()
    expect(schema1.getType('Person2')).toEqual(person2)
    schema1.removeType(person2)
  })
  it('Schema4 contains a map with linkType as map value', () => {
    let map = t.mapOf(t.string, t.link(schema1, 'Person1'), 'map')
    schema4.addType(map)
    schema4.validate()
    expect(schema4.getType('map')).toEqual(map)
    schema4.removeType(map)
  })
  it('Schema4 should be valid with a map with linkType as map key', () => {
    let map = t.mapOf(t.string, t.link(schema1, 'Person1'), 'map')
    schema4.addType(map)
    expect(isSuccess(schema4.validate())).toBe(true)
    schema4.removeType(map)
  })

  it('Schema4 should not be valid  with a map with a wrong path inside linkType as map key', () => {
    let map = t.mapOf(t.string, t.link(schema1, 'Person6'), 'map')
    schema4.addType(map)
    expect(isSuccess(schema4.validate())).toBe(false)
    schema4.removeType(map)
  })
  it('Schema4 should be valid with subtype which has linkType as property', () => {
    let subtype = t.subtype(person1, { link: t.link(schema1, 'Person1') }, 'Person4')
    schema4.addType(subtype)
    expect(isSuccess(schema4.validate())).toBe(true)
    schema4.removeType(subtype)
  })
  it('Schema4 should not be valid with subtype which has invalid linkType as property', () => {
    let subtype = t.subtype(person1, { link: t.link(schema1, 'Person6') }, 'Person4')
    schema4.addType(subtype)
    expect(isSuccess(schema4.validate())).toBe(false)
    schema4.removeType(subtype)
  })

  it('Schema4 should be valid with singer type', () => {
    let singer = SingerType
    schema4.addType(singer)
    expect(isSuccess(schema4.validate())).toBe(true)
    schema4.removeType(singer)
  })
  it('Schema4 should be valid with a linkType which has a arrayType as baseType ', () => {
    let array = t.arrayOf(t.link(schema1, 'Person1'), 'array')
    schema4.addType(array)
    expect(isSuccess(schema4.validate())).toBe(true)
    schema4.removeType(array)
  })
  it('Shema4 should not be valid with a linkType which has a arrayType with a wrong path as baseType ', () => {
    let array = t.arrayOf(t.link(schema1, 'Person6'), 'array')
    schema4.addType(array)
    expect(isSuccess(schema4.validate())).toBe(false)
    schema4.removeType(array)
  })
  it('Schema4 should be valid with intersectionType with a linkType', () => {
    let array = t.intersectionOf([person1, person2], 'array')
    schema4.addType(array)
    expect(isSuccess(schema4.validate())).toBe(true)
    schema4.removeType(array)
  })
  it('Schema4 should not be valid with intersectionType with invalid linkType', () => {
    let array = t.intersectionOf([person1, t.object({ link: t.link(schema1, 'Person6') })], 'array')
    schema4.addType(array)
    expect(isSuccess(schema4.validate())).toBe(false)
    schema4.removeType(array)
  })
  it('Schema4 should be valid with objReferenceType with a linkType', () => {
    let ref = t.ref(person1, 'ref')
    schema4.addType(ref)
    expect(isSuccess(schema4.validate())).toBe(true)
    schema4.removeType(ref)
  })
  it('Shema4 should not be valid with objReferenceType with a wrong linkType', () => {
    let ref = t.ref(t.object({ link: t.link(schema1, 'Person6') }), 'ref')
    schema4.addType(ref)
    expect(isSuccess(schema4.validate())).toBe(false)
    schema4.removeType(ref)
  })
  it('Schema4 should be valid with unionType with a linkType', () => {
    let union = t.unionOf([person1, t.string], 'union')
    schema4.addType(union)
    expect(isSuccess(schema4.validate())).toBe(true)
    schema4.removeType(union)
  })
  it('Schema4 should not be valid with unionType with a wrong linkType ', () => {
    let union = t.unionOf([t.object({ link: t.link(schema1, 'Person6') }), t.string], 'union')
    schema4.addType(union)
    expect(isSuccess(schema4.validate())).toBe(false)
    schema4.removeType(union)
  })
  it('Schema4 should be valid with taggedUnionType with a linkType', () => {
    let tagUnion = t.taggedUnion(
      { prop1: t.link(schema1, 'Person1'), prop2: t.string },
      'd',
      'tagUnion'
    )
    schema4.addType(tagUnion)
    expect(isSuccess(schema4.validate())).toBe(true)
    schema4.removeType(tagUnion)
  })
  it('Shame4 should not be valid with taggedUnionType with a wrong linkType', () => {
    let tagUnion = t.taggedUnion(
      { prop1: t.link(schema1, 'Person6'), prop2: t.string },
      'd',
      'tagUnion'
    )
    schema4.addType(tagUnion)
    expect(isSuccess(schema4.validate())).toBe(false)
    schema4.removeType(tagUnion)
  })
  it('Test for a single valid linkType', () => {
    let link = t.link(schema1, 'Person1')
    let traversed = new Map()
    expect(isSuccess(link.validateLinks(traversed))).toBe(true)
  })
  it('Test for a single invalid linkType', () => {
    let link = t.link(schema1, 'Person6')
    let traversed = new Map()
    expect(isSuccess(link.validateLinks(traversed))).toBe(false)
  })
})
