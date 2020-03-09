import { isFailure, isSuccess } from 'aelastics-result'
import * as examples from '../testing-types'
import * as t from '../../../src/aelastics-types'

describe('Testing fromDTO method of ObjectType', () => {
  it('should be valid fromDTO for examples.DateType', () => {
    let d = examples.DateType.fromDTO(
      {
        day: 10,
        month: 5,
        year: 2000
      },
      []
    )

    expect(isSuccess(d)).toBe(true)
  })
  it('should not be valid fromDTO for examples.DateType', () => {
    let d = examples.DateType.fromDTO(
      {
        day: 10,
        month: 15,
        year: 2000
      },
      []
    )

    expect(isSuccess(d)).toBe(false)
  })
  /**
   *  Testing wrong error message for function examples.DateType.fromDTO with input object
   * which has incorrect values of property month
   */

  it('should be valid error message fromDTO for invalid examples.DateType object', () => {
    let d = examples.DateType.fromDTO(
      {
        day: 10,
        month: 15,
        year: 2000
      },
      []
    )
    if (isFailure(d)) {
      expect(d.errors).toEqual([
        {
          code: 'ValidationError',
          message: 'Expected month:15 to be in range [1..12], got 15',
          path: [
            {
              actual: 15,
              segment: 'month'
            }
          ],
          type: '',
          value: '15'
        },
        {
          code: 'ValidationError',
          message: 'Expected  to be correct value of date, got [object Object]',
          path: [],
          type: 'date',
          value: '{"day":10,"year":2000}'
        }
      ])
    }
  })

  /**
   * Testing correct error message for function examples.EmployeeType.fromDTO with input object
   * which has incorrect relation between values of properties age and dateOfBirth
   */
  // here works correctly
  it('should be valid error message fromDTO for invalid examples.EmployeeType object', () => {
    let e = {
      name: 'Nick Ruffalo',
      employmentDate: {
        day: 25,
        month: 3,
        year: 2018
      },
      dateOfBirth: {
        day: 10,
        month: 5,
        year: 2000
      }
    }

    let emp = examples.EmployeeType.fromDTO(e, [])
    if (isFailure(emp)) {
      expect(emp.errors).toEqual([
        {
          code: 'ValidationError',
          message:
            'Expected  date of birth is in correct relation with date of employment (employee age 18 or more), got [object Object]',
          path: [],
          type: 'Worker',
          value:
            '{"name":"Nick Ruffalo","employmentDate":{"day":25,"month":3,"year":2018},"dateOfBirth":{"day":10,"month":5,"year":2000}}'
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
      name: 'Nikola Nikolic',
      employmentDate: {
        day: 25,
        month: 3,
        year: 2019
      },
      dateOfBirth: {
        day: 10,
        month: 15,
        year: 2000
      }
    }

    let emp = examples.EmployeeType.fromDTO(e, [])
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
      name: 'Nick Ruffalo',
      employmentDate: {
        day: 25,
        month: 3,
        year: 2017
      },
      dateOfBirth: {
        day: 10,
        month: 15,
        year: 2000
      }
    }

    let emp = examples.EmployeeType.fromDTO(e, [])
    if (isFailure(emp)) {
      let s = examples.errorMessages(emp)
      expect(s).toEqual(
        'Expected dateOfBirth:[object Object]/month:15 to be in range [1..12], got 15\n' +
          'Expected dateOfBirth:[object Object] to be correct value of date, got [object Object]\n' +
          'Expected  date of birth is in correct relation with date of employment (employee age 18 or more), got [object Object]\n' +
          "Cannot read property 'year' of undefined\n"
      )
    }
  })

  /*
   *Testing correct error message for function fromDTO with empty object as input
   */
  it('should be valid fromDTO for empty Object', () => {
    let emptyObj = t.object({})

    let emp = emptyObj.fromDTO({}, [])
    expect(isSuccess(emp)).toBe(true)
  })
})
