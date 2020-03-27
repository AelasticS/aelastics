import { isFailure, isSuccess } from 'aelastics-result'
import * as t from '../../../src/aelastics-types'
import * as at from '../../../src/complex-types/Array'
import * as examples from '../testing-types'

describe('Tests for Array method fromDTO', () => {
  /**
   * Testing fromDTO with input array of numbers
   */
  it('should be valid fromDTO for array of numbers', () => {
    let arrayOfNumbers = at.arrayOf(t.number, 'arrayOfNumbers')
    let a = arrayOfNumbers.fromDTO([5, 10, 25, 150])
    expect(isSuccess(a)).toBe(true)
  })
  /**
   * Testing fromDTO with input array of numbers where constraint is not fulfilled
   */
  it('should not be valid fromDTO for array of numbers', () => {
    let arrayOfNumbers = at.arrayOf(t.number.derive('').negative, 'arrayOfNumbers')
    let a = arrayOfNumbers.fromDTO([5, 10, -25, -150], [])
    if (isFailure(a)) {
      expect(a.errors).toEqual([
        {
          code: 'ValidationError',
          message: 'Expected  to be negative, got 5',
          path: [],
          type: '',
          value: '5'
        },
        {
          code: 'ValidationError',
          message: 'Expected  to be negative, got 10',
          path: [],
          type: '',
          value: '10'
        }
      ])
    }
  })
  /**
   * Testing fromDTO with input array of strings where constraint is not fulfilled
   */
  it('should not be valid fromDTO for array of strings', () => {
    let arrayOfStrings = at.arrayOf(t.string.derive('').lowercase.includes('.'), 'arrayOfStrings')
    let a = arrayOfStrings.fromDTO(['a.bcd', 'Abc', 'a.'], [])
    if (isFailure(a)) {
      expect(a.errors).toEqual([
        {
          code: 'ValidationError',
          message: 'Expected  to include `.`, got `Abc`',
          path: [],
          type: '',
          value: '"Abc"'
        },
        {
          code: 'ValidationError',
          message: 'Expected  to be lowercase, got `Abc`',
          path: [],
          type: '',
          value: '"Abc"'
        }
      ])
    }
  })

  /**
   * Testing fromDTO for array of EmployeeType objects
   */
  it('should be valid fromDTO for array of EmployeeType objects', () => {
    let arrayOfEmployees = at.arrayOf(examples.EmployeeType, 'arrayOfEmployees')
    let emps = [
      {
        name: 'Jovan',
        employmentDate: {
          day: 4,
          month: 4,
          year: 2019
        },
        dateOfBirth: {
          day: 10,
          month: 5,
          year: 2000
        }
      },
      {
        name: 'Petar',
        employmentDate: {
          day: 13,
          month: 5,
          year: 2018
        },
        dateOfBirth: {
          day: 10,
          month: 5,
          year: 2000
        }
      }
    ]
    let a = arrayOfEmployees.fromDTO(emps, [])
    expect(isSuccess(a)).toBe(true)
  })

  /**
   * Testing fromDTO with input array of empty objects for array of EmployeeType objects
   */
  it('should not be valid fromDTO for array of EmployeeType objects in case of empty object', () => {
    let arrayOfEmployees = at.arrayOf(t.object({}), 'arrayOfEmployees')
    let a = arrayOfEmployees.fromDTO([{}, {}, {}], [])
    if (isFailure(a)) {
      expect(a.errors).toEqual([
        {
          code: undefined,
          message: 'Value is not array',
          path: [],
          type: 'arrayOfEmployees',
          value: '[{},{},{}]'
        }
      ])
    }
  })

  /**
   * Testing fromDTO with input array of objects with incorrect relation between values dateOfBirth and age for array of EmployeeType objects
   */
  // no validation message?
  it('should not be valid fromDTO for array of EmployeeType objects in case of incorrect relation between properties', () => {
    let arrayOfEmployees = at.arrayOf(examples.EmployeeType, 'arrayOfEmployees')
    let emps = [
      {
        name: 'John',
        employmentDate: {
          day: 25,
          month: 3,
          year: 2016
        },
        dateOfBirth: {
          day: 10,
          month: 5,
          year: 2000
        }
      }
    ]
    let a = arrayOfEmployees.fromDTO(emps, [])
    if (isFailure(a)) {
      expect(a.errors).toEqual([
        {
          code: 'ValidationError',
          message:
            'Expected  date of birth is in correct relation with date of employment (employee age 18 or more), got [object Object]',
          path: [],
          type: 'Worker',
          value:
            '{"name":"John","employmentDate":{"day":25,"month":3,"year":2016},"dateOfBirth":{"day":10,"month":5,"year":2000}}'
        }
      ])
    }
  })
})
