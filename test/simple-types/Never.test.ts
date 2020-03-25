import * as t from '../../src/aelastics-types'
import { isSuccess } from 'aelastics-result'
import { errorMessages } from '../complex-types/testing-types'

describe('Test cases for never type', () => {
  let functionNever = function() {
    // while(true) {
    //   let x = 1+2
    // }
    throw new Error('error message')
  }

  it('should be valid never type.', () => {
    const realNever = t.never
    let value = null
    expect(isSuccess(realNever.validate(functionNever, []))).toBe(true)
  })
})
