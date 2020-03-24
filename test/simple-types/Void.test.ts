import * as t from '../../src/aelastics-types'
import { isSuccess } from 'aelastics-result'

describe('Test cases for void type', () => {
  it("should verify that 'undefined' is void.", () => {
    const realVoid = t.voidType
    let value = undefined
    expect(isSuccess(realVoid.validate(value, []))).toBe(true)
  })

  it('should verify that number type is not void.', () => {
    const realVoid = t.voidType
    let value = 5
    expect(isSuccess(realVoid.validate(value, []))).toBe(false)
  })

  it("should verify that 'null' is not void.", () => {
    const realVoid = t.voidType
    let value = null
    expect(isSuccess(realVoid.validate(value, []))).toBe(false)
  })
})
