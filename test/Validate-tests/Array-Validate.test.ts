import * as at from '../../src/complex-types/Array'
import * as t from '../../src/aelastics-types'
import { isSuccess } from 'aelastics-result'
import * as examples from '../complex-types-graph/testing-types'

describe('Array test cases', () => {
  /**
   * Testing if array of numbers is null
   */

  it("should not be Array of Number values in case of 'null' value", () => {
    let arrayOfNumbers = at.arrayOf(t.number, 'arrayOfNumbers')
    let a = null
    expect(isSuccess(arrayOfNumbers.validate((a as unknown) as []))).toBe(false)
  })

  /**
   * Testing if array of numbers is array of null values
   */
  it("should not be Array of Number values in case of array of 'null' values", () => {
    let arrayOfNumbers = at.arrayOf(t.number, 'arrayOfNumbers')
    let a = [null, null, null]
    expect(isSuccess(arrayOfNumbers.validate((a as unknown) as []))).toBe(false)
  })

  /**
   * Testing if array of numbers is undefined
   */
  it("should not be Array of Number values in case of 'undefined' value", () => {
    let arrayOfNumbers = at.arrayOf(t.number.derive(''), 'arrayOfNumbers')
    let a = undefined
    expect(isSuccess(arrayOfNumbers.validate((a as unknown) as []))).toBe(false)
  })
  /**
   * Testing if array of numbers is array of undefined values
   */
  // failed
  it("should not be Array of Number values in case of array of 'undefined' values", () => {
    let arrayOfNumbers = at.arrayOf(t.number, 'arrayOfNumbers')
    let a = [undefined, undefined]
    expect(isSuccess(arrayOfNumbers.validate((a as unknown) as []))).toBe(false)
  })
  /**
   * Testing if array of numbers is valid
   */
  it('should be Array of Number values', () => {
    let arrayOfNumbers = at.arrayOf(t.number.derive(''), 'arrayOfNumbers')
    let a = [5, 5, 2]
    expect(isSuccess(arrayOfNumbers.validate(a))).toBe(true)
  })
  /**
   * Testing if array of numbers with constraints for type number is valid
   */
  it('should be Array of positive and in range Number values ', () => {
    let arrayOfNumbers = at.arrayOf(t.number.derive('').positive.inRange(1, 15), 'arrayOfNumbers')
    let a = [5, 15, 2]
    expect(isSuccess(arrayOfNumbers.validate(a))).toBe(true)
  })
  /**
   * Testing if array of numbers with constraints for type number is valid. Case when constraints are not fulfilled
   */
  it('should not be Array of positive and in range Number values in case of array with negative values', () => {
    let arrayOfNumbers = at.arrayOf(t.number.derive('').positive.inRange(1, 15), 'arrayOfNumbers')
    let a = [5, 15, -2]
    expect(isSuccess(arrayOfNumbers.validate(a))).toBe(false)
  })
  /**
   * Testing if array of strings is valid
   */
  it('should be Array of String values', () => {
    let arrayOfStrings = at.arrayOf(t.string, 'arrayOfStrings')
    let a = ['a', 'abcd']
    expect(isSuccess(arrayOfStrings.validate(a))).toBe(true)
  })
  /**
   * Testing if array of strings is valid. Case when it isn't
   */
  it('should not be Array of String values in case of array of number values', () => {
    let arrayOfStrings = at.arrayOf(t.string.derive(''), 'arrayOfStrings')
    let a = ['5', 15, -2]
    expect(isSuccess(arrayOfStrings.validate((a as unknown) as []))).toBe(false)
  })
  /**
   * Testing if array of strings with constraints for type string is valid
   */
  // failed
  it('should be Array of lowercase String values with constraints max length and includes', () => {
    let arrayOfStrings = at.arrayOf(
      t.string
        .derive('arrayOfStrings')
        .maxLength(10)
        .includes('.').lowercase,
      'arrayOfStrings'
    )
    let a = ['ab.cd', ',.', 'a.a']
    expect(isSuccess(arrayOfStrings.validate(a))).toBe(true)
  })
  /**
   * Testing if array of strings with constraints for type string is valid. Case when constraints are not fulfilled
   */
  // doesn't work as it should
  it('should not be Array of lowercase String values with constraints max length and includes', () => {
    let arrayOfStrings = at.arrayOf(
      t.string
        .derive('')
        .maxLength(10)
        .includes('.').lowercase,
      'arrayOfStrings'
    )
    let a = ['abc.d', ',', 'A.']
    expect(isSuccess(arrayOfStrings.validate(a))).toBe(false)
  })
  /**
   * Testing if array of bool values is valid.
   */
  it('should be Array of Boolean values', () => {
    let arrayOfBoolV = at.arrayOf(t.boolean, 'arrayOfBoolV')
    let a = [true, false, true]
    expect(isSuccess(arrayOfBoolV.validate(a))).toBe(true)
  })
  /**
   * Testing if array of boolean values is valid. Case when it isn't
   */
  it('should not be Array of Boolean values in case of array of string values', () => {
    let arrayOfBoolV = at.arrayOf(t.boolean, 'arrayOfBoolV')
    let a = ['true']
    expect(isSuccess(arrayOfBoolV.validate((a as unknown) as []))).toBe(false)
  })
  /**
   * Testing if array of boolean values is valid
   */
  it('should not be Array of Boolean values in case error', () => {
    let arrayOfBoolV = at.arrayOf(t.boolean, 'arrayOfBoolV')
    let a = function(): never {
      throw new Error()
    }
    expect(isSuccess(arrayOfBoolV.validate((a as unknown) as []))).toBe(false)
  })
  /**
   * Testing if array of empty objects is valid
   */
  it('should be Array of empty Object values', () => {
    let arrayOfObjects = at.arrayOf(t.object({}), 'arrayOfObjects')
    let a = [{}, {}]
    expect(isSuccess(arrayOfObjects.validate(a))).toBe(true)
  })

  /**
   * Testing if array of objects is array of undefined values
   */
  it("should not be Array of empty Object values in case of array of 'undefined' values", () => {
    let arrayOfObjects = at.arrayOf(t.object({}), 'arrayOfObjects')
    let a = [undefined, undefined]
    expect(isSuccess(arrayOfObjects.validate((a as unknown) as []))).toBe(false)
  })
  /**
   * Testing if array of objects is array of null values
   */
  it("should not be Array of empty Object values in case of array of 'null' values", () => {
    let arrayOfObjects = at.arrayOf(t.object({}), 'arrayOfObjects')
    let a = [null, null]
    expect(isSuccess(arrayOfObjects.validate((a as unknown) as []))).toBe(false)
  })
  /**
   * Testing if array of objects is array of strings
   */
  it('should not be Array of empty Object values in case of array of string values', () => {
    let arrayOfObjects = at.arrayOf(t.object({}), 'arrayOfObjects')
    let a = ['abcd', 'ab']
    expect(isSuccess(arrayOfObjects.validate(a))).toBe(false)
  })
  /**
   * Testing if array of objects is array of numbers
   */
  it('should not be Array of empty Object values in case of array of number values', () => {
    let arrayOfObjects = at.arrayOf(t.object({}), 'arrayOfObjects')
    let a = [5, 10]
    expect(isSuccess(arrayOfObjects.validate(a))).toBe(false)
  })

  /**
   * Testing if array of DateType objects is valid.
   */
  it("should be Array of Object 'DateType' values", () => {
    let arrayOfObjects = at.arrayOf(examples.DateType, 'arrayOfObjects')
    let a = [
      {
        day: 10,
        month: 5,
        year: 2000
      },
      {
        day: 10,
        month: 5,
        year: 2000
      }
    ]
    expect(isSuccess(arrayOfObjects.validate(a))).toBe(true)
  })
  /**
   * Testing if array of DateType objects is valid. Case when it's not valid.
   */
  it("should not be Array of Object 'DateType' values", () => {
    let arrayOfObjects = at.arrayOf(examples.DateType, 'arrayOfObjects')
    let a = [
      {
        day: 10,
        month: 15,
        year: 2000
      },
      {
        day: 10,
        month: 5,
        year: 2000
      }
    ]
    expect(isSuccess(arrayOfObjects.validate(a))).toBe(false)
  })

  /**
   * Testing if array of EmployeeType objects is valid
   */
  it("should be Array of Object 'EmployeeType' values", () => {
    let arrayOfObjects = at.arrayOf(examples.EmployeeType, 'arrayOfObjects')
    let emp = [
      {
        name: 'Jovan',
        employmentDate: {
          day: 25,
          month: 3,
          year: 2018
        },
        dateOfBirth: {
          day: 31,
          month: 12,
          year: 1997
        }
      },
      {
        name: 'Petar',
        employmentDate: {
          day: 4,
          month: 10,
          year: 2018
        },
        dateOfBirth: {
          day: 14,
          month: 7,
          year: 1997
        }
      }
    ]
    expect(isSuccess(arrayOfObjects.validate(emp))).toBe(true)
  })
  /**
   * Testing if array of EmployeeType objects is valid. Case with incorrect proprety values.
   */
  it("should not be Array of Object 'EmployeeType' values", () => {
    let arrayOfObjects = at.arrayOf(examples.EmployeeType, 'arrayOfObjects')
    let emp = [
      {
        name: 'Jovan',
        employmentDate: {
          day: 25,
          month: 3,
          year: 2010
        },
        dateOfBirth: {
          day: 31,
          month: 5,
          year: 1996
        }
      },
      {
        name: 'Petar',
        employmentDate: {
          day: 25,
          month: 3,
          year: 2018
        },
        dateOfBirth: {
          day: 14,
          month: 7,
          year: 1997
        }
      }
    ]
    expect(isSuccess(arrayOfObjects.validate(emp))).toBe(false)
  })
  /**
   * Testing if array of EmployeeType objects is array of empty objects.
   */
  it("should not be Array of Object 'EmployeeType' values in case of array of empty objects", () => {
    let arrayOfObjects = at.arrayOf(examples.EmployeeType, 'arrayOfObjects')
    let emp = [{}, {}]
    expect(isSuccess(arrayOfObjects.validate((emp as unknown) as []))).toBe(false)
  })

  /**
   * Testing if matrix of number values with constraints for type number is valid
   */
  it('should be matrix of negative, less than and in range Number values', () => {
    let matrix = at.arrayOf(
      at.arrayOf(
        t.number
          .derive('')
          .negative.lessThan(-5)
          .inRange(-20, -3)
      ),
      'matrix'
    )
    let a = [
      [-6, -10],
      [-12, -10]
    ]
    expect(isSuccess(matrix.validate(a))).toBe(true)
  })
  /**
   * Testing if matrix of number values with constraints for type number is valid. Case when constraints are not fulfilled
   */
  it('should not be matrix of negative, less than and in range Number values', () => {
    let matrix = at.arrayOf(
      at.arrayOf(
        t.number
          .derive('')
          .negative.lessThan(-5)
          .inRange(-20, -3)
      ),
      'matrix'
    )
    let a = [
      [-5, 10],
      [-12, -10]
    ]
    expect(isSuccess(matrix.validate(a))).toBe(false)
  })
})
