import { FullNameType } from '../../example/types-example'
import { isFailure, isSuccess } from 'aelastics-result'
import { DoctorIntersectionType, errorMessages, ProfessorIntersectionType } from '../testing-types'
import { DtoTypeOf } from '../../../src/common/Type'

describe('fromDTO test cases for IntersectionType', () => {
  it('should be valid fromDTO for FullNameType', () => {
    /* OLD WAY!!!!

        const fullName: DtoTypeOf<typeof FullNameType> = {
          ref : { id : 1 , category : 'Intersection' , typeName : '' } ,
          intersection : {
            ref : { id : 2 , category : 'Object' , typeName : '' } ,
            object : { name : 'John' , familyName : 'Brown' }
          }
        }
      Below is a NEW WAY!

    */

    const fullName: DtoTypeOf<typeof FullNameType> = {
      ref: { id: 3, category: 'intersection', typeName: '(name | famName)' },
      intersection: {
        name: {
          ref: { id: 1, category: 'object', typeName: 'name' },
          object: { name: 'sima' }
        },
        famName: {
          ref: { id: 2, category: 'object', typeName: 'famName' },
          object: { familyName: 'Simic' }
        }
      }
    }

    const res = FullNameType.fromDTO(fullName)
    expect(isSuccess(res)).toBe(true)
  })

  it('should be valid fromDTO error message for FullNameType in case of unexpected input value', () => {
    const fullName = {
      ref: { id: 1, category: 'intersection', typeName: '(name | famName)' },
      intersection: {
        name: {
          ref: { id: 1, category: 'object', typeName: 'name' },
          object: { name: 3 }
        },
        famName: {
          ref: { id: 2, category: 'object', typeName: 'famName' },
          object: { familyName: 'Brown' }
        }
      }
    }
    const res = FullNameType.fromDTO((fullName as unknown) as any)
    if (isFailure(res)) {
      expect(errorMessages(res)).toEqual('Expected name:3 to be alphabetical, got `3`\n')
    }
  })

  it(' should be valid fromDTO error message for FullNameType in case of unsatisfied constraints', () => {
    const fullName = {
      ref: { id: 1, category: 'intersection', typeName: '(name | famName)' },
      intersection: {
        name: {
          ref: { id: 1, category: 'object', typeName: 'name' },
          object: { name: '3' }
        },
        famName: {
          ref: { id: 2, category: 'object', typeName: 'famName' },
          object: { familyName: 'Brown' }
        }
      }
    }
    const res = FullNameType.fromDTO(fullName)
    expect(isFailure(res)).toBe(true)
    if (isFailure(res)) {
      expect(errorMessages(res)).toEqual('Expected name:3 to be alphabetical, got `3`\n')
    }
  })

  it('should be valid fromDTO for ProfessorIntersectionType   ', () => {
    const professor = { name: 'John', age: 32, title: 'Msc' }
    const dtoObject = ProfessorIntersectionType.toDTO(professor)
    expect(isSuccess(dtoObject)).toBe(true)
    if (isSuccess(dtoObject)) {
      const res = ProfessorIntersectionType.fromDTO(dtoObject.value)
      expect(isSuccess(res)).toBe(true)
    }
  })

  it('should not be valid fromDTO for ProfessorIntersectionType   ', () => {
    const doctor = {
      ref: { typeName: 'doctor intersection', category: 'intersection', id: 1 },
      intersection: {
        person: {
          ref: { typeName: 'person', category: 'object', id: 2 },
          object: { name: 'John22', age: 32 }
        },
        doctorObject: {
          ref: { typeName: 'doctorObject', category: 'object', id: 3 },
          object: { profession: 'doctor', specialization: true, worksAt: 'Bel Medic' }
        }
      }
    }
    const res = DoctorIntersectionType.fromDTO(doctor)
    expect(isSuccess(res)).toBe(false)
  })

  it('should be valid fromDTO error message for ProfessorIntersectionType   ', () => {
    const doctor = {
      ref: { typeName: 'doctor intersection', category: 'intersection', id: 1 },
      intersection: {
        person: {
          ref: { typeName: 'person', category: 'object', id: 2 },
          object: { name: 'John22', age: 32 }
        },
        doctorObject: {
          ref: { typeName: 'doctorObject', category: 'object', id: 3 },
          object: { profession: 'doctor', specialization: true, worksAt: 'Bel Medic' }
        }
      }
    }
    const res = DoctorIntersectionType.fromDTO(doctor)
    expect(isFailure(res)).toBe(true)
    if (isFailure(res)) {
      expect(errorMessages(res)).toEqual('Expected name:John22 to be alphabetical, got `John22`\n')
    }
  })
})
