import { FullNameType } from '../../example/types-example'
import { isSuccess, isFailure } from 'aelastics-result'
import { errorMessages, ProfessorIntersectionType } from '../testing-types'
import { DtoTypeOf } from '../../../src/common/Type'

describe('fromDTO test cases for IntersectionType', () => {
  it('should be valid fromDTO for FullNameType', () => {
    const fullName: DtoTypeOf<typeof FullNameType> = {
      ref: { id: 1, category: 'Intersection', typeName: '' },
      intersection: {
        ref: { id: 2, category: 'Object', typeName: '' },
        object: { name: 'John', familyName: 'Brown' }
      }
    }
    const res = FullNameType.fromDTO(fullName)
    expect(isSuccess(res)).toBe(true)
  })

  it('should be valid fromDTO error message for FullNameType in case of unexpected input value', () => {
    const fullName = {
      ref: { id: 1, category: 'Intersection', typeName: '' },
      intersection: {
        ref: { id: 2, category: 'Object', typeName: '' },
        object: { name: 3, familyName: 'Brown' }
      }
    }
    const res = FullNameType.fromDTO((fullName as unknown) as any)
    if (isFailure(res)) {
      expect(errorMessages(res)).toEqual('Expected name:3 to be alphabetical, got `3`\n')
    }
  })

  it(' should be valid fromDTO error message for FullNameType in case of unsatisfied constraints', () => {
    const fullName = {
      ref: { id: 1, category: 'Intersection', typeName: '' },
      intersection: {
        ref: { id: 2, category: 'Object', typeName: '' },
        object: { name: '3', familyName: 'Brown' }
      }
    }
    const res = FullNameType.fromDTO(fullName)
    if (isFailure(res)) {
      expect(errorMessages(res)).toEqual('Expected name:3 to be alphabetical, got `3`\n')
    }
  })

  it('should be valid fromDTO for ProfessorIntersectionType   ', () => {
    const professor = {
      ref: { id: 1, category: 'Intersection', typeName: 'professor' },
      intersection: {
        ref: { id: 2, category: 'Object', typeName: /*Not sure*/ 'professor' },
        object: { name: 'John', age: 32, title: 'Msc' }
      }
    }
    const res = ProfessorIntersectionType.fromDTO(professor)
    if (isFailure(res)) {
      expect(errorMessages(res)).toEqual('Expected name:3 to be alphabetical, got `3`\n')
    }
  })

  it('should not be valid fromDTO for ProfessorIntersectionType   ', () => {
    const professor = {
      ref: { id: 1, category: 'Intersection', typeName: '' },
      intersection: {
        ref: { id: 2, category: 'Object', typeName: '' },
        object: { name: 'John22', age: 32, title: 'Msc' }
      }
    }
    const res = ProfessorIntersectionType.fromDTO(professor)
    expect(isSuccess(res)).toBe(false)
  })

  it('should be valid fromDTO error message for ProfessorIntersectionType   ', () => {
    const professor = {
      ref: { id: 1, category: 'Intersection', typeName: '' },
      intersection: {
        ref: { id: 2, category: 'Object', typeName: '' },
        object: { name: 'John', age: -32, title: 'Msc' }
      }
    }
    const res = ProfessorIntersectionType.fromDTO(professor)
    if (isFailure(res)) {
      expect(errorMessages(res)).toEqual('')
    }
  })
})
