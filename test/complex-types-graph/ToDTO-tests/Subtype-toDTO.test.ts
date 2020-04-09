import * as t from '../../../src/aelastics-types'
import { isSuccess } from 'aelastics-result'
import { StudentType } from '../../example/types-example'

describe('Testing toDTO for Subtype', () => {
  const NumbersObjectType = t.object({
    a: t.number.derive('positive').positive
  })

  const numbersAndStringObjectType = t.subtype(NumbersObjectType, {
    b: t.string.derive('alphabetical').alphabetical
  })

  it('Testing toDTO for valid object of subtype', () => {
    const o: t.TypeOf<typeof numbersAndStringObjectType> = {
      a: 5,
      b: 'something'
    }
    const res = numbersAndStringObjectType.toDTO(o)
    if (isSuccess(res)) {
      expect(res.value.a === 5 && res.value.b === 'something').toBe(true)
    }
  })

  it('Testing toDTO for invalid value of property in object.', () => {
    const o: t.TypeOf<typeof numbersAndStringObjectType> = {
      a: -5,
      b: 'something'
    }
    const res = numbersAndStringObjectType.toDTO(o)
    if (isSuccess(res)) {
      expect(res.value.a === -5 && res.value.b === 'something').toBe(false)
    }
  })

  it('Testing toDTO for invalid property name in object.', () => {
    const o = {
      a: 5,
      bb: 'something'
    }
    const res = numbersAndStringObjectType.toDTO((o as unknown) as any)
    if (isSuccess(res)) {
      expect(res.value.a === 5 && res.value.b === 'something').toBe(false)
    }
  })

  it('Testing toDTO for valid object with extra properties.', () => {
    const o = {
      a: 5,
      b: 'something',
      c: 10
    }
    const res = numbersAndStringObjectType.toDTO(o)
    if (isSuccess(res)) {
      expect(res.value.a === 5 && res.value.b === 'something').toBe(true)
    }
  })

  it('Testing if student is valid dto subtype of child.', () => {
    const Student = {
      name: 'John',
      university: 'Stanford'
    }
    const res = StudentType.toDTO(Student)
    if (isSuccess(res)) {
      expect(res.value.name === 'John' && res.value.university === 'Stanford').toBe(true)
    }
  })

  it('Testing if student with invalid property is not valid dto subtype of child.', () => {
    const Student = {
      name: 'John',
      university: 5
    }
    const res = StudentType.toDTO((Student as unknown) as any)
    if (isSuccess(res)) {
      expect(res.value.name === 'John' && res.value.university === 'Stanford').toBe(false)
    }
  })

  it("Testing if student without property 'university' is not valid dto subtype of child.", () => {
    const Student = {
      name: 'John'
    }
    const res = StudentType.toDTO((Student as unknown) as any)
    if (isSuccess(res)) {
      expect(res.value.name === 'John' && res.value.university === 'Stanford').toBe(false)
    }
  })
})
