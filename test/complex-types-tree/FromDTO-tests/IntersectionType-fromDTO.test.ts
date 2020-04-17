import * as t from '../../../src/aelastics-types'
import { FullNameType } from '../../example/types-example'
import { isSuccess, isFailure } from 'aelastics-result'
import { errorMessages, person, profesorType, ProfessorIntersectionType } from '../testing-types'

describe('fromDTOtree test cases for IntersectionType', () => {
  it('should be valid fromDTOtree for FullNameType', () => {
    const fullName: t.DtoTreeTypeOf<typeof FullNameType> = {
      //   {name: 'John'}, familyName: 'Brown'
      name: { name: 'John' },
      famName: { familyName: 'Brown' }
    }
    const res = FullNameType.fromDTOtree(fullName as any)
    expect(isSuccess(res)).toBe(true)
  })

  it('should be valid fromDTOtree error message for FullNameType in case of unexpected input value', () => {
    const fullName = { name: { name: 3 }, famName: { familyName: 'Brown' } }
    const res = FullNameType.fromDTOtree((fullName as unknown) as any)
    if (isFailure(res)) {
      expect(errorMessages(res)).toEqual('Expected name:3 to be alphabetical, got `3`\n')
    }
  })

  it(' should be valid fromDTOtree error message for FullNameType in case of unsatisfied constraints', () => {
    const fullName = { name: { name: '3' }, famName: { familyName: 'Brown' } }
    const res = FullNameType.fromDTOtree(fullName as any)
    if (isFailure(res)) {
      expect(errorMessages(res)).toEqual('Expected name:3 to be alphabetical, got `3`\n')
    }
  })

  it('should be valid fromDTOtree for ProfessorIntersectionType   ', () => {
    const professor: t.DtoTreeTypeOf<typeof ProfessorIntersectionType> = {
      profesor: { name: 'John', title: 'Msc', age: 32 },
      person: { name: 'John', age: 32 }
    }
    const res = ProfessorIntersectionType.fromDTOtree(professor as any)
    expect(isSuccess(res)).toBe(true)
    /*    if (isFailure(res)) {
          expect(errorMessages(res)).toEqual('Expected name:3 to be alphabetical, got `3`\n')
        }*/
  })

  it('should not be valid fromDTOtree for ProfessorIntersectionType  ', () => {
    const professor: t.DtoTreeTypeOf<typeof ProfessorIntersectionType> = {
      profesor: { name: 'John32', title: 'Msc', age: 32 },
      person: { name: 'John', age: 32 }
    }
    const res = ProfessorIntersectionType.fromDTOtree((professor as unknown) as any)
    expect(isSuccess(res)).toBe(false)
  })

  it('should be valid fromDTOtree error message for ProfessorIntersectionType   ', () => {
    const professor = {
      profesor: { name: 'John', title: 'Msc', age: -32 },
      person: { name: 'John', age: 32 }
    }

    const res = ProfessorIntersectionType.fromDTOtree((professor as unknown) as any)
    if (isFailure(res)) {
      expect(errorMessages(res)).toEqual('Expected age:-32 to be positive, got -32\n')
    }
  })
})
