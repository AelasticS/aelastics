import * as t from '../../../src/aelastics-types'
import { isSuccess } from 'aelastics-result'
import { entity, TypeOfKey } from '../../../src/complex-types/ObjectType'
import { subtype } from '../../../src/aelastics-types'

describe('toDTO tests for object type', () => {
  const objectWithObjectPropertyType = t.object({
    a: t.number,
    b: t.object({
      b1: t.string,
      b2: t.string.derive('word').word
    })
  })
  const numbersObjectType = t.object({
    a: t.number.derive('negative').negative,
    b: t.number
  })
  it('Testing toDTO for some object which has 2 number properties with no restriction', () => {
    const o: t.TypeOf<typeof numbersObjectType> = {
      a: -5,
      b: 3
    }
    const res = numbersObjectType.toDTO(o, [])
    if (isSuccess(res)) {
      expect(res.value.a === -5 && res.value.b === 3).toBe(true)
    }
  })
  it("Testing toDTO for some object which has 2 where first doesn't comply with restrictions", () => {
    const o: t.TypeOf<typeof numbersObjectType> = {
      a: 5,
      b: 3
    }
    const res = numbersObjectType.toDTO(o, [])
    expect(isSuccess(res)).toBe(false)
  })
  it("Testing toDTO for some object which has 2 where first doesn't comply with restrictions (validation =false)", () => {
    const o: t.TypeOf<typeof numbersObjectType> = {
      a: 5,
      b: 3
    }
    const res = numbersObjectType.toDTO(o, [], false)
    if (isSuccess(res)) {
      expect(res.value).toEqual({
        a: 5,
        b: 3
      })
    }
  })
  it('Testing toDTO for empty object', () => {
    const emptyObjectType = t.object({})
    const o: t.TypeOf<typeof emptyObjectType> = {}
    const res = emptyObjectType.toDTO(o, [])
    if (isSuccess(res)) {
      expect(res.value).toEqual({})
    }
  })
  it('Testing toDTO for object with  object property', () => {
    const o: t.TypeOf<typeof objectWithObjectPropertyType> = {
      a: 3,
      b: {
        b1: 'afge',
        b2: 'Af'
      }
    }
    const res = objectWithObjectPropertyType.toDTO(o, [])
    if (isSuccess(res)) {
      expect(res.value.b.b2).toEqual('Af')
    }
  })
  it("Testing toDTO for object with  object property whose property doesn't comply with restrictions", () => {
    const o: t.TypeOf<typeof objectWithObjectPropertyType> = {
      a: 3,
      b: {
        b1: 'afge',
        b2: 'Af243 '
      }
    }
    const res = objectWithObjectPropertyType.toDTO(o, [])
    expect(isSuccess(res)).toBe(false)
  })
  it("Testing toDTO for object with  object property whose property doesn't comply with restrictions (validation =false)", () => {
    const o: t.TypeOf<typeof objectWithObjectPropertyType> = {
      a: 3,
      b: {
        b1: 'afge',
        b2: 'Af243 '
      }
    }
    const res = objectWithObjectPropertyType.toDTO(o, [], false)
    expect(isSuccess(res)).toBe(true)
  })
  test('object with keys', () => {
    const ident = ['name', 'id'] as const
    let ok = entity({ name: t.string, id: t.number }, ident)
    let oks = subtype(ok, { ekstra: t.number })
    let insKey: TypeOfKey<typeof ok> = { name: 'ime', id: 3 }
    let subtypeKey: TypeOfKey<typeof oks> = { name: 'ime', id: 8 }
  })
})
