import * as t from '../../../src/aelastics-types'
import { isFailure, isSuccess, Result } from 'aelastics-result'

describe('toDTOtree tests for object type', () => {
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
  it('Testing toDTOtree for some object which has 2 number properties with no restriction', () => {
    const o: t.TypeOf<typeof numbersObjectType> = {
      a: -5,
      b: 3
    }
    const res = numbersObjectType.toDTOtree(o) as Result<t.DtoTypeOf<typeof numbersObjectType>>
    expect(isSuccess(res)).toBe(true)
    if (isSuccess(res)) {
      let res1: t.DtoTypeOf<typeof numbersObjectType>
      expect(res.value).toEqual({ a: -5, b: 3 })
    }
  })
  it("Testing toDTOtree for some object which has 2 where first doesn't comply with restrictions", () => {
    const o: t.TypeOf<typeof numbersObjectType> = {
      a: 5,
      b: 3
    }
    const res = numbersObjectType.toDTOtree(o)
    expect(isSuccess(res)).toBe(false)
  })
  it("Testing toDTOtree for some object which has 2 where first doesn't comply with restrictions (validation =false)", () => {
    const o: t.TypeOf<typeof numbersObjectType> = {
      a: 5,
      b: 3
    }
    const res = numbersObjectType.toDTOtree(o)
    if (isSuccess(res)) {
      expect(res.value).toEqual({
        a: 5,
        b: 3
      })
    }
  })
  it('Testing toDTOtree for empty object', () => {
    const emptyObjectType = t.object({})
    const o: t.TypeOf<typeof emptyObjectType> = {}
    const res = emptyObjectType.toDTOtree(o)
    if (isSuccess(res)) {
      expect(res.value).toEqual({})
    }
  })
  it('Testing toDTOtree for object with  object property', () => {
    const o: t.TypeOf<typeof objectWithObjectPropertyType> = {
      a: 3,
      b: {
        b1: 'afge',
        b2: 'Af'
      }
    }
    const res = objectWithObjectPropertyType.toDTOtree(o) as Result<
      t.DtoTypeOf<typeof objectWithObjectPropertyType>
    >
    expect(isSuccess(res)).toBe(true)
    if (isSuccess(res)) {
      expect(res.value).toEqual({ a: 3, b: { b1: 'afge', b2: 'Af' } })
    }
  })
  it("Testing toDTOtree for object with  object property whose property doesn't comply with restrictions", () => {
    const o: t.TypeOf<typeof objectWithObjectPropertyType> = {
      a: 3,
      b: {
        b1: 'afge',
        b2: 'Af243 '
      }
    }
    const res = objectWithObjectPropertyType.toDTOtree(o)
    expect(isSuccess(res)).toBe(false)
  })
  it("Testing toDTOtree error message for object with  object property whose property doesn't comply with restrictions", () => {
    const o: t.TypeOf<typeof objectWithObjectPropertyType> = {
      a: 3,
      b: {
        b1: 'afge',
        b2: 'Af243 '
      }
    }
    const res = objectWithObjectPropertyType.toDTOtree(o)
    expect(isFailure(res)).toBe(true)
    if (isFailure(res)) {
      expect(res.errors).toEqual([
        {
          code: 'ValidationError',
          message: 'Expected b:[object Object]/b2:Af243  to be alphanumeric, got `Af243 `',
          path: [
            { actual: { b1: 'afge', b2: 'Af243 ' }, segment: 'b' },
            { actual: 'Af243 ', segment: 'b2' }
          ],
          type: 'word',
          value: '"Af243 "'
        }
      ])
    }
  })
  test('object with keys', () => {
    const ident = ['name', 'id'] as const
    let ok = t.entity({ name: t.string, id: t.number }, ident)
    let oks = t.subtype(ok, { ekstra: t.number })
    let insKey: t.TypeOfKey<typeof ok> = { name: 'ime', id: 3 }
    let subtypeKey: t.TypeOfKey<typeof oks> = { name: 'ime', id: 8 }
    let s: t.TypeOf<typeof oks> = { id: 1, name: 's', ekstra: 5 }
    let s2: t.DtoTypeOfKey<typeof oks> = { id: 1, name: 's' }
  })
})
