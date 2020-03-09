import * as t from '../../../src/aelastics-types'
import { isSuccess, isFailure, Failure } from 'aelastics-result'
import * as examples from '../testing-types'

describe('ObjectTest', () => {
  it("Testing if empty object is 'empty object'", () => {
    const type = t.object({}, 'empty')
    let o = {}
    expect(isSuccess(type.validate(o, []))).toBe(true)
  })

  // failed
  it('Testing if object with extra properties is valid', () => {
    const type = t.object({}, 'empty')
    let o = {
      a: t.number
    }
    expect(isSuccess(type.validate(o, []))).toBe(true)
  })

  it("Testing if null  is 'empty object'", () => {
    const type = t.object({}, 'empty')
    let o = null
    expect(isSuccess(type.validate((o as unknown) as t.ObjectType<any>, []))).toBe(false)
  })
  it("Testing if undefined is 'empty object'", () => {
    const type = t.object({}, 'empty')
    let o = undefined
    expect(isSuccess(type.validate((o as unknown) as t.ObjectType<any>, []))).toBe(false)
  })
  // true
  it("Testing if empty array is 'empty object'", () => {
    const type = t.object({}, 'empty')
    let o: any = []
    expect(isSuccess(type.validate(o, []))).toBe(true)
  })

  it("Testing if function is 'empty object'", () => {
    const type = t.object({}, 'empty')
    let o = (a: number) => 2 * a
    expect(isSuccess(type.validate(o, []))).toBe(false)
  })

  it('should be valid Object with property Number', () => {
    const type = t.object(
      {
        a: t.number
      },
      'numberObject'
    )
    const o = {
      a: 25
    }
    expect(isSuccess(type.validate(o, []))).toBe(true)
  })
  it('should not be valid Object with property Number in case of different field name', () => {
    const type = t.object(
      {
        a: t.number
      },
      'numberObject'
    )
    const o = {
      b: 25
    }
    expect(isSuccess(type.validate((o as unknown) as t.ObjectType<any>, []))).toBe(false)
  })
  it('testing if object with literal property is valid', () => {
    const type = t.object({
      a: t.literal('doctor')
    })
    let o: t.TypeOf<typeof type> = {
      a: 'doctor'
    }
    expect(isSuccess(type.validate(o, []))).toBe(true)
  })
  it("should not be valid Object with property Number in case of 'undefined' value", () => {
    const type = t.object(
      {
        a: t.number
      },
      'numberObject'
    )
    const o = {
      a: undefined
    }
    expect(isSuccess(type.validate((o as unknown) as t.ObjectType<any>, []))).toBe(false)
  })
  it('should not be valid Object with property String in case of empty object', () => {
    const type = t.object(
      {
        a: t.string
      },
      'stringObject'
    )
    const o = {}
    expect(isSuccess(type.validate((o as unknown) as t.ObjectType<any>, []))).toBe(false)
  })
  it('should be valid Object with two String properties', () => {
    const type = t.object(
      {
        a: t.string,
        b: t.string
      },
      'stringObject'
    )
    const o = {
      a: '25',
      b: 'etg'
    }
    const res = type.validate(o)
    expect(isSuccess(res)).toBe(true)
  })
  it('should not be valid Object with two String properties in case of object with one property', () => {
    const type = t.object(
      {
        a: t.string,
        b: t.string
      },
      'stringObject'
    )
    const o = {
      a: '25'
    }
    expect(isSuccess(type.validate((o as unknown) as t.ObjectType<any>, []))).toBe(false)
  })

  it('should be valid Object with two String properties and some constraints', () => {
    const type = t.object(
      {
        a: t.string.derive('lower').lowercase,
        b: t.string.derive('ic').endsWith('ic')
      },
      'stringObject'
    )
    const o = {
      a: 'afrg',
      b: 'aSfgvic'
    }
    expect(isSuccess(type.validate(o, []))).toBe(true)
  })
  it('should not be valid Object with two String properties and some constraints', () => {
    const type = t.object(
      {
        a: t.string.derive('lower').lowercase,
        b: t.string.derive('ic').endsWith('ic')
      },
      'stringObject'
    )
    const o = {
      a: 'afrg',
      b: 'aSfgv'
    }
    expect(isSuccess(type.validate(o, []))).toBe(false)
  })

  it('should be valid Object with two Number properties and validation', () => {
    const type = t
      .object(
        {
          a: t.number,
          b: t.number
        },
        'numberObject'
      )
      .addValidator({
        message: (value, label) => `Expected ${label} to be greater than 10, got ${value}`,
        predicate: value => value.a + value.b > 10
      })
    const o = {
      a: 8,
      b: 4
    }
    expect(isSuccess(type.validate(o, []))).toBe(true)
  })
  it('should not be valid Object with two Number properties and validation', () => {
    const type = t
      .object(
        {
          a: t.number,
          b: t.number
        },
        'numberObject'
      )
      .addValidator({
        message: (value, label) =>
          `Expected ${label} to be greater than 10, got ${value.a + value.b}`,
        predicate: value => value.a + value.b > 10
      })
    const o = {
      a: 3,
      b: 2
    }
    expect(isSuccess(type.validate(o, []))).toBe(false)
  })

  it('should be valid Object type', () => {
    const type = t.object(
      {
        place: t.object(
          {
            city: t.string,
            state: t.string
          },
          'place'
        ),
        postalCode: t.number
      },
      'numberObject'
    )
    const o = {
      place: {
        city: 'Belgrade',
        state: 'Serbia'
      },
      postalCode: 11000
    }
    expect(isSuccess(type.validate(o, []))).toBe(true)
  })

  it('should be valid example of EmployeeType object', () => {
    let emp = {
      name: 'John',
      employmentDate: {
        day: 25,
        month: 3,
        year: 2018
      },
      dateOfBirth: {
        day: 12,
        month: 12,
        year: 1997
      }
    }
    expect(isSuccess(examples.EmployeeType.validate(emp, []))).toBe(true)
  })

  it('should not be valid examples.EmployeeType object in case of invalid value for month', () => {
    let emp = {
      name: 'John',
      employmentDate: {
        day: 25,
        month: 3,
        year: 2018
      },
      dateOfBirth: {
        day: 12,
        month: 22,
        year: 1996
      }
    }
    let f = examples.EmployeeType.validate(emp, [])
    if (isFailure(f)) {
      let s = errorMessages(f)
      expect(s).toEqual(
        'Expected dateOfBirth:[object Object]/month:22 to be in range [1..12], got 22\n' +
          'Expected dateOfBirth:[object Object] to be correct value of date, got [object Object]\n'
      )
    }
  })
  it('should not be valid examples.EmployeeType object in case of invalid value for day', () => {
    let emp = {
      name: 'John',
      employmentDate: {
        day: 25,
        month: 3,
        year: 2018
      },
      dateOfBirth: {
        day: 31,
        month: 4,
        year: 1996
      }
    }
    let f = examples.EmployeeType.validate(emp, [])
    if (isFailure(f)) {
      let s = errorMessages(f)
      expect(s).toEqual(
        'Expected dateOfBirth:[object Object] to be correct value of date, got [object Object]\n'
      )
    }
  })
  it('EmployeeBadDay2', () => {
    let emp = {
      name: 'Jovan',
      employmentDate: {
        day: 25,
        month: 3,
        year: 2018
      },
      dateOfBirth: {
        day: 30,
        month: 2,
        year: 1996
      }
    }
    let f = examples.EmployeeType.validate(emp, [])
    expect(isSuccess(f)).toBe(false)
  })

  it('should not be valid examples.EmployeeType object in case of wrong relation between date of birth and day of employment', () => {
    let emp = {
      name: 'John',
      employmentDate: {
        day: 25,
        month: 3,
        year: 2012
      },
      dateOfBirth: {
        day: 28,
        month: 4,
        year: 1996
      }
    }
    let f = examples.EmployeeType.validate(emp, [])
    if (isFailure(f)) {
      let s = errorMessages(f)
      expect(s).toEqual(
        'Expected  date of birth is in correct relation with date of employment (employee age 18 or more), got [object Object]\n'
      )
    }
  })

  // examples.studentType

  it('should be valid examples.studentType object', () => {
    let student = {
      ID: '0305997533549',
      pol: 'Male',
      name: 'Peter',
      surname: 'Smith',
      age: 22,
      average: 8.52,
      faculty: {
        name: 'FPN',
        dean: {
          name: 'John',
          surname: 'Myers',
          age: 50,
          title: 'dr',
          expertise: 'International law',
          workingExperiance: 10
        },
        studentCapacity: 3000
      },
      entrance: {
        year: 2016
      },
      dateOfBirth: {
        day: 3,
        month: 5,
        year: 1997
      },
      address: {
        street: 'Nemanjina 19',
        city: {
          city: 'Belgrade',
          country: 'Slovenia',
          postalCode: 11000
        }
      },

      index: '122/2016'
    }

    expect(isSuccess(examples.studentType.validate(student, []))).toBe(true)
  })

  it('should not be valid examples.studentType object in case of invalid entrance year', () => {
    let student = {
      ID: '3103992733549',
      pol: 'Male',
      name: 'Peter',
      surname: 'Smith',
      age: 27,
      average: 8.52,
      faculty: {
        name: 'FPN',
        dean: {
          name: 'John',
          surname: 'Myers',
          age: 50,
          title: 'dr',
          expertise: 'International law',
          workingExperiance: 10
        },
        studentCapacity: 3000
      },
      entrance: {
        year: 2010
      },
      dateOfBirth: {
        day: 31,
        month: 3,
        year: 1995
      },
      address: {
        street: 'Nemanjina 19',
        city: {
          city: 'Belgrade',
          country: 'Serbia',
          postalCode: 11000
        }
      },

      index: '0122/2016'
    }

    let f = examples.studentType.validate(student, [])

    expect(isSuccess(f)).toBe(false)
  })

  it('should not be valid examples.studentType object in case of invalid value for postal code', () => {
    let student = {
      ID: '3103997733549',
      pol: 'Male',
      name: 'Peter',
      surname: 'Smith',
      age: 22,
      average: 18.52, // this should be in range between 5 and 10
      faculty: {
        name: 'FPN',
        dean: {
          name: 'John',
          surname: 'Myers',
          age: -50, // not
          title: 'dr',
          expertise: 'International law',
          workingExperiance: 10
        },
        studentCapacity: 3000
      },
      entrance: {
        year: 2016
      },
      dateOfBirth: {
        day: 31,
        month: 3, // here checks
        year: 1997
      },
      address: {
        street: 'Nemanjina 19', // doesn't check validators for nested objects!!
        city: {
          city: 'Belgrade',
          country: 'Serbia',
          postalCode: 11000.12
        }
      },

      index: '122/2016'
    }

    let f = examples.studentType.validate(student, [])
    // if(isFailure(f)){
    //     //let s=errorMessages(f);
    //     expect(f.errors).toEqual(
    //         ''
    //     )
    // }
    expect(isSuccess(f)).toBe(false)
  })

  it('should not be valid examples.studentType object in case of invalid index year', () => {
    let student = {
      ID: '2903994733549',
      pol: 'Male',
      name: 'Peter',
      surname: 'Smith',
      age: 25,
      average: 7.52,
      faculty: {
        name: 'FON',
        dean: {
          name: 'John',
          surname: 'Myers',
          age: 50,
          title: 'dr',
          expertise: 'International law',
          workingExperiance: 10
        },
        studentCapacity: 10000
      },
      entrance: {
        year: 2014
      },
      dateOfBirth: {
        day: 29,
        month: 12,
        year: 1994
      },
      address: {
        street: 'Cara Dusana',
        city: {
          city: 'Belgrade',
          country: 'Serbia',
          postalCode: 11000
        }
      },

      index: '558/2015'
    }

    let f = examples.studentType.validate(student, [])
    expect(isSuccess(f)).toBe(false)
  })

  it('should not be valid examples.studentType object in case of wrong relation between jmbg and day of birth', () => {
    let student = {
      ID: '0305997733549',
      pol: 'Male',
      name: 'Peter',
      surname: 'Smith',
      age: 23,
      average: 7.52,
      faculty: {
        name: 'FPN',
        dean: {
          name: 'John',
          surname: 'Myers',
          age: 50,
          title: 'dr',
          expertise: 'International law',
          workingExperiance: 10
        },
        studentCapacity: 3000
      },
      entrance: {
        year: 2015
      },
      dateOfBirth: {
        day: 2,
        month: 5,
        year: 1997
      },
      address: {
        street: 'Cara Dusana',
        city: {
          city: 'Belgrade',
          country: 'Serbia',
          postalCode: 11000
        }
      },

      index: '5/2015'
    }

    expect(isSuccess(examples.studentType.validate(student, []))).toBe(false)
  })
})

const errorMessages = (emp: Failure) => {
  let s = ''
  emp.errors.forEach(value => {
    s = s + value.message + '\n'
  })
  return s
}
