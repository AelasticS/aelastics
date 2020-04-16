// import * as t from '../../../src/aelastics-types'
import { isSuccess, isFailure, Failure } from 'aelastics-result'
import * as examples from '../../example/recursive-example'

describe('Validate Cyclic intersection structures', () => {
  it("Testing if two atributes who have value of same object is valid'", () => {
    const type = examples.objectWithIntersections

    let o1 = {
      a: 'Something'
    }

    let ObjectInstance = {
      a: o1,
      b: o1
    }
    expect(isSuccess(type.validate(ObjectInstance as any))).toBe(true)
  })

  it("Testing if cyclic intersection is valid'", () => {
    const type = examples.recursiveIntersection
    examples.intersectionSchema.validate()

    let instance = {
      b: 5,
      c: 'Something',
      a: {}
    }

    instance.a = instance

    expect(isSuccess(type.validate(instance as any))).toBe(true)
  })
})
