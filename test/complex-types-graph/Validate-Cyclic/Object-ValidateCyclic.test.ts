// import * as t from '../../../src/aelastics-types'
import { isSuccess, isFailure, Failure } from 'aelastics-result'
import * as examples from '../../example/recursive-example'

describe('Validate Cyclic object structures', () => {
  it("Testing if two atributes who have value of same object is valid'", () => {
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
  it("Testing if cyclic object is valid'", () => {
    const type = examples.companyType
    examples.schema.validate()
    let companyInstance = {
      name: 'BMW',
      city: 'Berlin',
      director: {
        firstName: 'Petar',
        lastName: 'Petrovic',
        company: {}
      }
    }
    companyInstance.director.company = companyInstance
    expect(isSuccess(type.validate(companyInstance))).toBe(true)
  })
})
