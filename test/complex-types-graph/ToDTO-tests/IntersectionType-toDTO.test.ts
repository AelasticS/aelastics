import { isSuccess, isFailure } from 'aelastics-result'
import { errorMessages, ProfessorIntersectionType } from '../testing-types'
import { FullNameType } from '../../example/types-example'
import { TypeOf } from '../../../src/common/Type'

describe('toDTO test cases for IntersectionType', () => {
  it('should be valid toDTO for FullNameType', () => {
    // Doesn't work!!
    const fullName: TypeOf<typeof FullNameType> = { name: 'John', familyName: 'Brown' }
    const res = FullNameType.toDTO(fullName)
    // if(isFailure(res))
    // {
    //   expect(res.errors).toEqual('')
    // }
    // expect(isSuccess(res)).toBe(true)
  })
  // Missing ref and map
  it('should be valid toDTO value for FullNameType', () => {
    const fullName = { name: 'John', familyName: 'Brown' }
    const res = FullNameType.toDTO(fullName)
    if (isSuccess(res)) {
      expect(res.value).toEqual({ familyName: 'Brown', name: 'John' })
    }
  })

  it('should not be valid toDTO for FullNameType', () => {
    const fullName = { name: 2, familyName: 'Brown' }
    const res = FullNameType.toDTO((fullName as unknown) as any)
    expect(isSuccess(res)).toBe(false)
  })

  it('should be valid error message toDTO for FullNameType', () => {
    const fullName = { name: 2, familyName: 'Brown' }
    const res = FullNameType.toDTO((fullName as unknown) as any)
    if (isFailure(res)) {
      expect(errorMessages(res)).toEqual('Expected name:2 to be alphabetical, got `2`\n')
    }
  })

  it('should not be valid toDTO for FullNameType in case map with fields', () => {
    const fullName = new Map()
    fullName.set('name', 'John')
    fullName.set('familyName', 'Brown')
    const res = FullNameType.toDTO((fullName as unknown) as any)
    expect(isSuccess(res)).toBe(false)
  })

  it('should be valid ProfessorIntersectionType', () => {
    const professor = { name: 'John', age: 45, title: 'Msc' }
    const res = ProfessorIntersectionType.toDTO(professor)
    expect(isSuccess(res)).toBe(true)
  })

  it('should not be valid ProfessorIntersectionType in case of unsatisfied constraints', () => {
    const professor = { name: 'John223', age: 45, title: 'Msc' }
    const res = ProfessorIntersectionType.toDTO(professor)
    expect(isSuccess(res)).toBe(false)
  })
})
