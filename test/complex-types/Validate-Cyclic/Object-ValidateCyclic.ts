import * as t from '../../../src/aelastics-types'
import { isSuccess, isFailure, Failure } from 'aelastics-result'
import * as examples from '../../example/recursive-example'

describe('ObjectTest', () => {
  it("Testing if empty object is 'empty object'", () => {
    const type = examples.rootLevelLevelObject
    let second = {
      name: 'Something'
    }
    let root = {
      a: second,
      b: second
    }
    expect(isSuccess(type.validate(root))).toBe(true)
  })
})
