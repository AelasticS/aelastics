import * as t from '../../../src/aelastics-types'
import { isSuccess, isFailure, Failure } from 'aelastics-result'
import * as examples from '../../example/recursive-example'

describe('Validate Cyclic intersection structures', () => {
  it("Testing correct  intersection is valid'", () => {
    const type = examples.objectWithIntersections
    let intersect = {
      a: { a: 'john', b: 'smith' },
      b: { a: 'tom', b: 'bob' }
    }
    expect(isSuccess(type.validate(intersect as any))).toBe(true)
  })

  it("Testing incorrect circular intersection is invalid'", () => {
    const type = examples.objectWithIntersections
    let intersect = {
      a: undefined,
      b: undefined
    }
    // @ts-ignore
    intersect.a = intersect
    // @ts-ignore
    intersect.b = intersect
    expect(isSuccess(type.validate(intersect as any))).toBe(false)
  })

  it("Testing if two attributes who have value of same object is valid'", () => {
    const type = examples.objectWithIntersections

    let o1 = {
      a: 'Something'
    }

    let ObjectInstance = {
      a: o1,
      b: o1
    }
    expect(isSuccess(type.validate(ObjectInstance as any))).toBe(false)
  })

  it("Testing if cyclic intersection is valid'", () => {
    const type = examples.recursiveIntersection
    examples.intersectionSchema.validate()

    let instance: t.TypeOf<typeof examples.recursiveIntersection> = {
      // b: 5,
      // c: 'Something',
      // a: {}
      a: { b: true, c: 'c', a: undefined },
      b: 'b'
    }

    instance.a.a = instance
    expect(isSuccess(type.validate(instance as any))).toBe(true)
  })
})
