import { isFailure, isSuccess } from 'aelastics-result'
import { arrayOfNumbers, arrayOfPeople, errorMessages } from '../testing-types'

describe('ToDTO tests for Array type', () => {
  it('should be valid toDTOtree for arrayOfNumbers', () => {
    const a = [15, 12, 25, 60]
    const res = arrayOfNumbers.toDTOtree(a)
    expect(isSuccess(res)).toBe(true)
  })

  it('should be valid toDTOtree value for arrayOfNumbers with satisfied constraints', () => {
    const a = [15, 12, 25, 60]
    const res = arrayOfNumbers.toDTOtree(a)
    if (isSuccess(res)) {
      expect(res.value).toEqual([15, 12, 25, 60])
    }
  })

  it('should be valid toDTOtree value for arrayOfNumbers with satisfied constraints', () => {
    const a = [15, 12, 25, 60]
    const res = arrayOfNumbers.toDTOtree(a)
    if (isSuccess(res)) {
      expect(res.value).toEqual([15, 12, 25, 60])
    }
  })

  it('should not be valid toDTOtree for arrayOfNumbers in case of unsatisfied constraints', () => {
    const a = [-15, 12, 25, 60]
    const res = arrayOfNumbers.toDTOtree(a)
    expect(isSuccess(res)).toBe(false)
  })

  it('should be valid toDTOtree value for arrayOfPeople', () => {
    const a = [
      { name: 'Nick', age: 25 },
      { name: 'Astrid', age: 32 },
      {
        name: 'Tim',
        age: 29
      }
    ]
    const res = arrayOfPeople.toDTOtree(a)
    if (isSuccess(res)) {
      expect(res.value).toEqual([
        { name: 'Nick', age: 25 },
        {
          name: 'Astrid',
          age: 32
        },
        { name: 'Tim', age: 29 }
      ])
    }
  })

  it('should be valid toDTOtree value for arrayOfPeople in case of extra fields', () => {
    const a = [
      { name: 'Nick', age: 25, hasPet: true },
      {
        name: 'Astrid',
        lastname: '',
        age: 32
      },
      { name: 'Tim', age: 29 }
    ]
    const res = arrayOfPeople.toDTOtree(a)
    if (isSuccess(res)) {
      expect(res.value).toEqual([
        { name: 'Nick', age: 25 },
        {
          name: 'Astrid',
          age: 32
        },
        { name: 'Tim', age: 29 }
      ])
    }
  })

  it('should be valid toDTOtree error message for arrayOfPeople in case of unsatisfied constraints', () => {
    const a = [
      { name: 'Nick', age: 25 },
      { name: 'Astrid121', age: 32 },
      {
        name: 'Tim',
        age: 29
      }
    ]
    const res = arrayOfPeople.toDTOtree(a)
    if (isFailure(res)) {
      expect(errorMessages(res)).toEqual(
        'Expected [1]:[object Object]/name:Astrid121 to be alphabetical, got `Astrid121`\n'
      )
    }
  })

  it('should be valid toDTOtree for arrayOfPeople in case of no validation', () => {
    const a = [
      { name: 'Nick', age: 25 },
      { name: 'Astrid', age: 32 },
      {
        name: 'Tim',
        age: 29
      }
    ]
    const res = arrayOfPeople.toDTOtree(a)
    expect(isSuccess(res)).toBe(true)
  })
})
