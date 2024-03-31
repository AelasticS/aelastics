import * as examples from '../testing-types'
import { DtoTreeTypeOf, DtoTypeOf } from '../../../src/aelastics-types'
import { isFailure, isSuccess } from 'aelastics-result'

describe('Testing fromDTOtree for Tagged union', () => {
  it('should be valid fromDto for employeeType', () => {
    const d: DtoTreeTypeOf<typeof examples.doctorType> = {
      profession: 'doctor',
      specialization: true,
      worksAt: 'Bel Medic'
    }
    const res = examples.employeeType.fromDTOtree(d as any)
    expect(isSuccess(res)).toBe(true)
  })

  it('should not be valid fromDTOtree for employeeType in case of unsatisfied constraints', () => {
    const d: DtoTreeTypeOf<typeof examples.doctorType> = {
      profession: 'doctor',
      specialization: true,
      worksAt: ''
    }
    const res = examples.employeeType.fromDTOtree(d as any)
    expect(isSuccess(res)).toBe(false)
  })

  it('should be valid fromDTOtree message for employeeType in case of unsatisfied constraints', () => {
    const d: DtoTreeTypeOf<typeof examples.doctorType> = {
      profession: 'doctor',
      specialization: true,
      worksAt: ''
    }
    const res = examples.employeeType.fromDTOtree(d as any)
    if (isFailure(res)) {
      expect(examples.errorMessages(res)).toEqual('Expected worksAt: to not be empty\n')
    }
  })

  it('should be valid fromDto for employeeType with extra fields', () => {
    const d = {
      profession: 'doctor',
      specialization: true,
      worksAt: 'Bel Medic',
      age: 48
    }
    const res = examples.employeeType.fromDTOtree((d as unknown) as any)
    expect(isSuccess(res)).toBe(true)
  })

  it('should not be valid fromDto for employeeType with missing fields', () => {
    const d = {
      profession: 'doctor',
      specialization: true
    }
    const res = examples.employeeType.fromDTOtree((d as unknown) as any)
    expect(isSuccess(res)).toBe(false)
  })

  it('should not be valid fromDto for employeeType with wrong discriminator', () => {
    const d = {
      Profession: 'doctor',
      specialization: true,
      worksAt: 'Bel Medic'
    }
    const res = examples.employeeType.fromDTOtree((d as unknown) as any)
    expect(isSuccess(res)).toBe(false)
  })
})
