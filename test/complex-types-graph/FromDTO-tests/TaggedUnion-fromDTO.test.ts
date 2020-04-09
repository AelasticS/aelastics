import * as examples from '../testing-types'
import { DtoTypeOf } from '../../../src/aelastics-types'
import { isFailure, isSuccess } from 'aelastics-result'

describe('Testing fromDTO for Tagged union', () => {
  it('should be valid fromDto for employeeType', () => {
    const d: DtoTypeOf<typeof examples.doctorType> = {
      ref: { id: 1, category: 'Object', typeName: 'doctorObject' },
      object: {
        profession: 'doctor',
        specialization: true,
        worksAt: 'Bel Medic'
      }
    }
    const res = examples.employeeType.fromDTO(d)
    expect(isSuccess(res)).toBe(true)
  })

  it('should not be valid fromDTO for employeeType in case of unsatisfied constraints', () => {
    const d: DtoTypeOf<typeof examples.doctorType> = {
      ref: { id: 1, category: 'Object', typeName: 'doctorObject' },
      object: {
        profession: 'doctor',
        specialization: true,
        worksAt: ''
      }
    }
    const res = examples.employeeType.fromDTO(d)
    expect(isSuccess(res)).toBe(false)
  })

  it('should be valid fromDTO message for employeeType in case of unsatisfied constraints', () => {
    const d: DtoTypeOf<typeof examples.doctorType> = {
      ref: { id: 1, category: 'Object', typeName: 'doctorObject' },
      object: {
        profession: 'doctor',
        specialization: true,
        worksAt: ''
      }
    }
    const res = examples.employeeType.fromDTO(d)
    if (isFailure(res)) {
      expect(examples.errorMessages(res)).toEqual(
        'Expected doctor:[object Object]/worksAt: to not be empty\n'
      )
    }
  })

  it('should be valid fromDto for employeeType with extra fields', () => {
    const d = {
      ref: { id: 1, category: 'Object', typeName: 'doctorObject' },
      object: {
        profession: 'doctor',
        specialization: true,
        worksAt: 'Bel Medic',
        age: 48
      }
    }
    const res = examples.employeeType.fromDTO((d as unknown) as any)
    expect(isSuccess(res)).toBe(true)
  })

  it('should not be valid fromDto for employeeType with missing fields', () => {
    const d = {
      ref: { id: 1, category: 'Object', typeName: 'doctorObject' },
      object: {
        profession: 'doctor',
        specialization: true
      }
    }
    const res = examples.employeeType.fromDTO((d as unknown) as any)
    expect(isSuccess(res)).toBe(false)
  })

  it('should not be valid fromDto for employeeType with wrong discriminator', () => {
    const d = {
      ref: { id: 1, category: 'Object', typeName: 'doctorObject' },
      object: {
        Profession: 'doctor',
        specialization: true,
        worksAt: 'Bel Medic'
      }
    }
    const res = examples.employeeType.fromDTO((d as unknown) as any)
    expect(isSuccess(res)).toBe(false)
  })
})
