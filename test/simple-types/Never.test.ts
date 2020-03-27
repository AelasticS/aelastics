import * as t from '../../src/aelastics-types'
import { isSuccess } from 'aelastics-result'
import { errorMessages } from '../complex-types/testing-types'

describe('Test cases for never type', () => {
  let functionThrowingError = function() {
    throw new Error('error message')
  }
  let functionInfinityLoop = function() {
    while (true) {
      let x = 1 + 2
    }
  }

  let foo = function(): number {
    return 2
  }
  it('should be valid never type.', () => {
    const realNever = t.never
    expect(isSuccess(realNever.validate(functionThrowingError, []))).toBe(false)
  })

  it('should be valid never type for infinity loop.', () => {
    const realNever = t.never
    expect(isSuccess(realNever.validate(functionInfinityLoop, []))).toBe(false)
  })
})
