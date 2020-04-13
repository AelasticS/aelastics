import { FullNameType } from '../../example/types-example'
import { isFailure, isSuccess } from 'aelastics-result'
import { errorMessages, ProfessorIntersectionType } from '../testing-types'
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
      ref: { id: 3, category: 'Intersection', typeName: '(name | famName)' },
      intersection: {
        name: {
          ref: { id: 1, category: 'Object', typeName: 'name' },
          object: { name: 'sima' }
        },
        famName: {
          ref: { id: 2, category: 'Object', typeName: 'famName' },
          object: { familyName: 'Simic' }
        }
      }
    }

    const res = FullNameType.fromDTO(fullName)
    expect(isSuccess(res)).toBe(true)
  })

  it('should be valid fromDTO error message for FullNameType in case of unexpected input value', () => {
    const fullName = {
      ref: { id: 1, category: 'Intersection', typeName: '(name | famName)' },
      intersection: {
        name: { ref: { id: 1, category: 'Object', typeName: 'name' }, object: { name: 3 } },
        famName: {
          ref: { id: 2, category: 'Object', typeName: 'famName' },
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
      ref: { id: 1, category: 'Intersection', typeName: '(name | famName)' },
      intersection: {
        name: { ref: { id: 1, category: 'Object', typeName: 'name' }, object: { name: '3' } },
        famName: {
          ref: { id: 2, category: 'Object', typeName: 'famName' },
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
    const professor = {
      ref: { typeName: 'professor', category: 'Intersection', id: 1 },
      intersection: {
        person: {
          ref: { typeName: 'person', category: 'Object', id: 2 },
          object: { name: 'John22', age: 32 }
        },
        profesor: {
          ref: { typeName: 'profesor', category: 'Object', id: 3 },
          object: { name: 'John', title: 'Msc' }
        }
      }
    }
    const res = ProfessorIntersectionType.fromDTO(professor)
    expect(isSuccess(res)).toBe(false)
  })

  it('should be valid fromDTO error message for ProfessorIntersectionType   ', () => {
    const professor = {
      ref: { typeName: 'professor', category: 'Intersection', id: 1 },
      intersection: {
        person: {
          ref: { typeName: 'person', category: 'Object', id: 2 },
          object: { name: 'John22', age: 32 }
        },
        profesor: {
          ref: { typeName: 'profesor', category: 'Object', id: 3 },
          object: { name: 'John33', title: 'Msc' }
        }
      }
    }
    const res = ProfessorIntersectionType.fromDTO(professor)
    expect(isFailure(res)).toBe(true)
    if (isFailure(res)) {
      expect(errorMessages(res)).toEqual(
        'Expected name:John33 to be alphabetical, got `John33`\n' +
          'Expected name:John33 to be alphabetical, got `John33`\n'
      )
    }
  })
})
