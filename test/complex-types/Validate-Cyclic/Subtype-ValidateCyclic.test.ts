// import * as t from '../../../src/aelastics-types'
import { isSuccess, isFailure, Failure } from 'aelastics-result'
import * as examples from '../../example/recursive-example'

describe('Validate Cyclic subtype structures', () => {
  it('Testing if two atributes of object have the same subtype instance as value is valid', () => {
    const type = examples.objectWithSubtipes
    let o1 = {
      a: 'something',
      date: new Date('1995-12-17T03:24:00')
    }

    let o2 = {
      a: o1,
      b: o1
    }

    expect(isSuccess(type.validate(o2 as any))).toBe(true)
  })
  it("Testing if cyclic subtype is valid'", () => {
    const type = examples.recursiveSubtype
    examples.subtypeSchema.validate()
    let objectInstance = {
      a: 'something',
      b: 12,
      c: { a: false, b: {} }
    }
    objectInstance.c.b = objectInstance
    expect(isSuccess(type.validate(objectInstance as any))).toBe(true)
  })
})
