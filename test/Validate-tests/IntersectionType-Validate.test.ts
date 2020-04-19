import { isSuccess } from 'aelastics-result'
import { FullNameType } from '../example/types-example'
import { TypeOf } from '../../src/aelastics-types'

describe('test cases for Intersection', () => {
  it('should be valid FullNameType', () => {
    const fullName: TypeOf<typeof FullNameType> = { name: 'John', familyName: 'Brown' }
    expect(isSuccess(FullNameType.validate(fullName))).toBe(true)
  })

  it('should not be valid FullNameType in case of non string field', () => {
    const fullName = { name: 'John', familyName: 3 }
    expect(isSuccess(FullNameType.validate((fullName as unknown) as any))).toBe(false)
  })

  it('should not be valid FullNameType in case of fields without same name', () => {
    const fullName = { firstName: 'John', fName: 'Brown' }
    expect(isSuccess(FullNameType.validate((fullName as unknown) as any))).toBe(false)
  })
  it('should be valid FullNameType with one field', () => {
    const fullName = { name: 'John' }
    expect(isSuccess(FullNameType.validate((fullName as unknown) as any))).toBe(false)
  })

  it("should not be valid FullNameType in case of 'null' value", () => {
    const fullName = null
    expect(isSuccess(FullNameType.validate((fullName as unknown) as any))).toBe(false)
  })

  it("should not be valid FullNameType in case of 'undefined' value", () => {
    const fullName = undefined
    expect(isSuccess(FullNameType.validate((fullName as unknown) as any))).toBe(false)
  })

  it('should not be valid FullNameType in case of object without fields', () => {
    const fullName = {}
    expect(isSuccess(FullNameType.validate((fullName as unknown) as any))).toBe(false)
  })

  it('should not be valid FullNameType in case of array with objects', () => {
    const fullName = [{ name: 'John' }, { familyName: 'Brown' }]
    expect(isSuccess(FullNameType.validate((fullName as unknown) as any))).toBe(false)
  })
})
