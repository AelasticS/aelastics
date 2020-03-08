import { FullNameType } from '../../example/types-example'
import { isSuccess , isFailure } from 'aelastics-result'
import { errorMessages , ProfessorIntersectionType } from '../testing-types'

describe('fromDTO test cases for IntersectionType' , () => {

  it('should be valid fromDTO for FullNameType' , () => {
    const fullName = { name : 'John' , familyName : 'Brown' }
    const res = FullNameType.fromDTO(fullName , [])
    expect(isSuccess(res)).toBe(true)
  })

  it('should be valid fromDTO error message for FullNameType in case of unexpected input value' , () => {
    const fullName = { name : 3 , familyName : 'Brown' }
    const res = FullNameType.fromDTO(fullName as unknown as any , [])
    if (isFailure(res)) {
      expect(errorMessages(res)).toEqual('Expected name:3 to be alphabetical, got `3`\n')
    }
  })

  it(' should be valid fromDTO error message for FullNameType in case of unsatisfied constraints' , () => {
    const fullName = { name : '3' , familyName : 'Brown' }
    const res = FullNameType.fromDTO(fullName , [])
    if (isFailure(res)) {
      expect(errorMessages(res)).toEqual('Expected name:3 to be alphabetical, got `3`\n')
    }
  })

  it('should be valid fromDTO for ProfessorIntersectionType   ' , () => {
    const professor = { name : 'John' , age : 32 , title : 'Msc' }
    const res = ProfessorIntersectionType.fromDTO(professor , [])
    if (isFailure(res)) {
      expect(errorMessages(res)).toEqual('Expected name:3 to be alphabetical, got `3`\n')
    }
  })

  it('should not be valid fromDTO for ProfessorIntersectionType   ' , () => {
    const professor = { name : 'John22' , age : 32 , title : 'Msc' }
    const res = ProfessorIntersectionType.fromDTO(professor as unknown as any , [])
    expect(isSuccess(res)).toBe(false)
  })


  it('should be valid fromDTO error message for ProfessorIntersectionType   ' , () => {
    const professor = { name : 'John' , age : -32 , title : 'Msc' }
    const res = ProfessorIntersectionType.fromDTO(professor as unknown as any , [])
    if (isFailure(res)) {
      expect(errorMessages(res)).toEqual('')
    }
  })


})
