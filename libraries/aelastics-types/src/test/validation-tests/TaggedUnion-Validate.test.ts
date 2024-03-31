import { isSuccess } from 'aelastics-result'
import * as t from '../..'


export const DoctorTypeSpecialization = t.string
  .derive('Specialization')
  .oneOf(['Surgeon', 'Cardiologist', 'Internist'])
export const DoctorType = t.object(
  {
    profession: t.literal('Doctor'),
    specialization: DoctorTypeSpecialization
  },
  'DoctorType'
)


export const TypeWorksAt = t.string.derive('').nonEmpty.maxLength(30)

export const LawyerType = t.object(
  {
    profession: t.literal('Lawyer'),
    masterDegree: t.boolean,
    worksAt: TypeWorksAt
  },
  'lawyerObject'
)

export const EmployeeType = t.taggedUnion(
  {
    Doctor: DoctorType,
    Lawyer: LawyerType
  },
  'profession',
  'EmployeeType'
)


export const personType = t.object(
  {
    name: t.string.derive('').alphabetical.nonEmpty,
    age: t.number.derive('').positive.greaterThan(18),
    occupation: EmployeeType
  },
  'personObject'
)

export const politicalOrganisationType = t.object(
  {
    name: t.string.derive('').nonEmpty.maxLength(50),
    address: t.string.derive('').nonEmpty.maxLength(50),
    members: t.arrayOf(personType, 'arrayOfPersons')
  },
  'politicalOrganisationObject'
)

describe('TaggedUnion tests', () => {
  // Wanted to check whether the validators will work at the first level of object.

  it('should verify that created taggedUnion is valid', () => {
    const TU = t.taggedUnion(
      {
        Doctor: DoctorType,
        Lawyer: LawyerType
      },
      'profession',
      'employee'
    )

    const e = {
      profession: 'Doctor',
      specialization: true,
      worksAt: 'Anave medica'
    }

    let res = TU.validate((e as unknown) as any)

    expect(isSuccess(res)).toBe(true)
  })

  it('should verify that doctor is an employee', () => {
    const e: t.TypeOf<typeof EmployeeType> = {
      profession: 'Doctor',
      specialization: 'Surgeon',
    }
    expect(isSuccess(EmployeeType.validate(e))).toBe(true)
  })

  it('should verify that lawyer is an employee', () => {
    const e: t.TypeOf<typeof EmployeeType> = {
      profession: 'Lawyer',
      masterDegree: true,
      worksAt: 'Kirkland and Ellis'
    }
    expect(isSuccess(EmployeeType.validate(e))).toBe(true)
  })

  it('should verify that programmer is not an employee', () => {
    const e = { profession: 'programmer', masterDegree: true, worksAt: 'Microsoft' }
    expect(isSuccess(EmployeeType.validate((e as unknown) as any))).toBe(false)
  })

  // Wanted to check whether the validators will work at the second level of object.

  it('should verify that Piter Parker is person with valid profession', () => {
    const e: t.TypeOf<typeof personType> = {
      name: 'Piter',
      age: 25,
      occupation: {
        profession: 'Lawyer',
        masterDegree: true,
        worksAt: 'Kirkland and Ellis'
      }
    }
    expect(isSuccess(personType.validate(e))).toBe(true)
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
    expect(isSuccess(personType.validate((e as unknown) as any))).toBe(false)
  })

  // Wanted to check whether the validators will work at the third level of object.

  it('should verify that Millennial Action Project is political organisation with members with valid profession', () => {
    const e: t.TypeOf<typeof politicalOrganisationType> = {
      name: 'Millennial',
      address: '79 Addison St.',
      members: [
        {
          name: 'Piter',
          age: 25,
          occupation: {
            profession: 'Lawyer',
            masterDegree: true,
            worksAt: 'Kirkland and Ellis'
          }
        },
        {
          name: 'John',
          age: 39,
          occupation: {
            profession: 'Lawyer',
            masterDegree: true,
            worksAt: 'Kirkland and Ellis'
          }
        }
      ]
    }

    expect(isSuccess(politicalOrganisationType.validate(e))).toBe(true)
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
            profession: 'Lawyer',
            masterDegree: true,
            worksAt: 'Kirkland and Ellis'
          }
        }
      ]
    }

    expect(isSuccess(politicalOrganisationType.validate((e as unknown) as any))).toBe(
      false
    )
  })
})
