import * as t from '../..'
import { isSuccess } from 'aelastics-result'

describe('Test cases for undefined type', () => {
  it('should be valid undefined type.', () => {
    const realUndefined = t.undefinedType
    let value = undefined
    expect(isSuccess(realUndefined.validate(value))).toBe(true)
  })

  it('should verify that null is not undefined type.', () => {
    const realUndefined = t.undefinedType
    let value = null
    expect(isSuccess(realUndefined.validate(value as any))).toBe(false)
  })

  it('should verify that string is not undefined type.', () => {
    const realUndefined = t.undefinedType
    let value = 'some string'
    expect(isSuccess(realUndefined.validate(value as any))).toBe(false)
  })
})
