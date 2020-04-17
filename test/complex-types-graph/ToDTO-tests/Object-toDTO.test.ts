import * as t from '../../../src/aelastics-types'
import { isFailure, isSuccess } from 'aelastics-result'

describe('toDTO tests for object type', () => {
  const objectWithObjectPropertyType = t.object(
    {
      a: t.number,
      b: t.object(
        {
          b1: t.string,
          b2: t.string.derive('word').word
        },
        'Nested object'
      )
    },
    'Complex object'
  )
  const numbersObjectType = t.object(
    {
      a: t.number.derive('negative').negative,
      b: t.number
    },
    'Numbers object type'
  )

  it('Testing toDTO for some object which has 2 number properties with no restriction', () => {
    const o: t.TypeOf<typeof numbersObjectType> = {
      a: -5,
      b: 3
    }
    const res = numbersObjectType.toDTO(o)
    expect(isSuccess(res)).toBe(true)
    if (isSuccess(res)) {
      expect(res.value).toEqual({
        ref: { category: 'object', id: 1, typeName: 'Numbers object type' },
        object: { a: -5, b: 3 }
      })
    }
  })

  it("Testing toDTO for some object which has 2 where first doesn't comply with restrictions", () => {
    const o: t.TypeOf<typeof numbersObjectType> = {
      a: 5,
      b: 3
    }
    const res = numbersObjectType.toDTO(o)
    expect(isSuccess(res)).toBe(false)
  })

  it("Testing toDTO error message for some object which has 2 where first doesn't comply with restrictions", () => {
    const o: t.TypeOf<typeof numbersObjectType> = {
      a: 5,
      b: 3
    }
    const res = numbersObjectType.toDTO(o)
    if (isSuccess(res)) {
      expect(res.value).toEqual({
        a: 5,
        b: 3
      })
    }
    if (isFailure(res)) {
      expect(res.errors).toEqual([
        {
          code: 'ValidationError',
          message: 'Expected a:5 to be negative, got 5',
          path: [{ actual: 5, segment: 'a' }],
          type: 'negative',
          value: '5'
        }
      ])
    }
  })

  it('Testing toDTO for empty object', () => {
    const emptyObjectType = t.object({})
    const o: t.TypeOf<typeof emptyObjectType> = {}
    const res = emptyObjectType.toDTO(o)
    if (isSuccess(res)) {
      expect(res.value).toEqual({
        object: {},
        ref: { category: 'object', id: 1, typeName: '{  }' }
      })
    }
  })

  it('Testing toDTO for object with  object as property', () => {
    const o: t.TypeOf<typeof objectWithObjectPropertyType> = {
      a: 3,
      b: {
        b1: 'B1',
        b2: 'Af'
      }
    }
    const res = objectWithObjectPropertyType.toDTO(o)
    if (isSuccess(res)) {
      expect(res.value).toEqual({
        object: {
          a: 3,
          b: {
            ref: { id: 2, category: 'object', typeName: 'Nested object' },
            object: { b1: 'B1', b2: 'Af' }
          }
        },
        ref: { id: 1, category: 'object', typeName: 'Complex object' }
      })
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
    const res = objectWithObjectPropertyType.toDTO(o)
    expect(isSuccess(res)).toBe(false)
  })

  it("Testing toDTO error message for object with  object property whose property doesn't satisfy restrictions ", () => {
    const o: t.TypeOf<typeof objectWithObjectPropertyType> = {
      a: 3,
      b: {
        b1: 'afge',
        b2: 'Af243 '
      }
    }
    const res = objectWithObjectPropertyType.toDTO(o)
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
