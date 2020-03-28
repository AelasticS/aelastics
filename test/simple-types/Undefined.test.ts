import * as t from '../../src/aelastics-types'
import { isSuccess } from 'aelastics-result'

describe('Test cases for undefined type', () => {
  it('should be valid undefined type.', () => {
    const realUndefined = t.undefined
    let value = undefined
    expect(isSuccess(realUndefined.validate(value, []))).toBe(true)
  })

  it('should verify that null is not undefined type.', () => {
    const realUndefined = t.undefined
    let value = null
    expect(isSuccess(realUndefined.validate(value, []))).toBe(false)
  })

  it('should be valid undefined type for function returning void.', () => {
    const realUndefined = t.undefined
    let value = () => console.log('g')
    expect(isSuccess(realUndefined.validate(value(), []))).toBe(true)
  })

  it('should be valid undefined type for function returning undefined.', () => {
    const realUndefined = t.undefined
    let value = () => undefined
    expect(isSuccess(realUndefined.validate(value(), []))).toBe(true)
  })

  it('should verify that string is not undefined type.', () => {
    const realUndefined = t.undefined
    let value = 'some string'
    expect(isSuccess(realUndefined.validate(value, []))).toBe(false)
  })
})
