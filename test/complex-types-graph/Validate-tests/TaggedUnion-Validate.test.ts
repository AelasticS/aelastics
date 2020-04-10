import * as examples from '../testing-types'
import { isSuccess } from 'aelastics-result'
import * as t from '../../../src/aelastics-types'
// tslint:disable-next-line:no-duplicate-imports
import { doctorType, lawyerType } from '../testing-types'

describe('TaggedUnion tests', () => {
  // Wanted to check whether the validators will work at the first level of object.

  it('should verify that created taggedUnion is valid', () => {
    const TU = t.taggedUnion(
      {
        doctor: doctorType,
        lawyer: lawyerType
      },
      'profession',
      'employee'
    )

    const e = {
      profession: 'doctor',
      specialization: true,
      worksAt: 'Anave medica'
    }

    let res = TU.validate((e as unknown) as any)

    expect(isSuccess(res)).toBe(true)
  })

  it('should verify that doctor is an employee', () => {
    const e: t.TypeOf<typeof examples.employeeType> = {
      profession: 'doctor',
      specialization: true,
      worksAt: 'Anave medica'
    }
    expect(isSuccess(examples.employeeType.validate(e))).toBe(true)
  })

  it('should verify that lawyer is an employee', () => {
    const e: t.TypeOf<typeof examples.employeeType> = {
      profession: 'lawyer',
      masterDegree: true,
      worksAt: 'Kirkland and Ellis'
    }
    expect(isSuccess(examples.employeeType.validate(e))).toBe(true)
  })

  it('should verify that programmer is not an employee', () => {
    const e = { profession: 'programmer', masterDegree: true, worksAt: 'Microsoft' }
    expect(isSuccess(examples.employeeType.validate((e as unknown) as any))).toBe(false)
  })

  // Wanted to check whether the validators will work at the second level of object.

  it('should verify that Piter Parker is person with valid profession', () => {
    const e: t.TypeOf<typeof examples.personType> = {
      name: 'Piter',
      age: 25,
      occupation: {
        profession: 'lawyer',
        masterDegree: true,
        worksAt: 'Kirkland and Ellis'
      }
    }
    expect(isSuccess(examples.personType.validate(e))).toBe(true)
  })

  it('should verify that Dinklage is person with invalid profession', () => {
    const e = {
      name: 'Piter Dinklage',
      age: '39',
      occupation: {
        profession: 'actor',
        masterDegree: true,
        worksAt: 'Hollywood'
      }
    }
    expect(isSuccess(examples.personType.validate((e as unknown) as any))).toBe(false)
  })

  // Wanted to check whether the validators will work at the third level of object.

  it('should verify that Millennial Action Project is political organisation with members with valid profession', () => {
    const e: t.TypeOf<typeof examples.politicalOrganisationType> = {
      name: 'Millennial',
      address: '79 Addison St.',
      members: [
        {
          name: 'Piter',
          age: 25,
          occupation: {
            profession: 'lawyer',
            masterDegree: true,
            worksAt: 'Kirkland and Ellis'
          }
        },
        {
          name: 'John',
          age: 39,
          occupation: {
            profession: 'lawyer',
            masterDegree: true,
            worksAt: 'Kirkland and Ellis'
          }
        }
      ]
    }

    expect(isSuccess(examples.politicalOrganisationType.validate(e))).toBe(true)
  })

  it('should verify that New Politics is political organisation with members with invalid profession', () => {
    const e = {
      name: 'New Politics',
      address: '49 Cambridge St.',
      members: [
        {
          name: 'Piter Parker',
          age: '25',
          occupation: {
            profession: 'Programmer',
            masterDegree: true,
            worksAt: 'Microsoft'
          }
        },
        {
          name: 'John Mayer',
          age: '39',
          occupation: {
            profession: 'lawyer',
            masterDegree: true,
            worksAt: 'Kirkland and Ellis'
          }
        }
      ]
    }

    expect(isSuccess(examples.politicalOrganisationType.validate((e as unknown) as any))).toBe(
      false
    )
  })
})
