import { isSuccess, Result } from 'aelastics-result'
import * as examples from '../testing-types'
import { DoctorType, OccupationType, WorkerType } from '../../example/types-example'
import * as t from '../../../src/aelastics-types'
import { london } from '../../example/instances-example'

describe('ToDTO tests for union type', () => {
  it('Testing toDTO for grade 7 for gradeType', () => {
    const g: t.TypeOf<typeof examples.gradeType> = 7
    const res = examples.gradeType.toDTO(g)
    if (isSuccess(res)) {
      expect(res.value).toBe(7)
    }
  })
  it('Testing toDTO for grade failed for gradeType', () => {
    const g: t.TypeOf<typeof examples.gradeType> = 'failed'
    const res = examples.gradeType.toDTO(g)
    if (isSuccess(res)) {
      expect(res.value).toBe('failed')
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
    const res: any = OccupationType.toDTO(Doctor) as Result<t.DtoTypeOf<typeof OccupationType>>
    if (isSuccess(res)) {
      // @ts-ignore
      expect(
        res.value.union.object.profession === 'Doctor' &&
          res.value.union.object.specialization === 'Cardiologist'
      ).toBe(true)
    }
  })

  it('Testing toDto for valid OccupationType object with extra props ', () => {
    const Doctor = {
      profession: 'Doctor',
      specialization: 'Cardiologist',
      age: 22
    }
    const res: any = OccupationType.toDTO((Doctor as unknown) as any)
    if (isSuccess(res)) {
      // @ts-ignore
      expect(
        res.value.union.object.profession === 'Doctor' &&
          res.value.union.object.specialization === 'Cardiologist'
      ).toBe(true)
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

  it('Testing toDto for valid complex Worker object', () => {
    const john: t.TypeOf<typeof WorkerType> = {
      name: 'John',
      age: 35,
      sex: 'male',
      birthPlace: london,
      occupation: { profession: 'Driver', licences: ['B', 'C'] },
      children: [{ name: 'Peter' }, { name: 'Helen' }]
    }
    const res = WorkerType.toDTO(john) as Result<t.DtoTypeOf<typeof WorkerType>>
    if (isSuccess(res)) {
      expect(res.value.object.occupation).toBe({ profession: 'Driver', licences: ['B', 'C'] })
    }
  })

  it('Testing toDto for invalid complex Worker object', () => {
    const john = {
      name: 'John',
      age: 35,
      sex: 'male',
      birthPlace: london,
      occupation: { profession: 'Driver1', licences: ['B', 'C'] },
      children: [{ name: 'Peter' }, { name: 'Helen' }]
    }
    const res = WorkerType.toDTO((john as unknown) as any)

    expect(isSuccess(res)).toBe(false)
  })
})
