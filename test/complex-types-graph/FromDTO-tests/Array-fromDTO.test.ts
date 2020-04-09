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
    let a = arrayOfNumbers.fromDTO({
      ref: { id: 1, category: 'Array', typeName: 'Array' },
      array: [5, 10, 25, 150]
    })
    expect(isSuccess(a)).toBe(true)
  })
  /**
   * Testing fromDTO with input array of numbers where constraint is not fulfilled
   */
  it('should not be valid fromDTO for array of numbers', () => {
    let arrayOfNumbers = at.arrayOf(t.number.derive('').negative, 'arrayOfNumbers')
    let a = arrayOfNumbers.fromDTO({
      ref: { id: 1, category: 'Array', typeName: 'Array' },
      array: [5, 10, -25, -150]
    })
    if (isFailure(a)) {
      expect(a.errors).toEqual([
        {
          code: undefined,
          message: 'Internal method fromDTOCyclic not implemented',
          path: [],
          type: '5',
          value: undefined
        },
        {
          code: undefined,
          message: 'Internal method fromDTOCyclic not implemented',
          path: [],
          type: '10',
          value: undefined
        },
        {
          code: undefined,
          message: 'Internal method fromDTOCyclic not implemented',
          path: [],
          type: '-25',
          value: undefined
        },
        {
          code: undefined,
          message: 'Internal method fromDTOCyclic not implemented',
          path: [],
          type: '-150',
          value: undefined
        },
        {
          code: undefined,
          message:
            "Input data is graph. Value : '[object Object]' of type 'arrayOfNumbers' has more then one reference!",
          path: [],
          type: 'arrayOfNumbers',
          value: undefined
        }
      ])
    }
  })
  /**
   * Testing fromDTO with input array of strings where constraint is not fulfilled
   */
  it('should not be valid fromDTO for array of strings', () => {
    let arrayOfStrings = at.arrayOf(t.string.derive('').lowercase.includes('.'), 'arrayOfStrings')
    let a = arrayOfStrings.fromDTO({
      ref: { id: 1, category: 'Array', typeName: 'Array' },
      array: ['a.bcd', 'Abc', 'a.']
    })
    if (isFailure(a)) {
      expect(a.errors).toEqual([
        {
          code: undefined,
          message: 'Internal method fromDTOCyclic not implemented',
          path: [],
          type: 'a.bcd',
          value: undefined
        },
        {
          code: undefined,
          message: 'Internal method fromDTOCyclic not implemented',
          path: [],
          type: 'Abc',
          value: undefined
        },
        {
          code: undefined,
          message: 'Internal method fromDTOCyclic not implemented',
          path: [],
          type: 'a.',
          value: undefined
        },
        {
          code: undefined,
          message:
            "Input data is graph. Value : '[object Object]' of type 'arrayOfStrings' has more then one reference!",
          path: [],
          type: 'arrayOfStrings',
          value: undefined
        }
      ])
    }
  })

  /**
   * Testing fromDTO for array of EmployeeType objects
   */

  // Potrazi f-je da su jednaki po dubini i sadrzaju, a ne isti objekti -Jest mozda

  // toDto daje result!!!
  it('should be valid fromDTO for array of EmployeeType objects', () => {
    let arrayOfEmployees = at.arrayOf(examples.EmployeeType, 'arrayOfEmployees')
    let emps: t.TypeOf<typeof arrayOfEmployees> = [
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
    let emps2 = arrayOfEmployees.toDTO(emps)
    let empsDto: t.DtoTypeOf<typeof arrayOfEmployees> = {
      ref: { id: 1, category: 'Array', typeName: 'Array' },
      array: [
        {
          ref: { id: 2, category: 'Object', typeName: 'Worker' },
          object: {
            name: 'Jovan',
            employmentDate: {
              ref: { id: 3, category: 'Object', typeName: 'date' },
              object: {
                day: 4,
                month: 4,
                year: 2019
              }
            },
            dateOfBirth: {
              ref: { id: 4, category: 'Object', typeName: 'date' },
              object: { day: 10, month: 5, year: 2000 }
            }
          }
        }
      ]
    }

    let a = arrayOfEmployees.fromDTO(empsDto)
    expect(isSuccess(a)).toBe(true)
  })

  /**
   * Testing fromDTO with input array of empty objects for array of EmployeeType objects
   */
  it('should not be valid fromDTO for array of EmployeeType objects in case of empty object', () => {
    let arrayOfEmployees = at.arrayOf(t.object({}), 'arrayOfEmployees')
    let a = arrayOfEmployees.fromDTO({
      ref: { id: 1, category: 'Array', typeName: 'arrayOfEmployees' },
      array: [
        { ref: { id: 2, category: 'Object', typeName: '' }, object: {} },
        { ref: { id: 3, category: 'Object', typeName: '' }, object: {} }
      ]
    })
    if (isFailure(a)) {
      expect(a.errors).toEqual([
        {
          code: undefined,
          message:
            "Types are not matching: input type is '' and expected type is '{  }'. A possible subtype cannot be handled!",
          path: [],
          type: '{  }',
          value: '{"ref":{"id":2,"category":"Object","typeName":""},"object":{}}'
        },
        {
          code: undefined,
          message:
            "Input data is graph. Value : '[object Object]' of type '{  }' has more then one reference!",
          path: [],
          type: '{  }',
          value: undefined
        },
        {
          code: undefined,
          message:
            "Types are not matching: input type is '' and expected type is '{  }'. A possible subtype cannot be handled!",
          path: [],
          type: '{  }',
          value: '{"ref":{"id":3,"category":"Object","typeName":""},"object":{}}'
        },
        {
          code: undefined,
          message:
            "Input data is graph. Value : '[object Object]' of type '{  }' has more then one reference!",
          path: [],
          type: '{  }',
          value: undefined
        },
        {
          code: undefined,
          message:
            "Input data is graph. Value : '[object Object]' of type 'arrayOfEmployees' has more then one reference!",
          path: [],
          type: 'arrayOfEmployees',
          value: undefined
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
    let emps: t.DtoTypeOf<typeof arrayOfEmployees> = {
      ref: { id: 1, category: 'Array', typeName: 'Array' },
      array: [
        {
          ref: { id: 2, category: 'Object', typeName: 'Worker' },
          object: {
            name: 'John',
            employmentDate: {
              ref: { id: 3, category: 'Object', typeName: 'date' },
              object: {
                day: 25,
                month: 3,
                year: 2016
              }
            },
            dateOfBirth: {
              ref: { id: 4, category: 'Object', typeName: 'date' },
              object: {
                day: 10,
                month: 5,
                year: 2000
              }
            }
          }
        }
      ]
    }
    let a = arrayOfEmployees.fromDTO(emps)
    if (isFailure(a)) {
      expect(a.errors).toEqual([
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
        },
        {
          code: undefined,
          message:
            "Input data is graph. Value : '[object Object]' of type 'arrayOfEmployees' has more then one reference!",
          path: [],
          type: 'arrayOfEmployees',
          value: undefined
        }
      ])
    }
  })
})
