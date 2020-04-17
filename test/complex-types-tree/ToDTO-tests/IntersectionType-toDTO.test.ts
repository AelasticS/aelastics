import { isSuccess, isFailure } from 'aelastics-result'
import { errorMessages, ProfessorIntersectionType } from '../testing-types'
import { FullNameType } from '../../example/types-example'

describe('toDTOtree test cases for IntersectionType', () => {
  it('should be valid toDTOtree for FullNameType', () => {
    const fullName = { name: 'John', familyName: 'Brown' }
    const res = FullNameType.toDTOtree(fullName)
    expect(isSuccess(res)).toBe(true)
  })

  it('should be valid toDTOtree value for FullNameType', () => {
    const fullName = { name: 'John', familyName: 'Brown' }
    const res = FullNameType.toDTOtree(fullName)
    if (isSuccess(res)) {
      expect(res.value).toEqual({ familyName: 'Brown', name: 'John' })
    }
  })

  it('should not be valid toDTOtree for FullNameType', () => {
    const fullName = { name: 2, familyName: 'Brown' }
    const res = FullNameType.toDTOtree((fullName as unknown) as any)
    expect(isSuccess(res)).toBe(false)
  })

  it('should be valid error message toDTOtree for FullNameType', () => {
    const fullName = { name: 2, familyName: 'Brown' }
    const res = FullNameType.toDTOtree((fullName as unknown) as any)
    if (isFailure(res)) {
      expect(errorMessages(res)).toEqual('Expected name:2 to be alphabetical, got `2`\n')
    }
  })

  it('should not be valid toDTOtree for FullNameType in case map with fields', () => {
    const fullName = new Map()
    fullName.set('name', 'John')
    fullName.set('familyName', 'Brown')
    const res = FullNameType.toDTOtree((fullName as unknown) as any)
    expect(isSuccess(res)).toBe(false)
  })

  it('should be valid ProfessorIntersectionType', () => {
    const professor = { name: 'John', age: 45, title: 'Msc' }
    const res = ProfessorIntersectionType.toDTOtree(professor)
    expect(isSuccess(res)).toBe(true)
  })

  it('should not be valid ProfessorIntersectionType in case of unsatisfied constraints', () => {
    const professor = { name: 'John223', age: 45, title: 'Msc' }
    const res = ProfessorIntersectionType.toDTOtree(professor)
    expect(isSuccess(res)).toBe(false)
  })
})
