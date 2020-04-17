import * as examples from '../testing-types'
import { DtoTypeOf } from '../../../src/aelastics-types'
import { isFailure, isSuccess } from 'aelastics-result'

describe('Testing fromDTO for Tagged union', () => {
  it('should be valid fromDto for employeeType', () => {
    const d: DtoTypeOf<typeof examples.employeeType> = {
      ref: { id: 2, category: 'taggedUnion', typeName: 'employee' },
      taggedUnion: {
        object: {
          profession: 'doctor',
          specialization: true,
          worksAt: 'Bel Medic'
        },
        ref: { id: 1, category: 'object', typeName: 'doctorObject' }
      }
    }
    const res = examples.employeeType.fromDTO(d)
    expect(isSuccess(res)).toBe(true)
  })

  it('should not be valid fromDTO for employeeType in case of unsatisfied constraints', () => {
    const d: DtoTypeOf<typeof examples.employeeType> = {
      ref: { id: 2, category: 'taggedUnion', typeName: 'employee' },
      taggedUnion: {
        object: {
          profession: 'doctor',
          specialization: true,
          worksAt: ''
        },
        ref: { id: 1, category: 'object', typeName: 'doctorObject' }
      }
    }
    const res = examples.employeeType.fromDTO(d)
    expect(isSuccess(res)).toBe(false)
  })

  it('should be valid fromDTO message for employeeType in case of unsatisfied constraints', () => {
    const d: DtoTypeOf<typeof examples.employeeType> = {
      ref: { id: 2, category: 'taggedUnion', typeName: 'employee' },
      taggedUnion: {
        object: {
          profession: 'doctor',
          specialization: true,
          worksAt: ''
        },
        ref: { id: 1, category: 'object', typeName: 'doctorObject' }
      }
    }
    const res = examples.employeeType.fromDTO(d)
    if (isFailure(res)) {
      expect(examples.errorMessages(res)).toEqual('Expected worksAt: to not be empty\n')
    }
  })

  it('should be valid fromDto for employeeType with extra fields', () => {
    const d = {
      ref: { id: 2, category: 'taggedUnion', typeName: 'employee' },
      taggedUnion: {
        object: {
          profession: 'doctor',
          specialization: true,
          worksAt: 'Bel Medic',
          age: 48
        },
        ref: { id: 1, category: 'object', typeName: 'doctorObject' }
      }
    }

    const res = examples.employeeType.fromDTO((d as unknown) as any)
    expect(isSuccess(res)).toBe(true)
  })

  it('should not be valid fromDto for employeeType with missing fields', () => {
    const d = {
      ref: { id: 2, category: 'taggedUnion', typeName: 'employee' },
      taggedUnion: {
        object: {
          profession: 'doctor',
          specialization: true
        },
        ref: { id: 1, category: 'object', typeName: 'doctorObject' }
      }
    }

    const res = examples.employeeType.fromDTO((d as unknown) as any)
    expect(isSuccess(res)).toBe(false)
    if (isFailure(res)) {
      expect(examples.errorMessages(res)).toEqual('missing property\n')
    }
  })

  it('should not be valid fromDto for employeeType with wrong discriminator', () => {
    const d = {
      ref: { id: 2, category: 'taggedUnion', typeName: 'employee' },
      taggedUnion: {
        object: {
          Profession: 'doctor',
          specialization: true,
          worksAt: 'Bel Medic'
        },
        ref: { id: 1, category: 'object', typeName: 'doctorObject' }
      }
    }
    const res = examples.employeeType.fromDTO((d as unknown) as any)
    expect(isSuccess(res)).toBe(false)
  })
})
