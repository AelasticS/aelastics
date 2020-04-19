import * as t from '../../../src/aelastics-types'
import { isFailure, isSuccess, Result } from 'aelastics-result'
import { StudentType } from '../../example/types-example'

describe('Testing toDTOtree for Subtype', () => {
  const NumbersObjectType = t.object({
    a: t.number.derive('positive').positive
  })

  const numbersAndStringObjectType = t.subtype(NumbersObjectType, {
    b: t.string.derive('alphabetical').alphabetical
  })

  it('Testing toDTOtree for valid object of subtype', () => {
    const o: t.TypeOf<typeof numbersAndStringObjectType> = {
      a: 5,
      b: 'something'
    }
    const res = numbersAndStringObjectType.toDTOtree(o) as Result<
      t.DtoTypeOf<typeof numbersAndStringObjectType>
    >
    expect(isSuccess(res)).toBe(true)
    if (isSuccess(res)) {
      expect(res.value).toEqual({ a: 5, b: 'something' })
    }
  })

  it('Testing toDTOtree for invalid value of property in object.', () => {
    const o: t.TypeOf<typeof numbersAndStringObjectType> = {
      a: -5,
      b: 'something'
    }
    const res = numbersAndStringObjectType.toDTOtree(o) as Result<
      t.DtoTypeOf<typeof numbersAndStringObjectType>
    >
    expect(isFailure(res)).toBe(true)
  })

  it('Testing toDTOtree for invalid property name in object.', () => {
    const o = {
      a: 5,
      bb: 'something'
    }
    const res = numbersAndStringObjectType.toDTOtree((o as unknown) as any) as Result<
      t.DtoTypeOf<typeof numbersAndStringObjectType>
    >
    expect(isFailure(res)).toBe(true)
    if (isFailure(res)) {
      expect(res.errors).toEqual([
        {
          code: undefined,
          message: 'missing property',
          path: [{ actual: undefined, segment: 'b' }],
          type: 'subtype of { a: positive })',
          value: undefined
        }
      ])
    }
  })

  it('Testing toDTOtree for valid object with extra properties.', () => {
    const o = {
      a: 5,
      b: 'something',
      c: 10
    }
    const res = numbersAndStringObjectType.toDTOtree(o) as Result<
      t.DtoTypeOf<typeof numbersAndStringObjectType>
    >
    expect(isSuccess(res)).toBe(true)
    if (isSuccess(res)) {
      expect(res.value).toEqual({ a: 5, b: 'something' })
    }
  })

  it('Testing if student is valid dto subtype of child.', () => {
    const Student = {
      name: 'John',
      university: 'Stanford'
    }
    const res = StudentType.toDTOtree(Student) as Result<t.DtoTypeOf<typeof StudentType>>
    expect(isSuccess(res)).toBe(true)
  })

  it('Testing if student with invalid property is not valid dto subtype of child.', () => {
    const Student = {
      name: 'John',
      university: 5
    }
    const res = StudentType.toDTOtree((Student as unknown) as any) as Result<
      t.DtoTypeOf<typeof StudentType>
    >
    expect(isFailure(res)).toBe(true)
    if (isFailure(res)) {
      expect(res.errors).toEqual([
        {
          code: 'ValidationError',
          message: 'Value university:5: "5" is not of type "university:5',
          path: [{ actual: 5, segment: 'university' }],
          type: 'string',
          value: '5'
        }
      ])
    }
  })

  it("Testing if student without property 'university' is not valid dto subtype of child.", () => {
    const Student = {
      name: 'John'
    }
    const res = StudentType.toDTOtree((Student as unknown) as any) as Result<
      t.DtoTypeOf<typeof StudentType>
    >
    expect(isFailure(res)).toBe(true)
  })
})
