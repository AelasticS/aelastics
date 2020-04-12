import { isFailure, isSuccess } from 'aelastics-result'
import { arrayOfNumbers, arrayOfPeople, errorMessages } from '../testing-types'

describe('ToDTO tests for Array type', () => {
  it('should be valid toDTO for arrayOfNumbers', () => {
    const a = [15, 12, 25, 60]
    const res = arrayOfNumbers.toDTO(a)
    expect(isSuccess(res)).toBe(true)
  })

  it('should be valid toDTO value for arrayOfNumbers with satisfied constraints', () => {
    const a = [15, 12, 25, 60]
    const res = arrayOfNumbers.toDTO(a)
    if (isSuccess(res)) {
      expect(res.value).toEqual({
        ref: { id: 1, category: 'Array', typeName: 'array of num' },
        array: [15, 12, 25, 60]
      })
    }
  })

  it('should not be valid toDTO for arrayOfNumbers in case of unsatisfied constraints', () => {
    const a = [-15, 12, 25, 60]
    const res = arrayOfNumbers.toDTO(a)
    expect(isSuccess(res)).toBe(false)
  })

  it('should be valid toDTO value for arrayOfPeople', () => {
    const a = [
      { name: 'Nick', age: 25 },
      { name: 'Astrid', age: 32 },
      {
        name: 'Tim',
        age: 29
      }
    ]
    const res = arrayOfPeople.toDTO(a)
    if (isSuccess(res)) {
      expect(res.value).toEqual({
        ref: { id: 4, category: 'Array', typeName: 'Array<person>' },
        array: [
          {
            ref: { id: 1, category: 'Object', typeName: 'person' },
            object: { name: 'Nick', age: 25 }
          },
          {
            ref: { id: 2, category: 'Object', typeName: 'person' },
            object: { name: 'Astrid', age: 32 }
          },
          {
            ref: { id: 3, category: 'Object', typeName: 'person' },
            object: { name: 'Tim', age: 29 }
          }
        ]
      })
    }
  })

  it('should be valid toDTO value for arrayOfPeople in case of extra fields', () => {
    const a = [
      { name: 'Nick', age: 25, hasPet: true },
      {
        name: 'Astrid',
        lastName: '',
        age: 32
      },
      { name: 'Tim', age: 29 }
    ]
    const res = arrayOfPeople.toDTO(a)
    if (isSuccess(res)) {
      expect(res.value).toEqual({
        ref: { id: 4, category: 'Array', typeName: 'Array<person>' },
        array: [
          {
            ref: { id: 1, category: 'Object', typeName: 'person' },
            object: { name: 'Nick', age: 25 }
          },
          {
            ref: { id: 2, category: 'Object', typeName: 'person' },
            object: { name: 'Astrid', age: 32 }
          },
          {
            ref: { id: 3, category: 'Object', typeName: 'person' },
            object: { name: 'Tim', age: 29 }
          }
        ]
      })
    }
  })

  it('should be valid toDTO error message for arrayOfPeople in case of unsatisfied constraints', () => {
    const a = [
      { name: 'Nick', age: 25 },
      { name: 'Astrid121', age: 32 },
      {
        name: 'Tim',
        age: 29
      }
    ]
    const res = arrayOfPeople.toDTO(a)
    if (isFailure(res)) {
      expect(errorMessages(res)).toEqual(
        'Expected [1]:[object Object]/name:Astrid121 to be alphabetical, got `Astrid121`\n'
      )
    }
  })

  it('should be valid toDTO for arrayOfPeople in case of no validation', () => {
    const a = [
      { name: 'Nick', age: 25 },
      { name: 'Astrid', age: 32 },
      { name: 'Tim', age: 29 }
    ]
    const res = arrayOfPeople.toDTO(a)
    expect(isSuccess(res)).toBe(true)
  })
})
