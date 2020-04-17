import { isFailure, isSuccess, Result } from 'aelastics-result'
import * as examples from '../testing-types'
import { DoctorType, OccupationType, WorkerType } from '../../example/types-example'
import * as t from '../../../src/aelastics-types'
import { london } from '../../example/instances-example'

describe('ToDTO tests for union type', () => {
  it('Testing toDTOtree for grade 7 for gradeType', () => {
    const g: t.TypeOf<typeof examples.gradeType> = 7
    const res = examples.gradeType.toDTOtree(g)
    if (isSuccess(res)) {
      expect(res.value).toBe(7)
    }
  })
  it('Testing toDTOtree for grade failed for gradeType', () => {
    const g: t.TypeOf<typeof examples.gradeType> = 'failed'
    const res = examples.gradeType.toDTOtree(g)
    if (isSuccess(res)) {
      expect(res.value).toBe('failed')
    }
  })
  it('Testing toDTOtree for grade 11 for gradeType', () => {
    const g: t.TypeOf<typeof examples.gradeType> = 11
    const res = examples.gradeType.toDTOtree(g)
    expect(isSuccess(res)).toBe(false)
  })

  it('Testing toDto for valid OccupationType object ', () => {
    const Doctor: t.TypeOf<typeof DoctorType> = {
      profession: 'Doctor',
      specialization: 'Cardiologist'
    }
    const res: any = OccupationType.toDTOtree(Doctor) as Result<t.DtoTypeOf<typeof OccupationType>>
    expect(isSuccess(res)).toBe(true)
    if (isSuccess(res)) {
      // @ts-ignore
      expect(res.value).toEqual({ profession: 'Doctor', specialization: 'Cardiologist' })
    }
  })

  it('Testing toDto for valid OccupationType object with extra props ', () => {
    const Doctor = {
      profession: 'Doctor',
      specialization: 'Cardiologist',
      age: 22
    }
    const res: any = OccupationType.toDTOtree((Doctor as unknown) as any)
    expect(isSuccess(res)).toBe(true)
    if (isSuccess(res)) {
      // @ts-ignore
      expect(res.value).toEqual({ profession: 'Doctor', specialization: 'Cardiologist' })
    }
  })

  it('Testing toDto for invalid OccupationType object ', () => {
    const Doctor = {
      profession: 'Doctor',
      specialization: 'Dentist',
      age: 22
    }
    const res = OccupationType.toDTOtree((Doctor as unknown) as any)
    expect(isSuccess(res)).toBe(false)
  })

  it('Testing toDto for valid EmployeeUnionType object', () => {
    const empType: t.TypeOf<typeof examples.EmployeeUnionType> = {
      name: 'John',
      title: 'Phd'
    }
    const res = examples.EmployeeUnionType.toDTOtree(empType) as Result<
      t.DtoTypeOf<typeof WorkerType>
    >
    expect(isSuccess(res)).toBe(true)
  })

  it('Testing toDto for invalid EmployeeUnionType object', () => {
    const empType: t.TypeOf<typeof examples.EmployeeUnionType> = {
      name: 'John',
      title: 'Phd',
      age: 35
    }
    const res = WorkerType.toDTOtree((empType as unknown) as any)

    expect(isSuccess(res)).toBe(false)
  })
})
