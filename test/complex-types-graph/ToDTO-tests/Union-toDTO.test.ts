import { isSuccess, Result } from 'aelastics-result'
import * as examples from '../testing-types'
import { DoctorType, OccupationType, WorkerType } from '../../example/types-example'
import * as t from '../../../src/aelastics-types'

describe('ToDTO tests for union type', () => {
  it('Testing toDTO for grade 7 for gradeType', () => {
    const g: t.TypeOf<typeof examples.gradeType> = 7
    const res = examples.gradeType.toDTO(g)
    if (isSuccess(res)) {
      expect(res.value).toEqual({
        ref: { id: 1, category: 'Union', typeName: 'grade' },
        typeInUnion: 'PassingGrade',
        union: 7
      })
    }
  })
  it('Testing toDTO for grade failed for gradeType', () => {
    const g: t.TypeOf<typeof examples.gradeType> = 'failed'
    const res = examples.gradeType.toDTO(g)
    if (isSuccess(res)) {
      expect(res.value).toEqual({
        ref: { id: 1, category: 'Union', typeName: 'grade' },
        typeInUnion: '"failed"',
        union: 'failed'
      })
    }
  })
  it('Testing toDTO for grade 11 for gradeType', () => {
    const g: t.TypeOf<typeof examples.gradeType> = 11
    const res = examples.gradeType.toDTO(g)
    expect(isSuccess(res)).toBe(false)
  })

  it('Testing toDto for valid OccupationType object ', () => {
    const Doctor: t.TypeOf<typeof DoctorType> = {
      profession: 'Doctor',
      specialization: 'Cardiologist'
    }
    const res = OccupationType.toDTO(Doctor)
    if (isSuccess(res)) {
      expect(res.value).toEqual({
        ref: { id: 2, category: 'Union', typeName: '(DriverType | DoctorType)' },
        typeInUnion: 'DoctorType',
        union: {
          object: { profession: 'Doctor', specialization: 'Cardiologist' },
          ref: { id: 1, category: 'Object', typeName: 'DoctorType' }
        }
      })
    }
  })

  it('Testing toDto for valid OccupationType object with extra props ', () => {
    const Doctor = {
      profession: 'Doctor',
      specialization: 'Cardiologist',
      age: 22
    }
    const res = OccupationType.toDTO((Doctor as unknown) as any)
    if (isSuccess(res)) {
      expect(res.value).toEqual({
        ref: { id: 2, category: 'Union', typeName: '(DriverType | DoctorType)' },
        typeInUnion: 'DoctorType',
        union: {
          object: { profession: 'Doctor', specialization: 'Cardiologist' },
          ref: { id: 1, category: 'Object', typeName: 'DoctorType' }
        }
      })
    }
  })

  it('Testing toDto for invalid OccupationType object ', () => {
    const Doctor = {
      profession: 'Doctor',
      specialization: 'Dentist',
      age: 22
    }
    const res = OccupationType.toDTO((Doctor as unknown) as any)
    expect(isSuccess(res)).toBe(false)
  })

  it('Testing toDto for valid EmployeeUnionType object', () => {
    const empType: t.TypeOf<typeof examples.EmployeeUnionType> = {
      name: 'John',
      title: 'Phd'
    }
    const res = examples.EmployeeUnionType.toDTO(empType) as Result<t.DtoTypeOf<typeof WorkerType>>
    expect(isSuccess(res)).toBe(true)
  })

  it('Testing toDto for invalid EmployeeUnionType object', () => {
    const empType: t.TypeOf<typeof examples.EmployeeUnionType> = {
      name: 'John',
      title: 'Phd',
      age: 35
    }
    const res = WorkerType.toDTO((empType as unknown) as any)
    expect(isSuccess(res)).toBe(false)
  })
})
