// import * as t from '../../../src/aelastics-types'
import { isSuccess, isFailure, Failure } from 'aelastics-result'
import * as examples from '../../example/recursive-example'

describe('Validate Cyclic map structures', () => {
  it("Testing if two map values are the same instance is valid'", () => {
    const type = examples.mapOfRootLevelObjects
    let second = {
      name: 'Something'
    }
    let root = {
      a: second,
      b: second
    }
    let map = new Map([
      ['a', root],
      ['b', root]
    ])
    expect(isSuccess(type.validate(map))).toBe(true)
  })

  it("Testing if cyclic map  is valid'", () => {
    const type = examples.rootMap
    examples.mapSchema.validate()
    let mapIstance = new Map([])

    mapIstance.set('key', {
      a: true,
      b: 11,
      c: 'Some string',
      d: mapIstance
    })

    expect(isSuccess(type.validate(mapIstance as any))).toBe(true)
  })
})
