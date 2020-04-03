import { isFailure, isSuccess } from 'aelastics-result'
import * as examples from '../testing-types'
import * as t from '../../../src/aelastics-types'

describe('Testing fromDTO method of ObjectType', () => {
  it('should be valid fromDTO for examples.DateType', () => {
    let d = examples.DateType.fromDTO({
      ref: { id: 1, category: 'Object', typeName: 'date' },
      object: {
        day: 10,
        month: 5,
        year: 2000
      }
    })

    expect(isSuccess(d)).toBe(true)
  })
  it('should not be valid fromDTO for examples.DateType', () => {
    let d = examples.DateType.fromDTO({
      ref: { id: 1, category: 'Object', typeName: 'date' },
      object: {
        day: 10,
        month: 15,
        year: 2000
      }
    })

    expect(isSuccess(d)).toBe(false)
  })

  /**
   *  Testing wrong error message for function examples.DateType.fromDTO with input object
   * which has incorrect values of property month
   */

  it('should be valid error message fromDTO for invalid examples.DateType object', () => {
    let d = examples.DateType.fromDTO({
      ref: { id: 1, category: 'Object', typeName: 'date' },
      object: {
        day: 10,
        month: 15,
        year: 2000
      }
    })
    if (isFailure(d)) {
      expect(d.errors).toEqual([
        {
          code: undefined,
          message: 'missing property',
          path: [{ actual: undefined, segment: 'day' }],
          type: 'date',
          value: undefined
        },
        {
          code: undefined,
          message: 'missing property',
          path: [{ actual: undefined, segment: 'month' }],
          type: 'date',
          value: undefined
        },
        {
          code: undefined,
          message: 'missing property',
          path: [{ actual: undefined, segment: 'year' }],
          type: 'date',
          value: undefined
        },
        {
          code: undefined,
          message:
            "Input data is graph. Value : '[object Object]' of type 'date' has more then one reference!",
          path: [],
          type: 'date',
          value: undefined
        }
      ])
    }
  })

  /**
   * Testing correct error message for function examples.EmployeeType.fromDTO with input object
   * which has incorrect relation between values of properties employmentDate and dateOfBirth
   */
  // here works correctly
  it('should be valid error message fromDTO for invalid examples.EmployeeType object', () => {
    let e = {
      ref: { id: 1, category: 'Object', typeName: 'Worker' },
      object: {
        name: 'Nick Ruffalo',
        employmentDate: {
          ref: { id: 2, category: 'Object', typeName: 'date' },
          object: {
            day: 25,
            month: 3,
            year: 2016
          }
        },
        dateOfBirth: {
          ref: { id: 3, category: 'Object', typeName: 'date' },
          object: {
            day: 10,
            month: 5,
            year: 2000
          }
        }
      }
    }

    let emp = examples.EmployeeType.fromDTO(e)
    if (isFailure(emp)) {
      expect(emp.errors).toEqual([
        {
          code: undefined,
          message: 'missing property',
          path: [{ actual: undefined, segment: 'name' }],
          type: 'Worker',
          value: undefined
        },
        {
          code: undefined,
          message: 'missing property',
          path: [{ actual: undefined, segment: 'employmentDate' }],
          type: 'Worker',
          value: undefined
        },
        {
          code: undefined,
          message: 'missing property',
          path: [{ actual: undefined, segment: 'dateOfBirth' }],
          type: 'Worker',
          value: undefined
        },
        {
          code: undefined,
          message:
            "Input data is graph. Value : '[object Object]' of type 'Worker' has more then one reference!",
          path: [],
          type: 'Worker',
          value: undefined
        }
      ])
    }
  })

  /*
   *Testing wrong error message for function examples.EmployeeType.fromDTO with input object
   * which has incorrect value of property dateOfBirth - more than one error
   */
  it('should not be valid error message fromDTO for invalid examples.EmployeeType object', () => {
    let e = {
      ref: { id: 1, category: 'Object', typeName: 'Worker' },
      object: {
        name: 'Nikola Nikolic',
        employmentDate: {
          ref: { id: 2, category: 'Object', typeName: 'date' },
          object: {
            day: 25,
            month: 3,
            year: 2019
          }
        },
        dateOfBirth: {
          ref: { id: 3, category: 'Object', typeName: 'date' },
          object: {
            day: 10,
            month: 15,
            year: 2000
          }
        }
      }
    }

    let emp = examples.EmployeeType.fromDTO(e)
    if (isFailure(emp)) {
      expect(emp.errors).not.toEqual([
        {
          code: 'ValidationError',
          message:
            'Expected  that number of age is in correct realtion with date of birth, got [object Object]',
          path: [],
          type: 'Worker',
          value: '{"name":"Nikola Nikolic","age":19,"dateOfBirth":{"day":10,"month":5,"year":2000}}'
        }
      ])
    }
  })

  /*
   *Testing correct error message for function examples.EmployeeType.fromDTO with input object
   * which has incorrect value of property dateOfBirth - more than one error
   */
  it('should be valid error message fromDTO for invalid examples.EmployeeType object with more than one error', () => {
    let e = {
      ref: { id: 1, category: 'Object', typeName: 'Worker' },
      object: {
        name: 'Nick Ruffalo',
        employmentDate: {
          ref: { id: 2, category: 'Object', typeName: 'date' },
          object: {
            day: 25,
            month: 3,
            year: 2017
          }
        },
        dateOfBirth: {
          ref: { id: 3, category: 'Object', typeName: 'date' },
          object: {
            day: 10,
            month: 15,
            year: 2000
          }
        }
      }
    }

    let emp = examples.EmployeeType.fromDTO(e)
    if (isFailure(emp)) {
      let s = examples.errorMessages(emp)
      expect(s).toEqual(
        "missing property\nmissing property\nmissing property\nInput data is graph. Value : '[object Object]' of type 'Worker' has more then one reference!\n"
      )
    }
  })

  /*
   *Testing correct error message for function fromDTO with empty object as input
   */
  it('should be valid fromDTO for empty Object', () => {
    let emptyObj = t.object({})

    let emp = emptyObj.fromDTO({ ref: { id: 1, category: 'Object', typeName: '' }, object: {} })
    expect(isSuccess(emp)).toBe(true)
  })
})
