import * as t from '../../src/aelastics-types'
import { isSuccess } from 'aelastics-result'

describe('Test cases for null type', () => {
  it("should verify that 'null' is null type.", () => {
    const realNull = t.nullType
    let value = null
    expect(isSuccess(realNull.validate(value))).toBe(true)
  })

  it('should verify that number type is not null.', () => {
    const realNull = t.nullType
    let value = 5
    expect(isSuccess(realNull.validate(value))).toBe(false)
  })

  it("should verify that 'undefined' is not null.", () => {
    const realNull = t.nullType
    let value = undefined
    expect(isSuccess(realNull.validate(value))).toBe(false)
  })
})
