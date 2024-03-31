import * as examples from '../testing-types'
import { isSuccess, isFailure } from 'aelastics-result'
import * as t from '../../../src/aelastics-types'

describe('Testing fromDTO for subtype', () => {
  it('Testing fromDTO for valid examples.student object', () => {
    let s: t.DtoTypeOf<typeof examples.student> = {
      ref: { id: 1, category: 'Subtype', typeName: 'student' },
      object: {
        name: 'Nikola',
        age: 22,
        average: 9.5
      }
    }
    let res = examples.student.fromDTO(s)
    expect(isSuccess(res)).toBe(true)
  })

  it('Testing fromDTO for examples.student object in case of unsatisfied restrictions', () => {
    let s: t.DtoTypeOf<typeof examples.student> = {
      ref: { id: 1, category: 'Subtype', typeName: 'student' },
      object: {
        name: 'Nikola',
        age: 22,
        average: 12
      }
    }
    let res = examples.student.fromDTO(s)
    expect(isSuccess(res)).toBe(false)
  })

  it('Testing fromDTO error message for examples.student object in case of unsatisfied restrictions', () => {
    let s: t.DtoTypeOf<typeof examples.student> = {
      ref: { id: 1, category: 'Subtype', typeName: 'student' },
      object: {
        name: 'Nikola',
        age: 22.5,
        average: 12
      }
    }
    let res = examples.student.fromDTO(s)
    if (isFailure(res)) {
      expect(res.errors).toEqual([
        {
          code: 'ValidationError',
          message: 'Expected age:22.5 to be an integer, got 22.5',
          path: [{ actual: 22.5, segment: 'age' }],
          type: 'age',
          value: '22.5'
        },
        {
          code: 'ValidationError',
          message: 'Expected average:12 to be in range [6..10], got 12',
          path: [{ actual: 12, segment: 'average' }],
          type: 'averageGrade',
          value: '12'
        }
      ])
    }
  })

  it('Testing fromDTO for examples.professor object', () => {
    let s: t.DtoTypeOf<typeof examples.professor> = {
      ref: { id: 1, category: 'Subtype', typeName: 'professor' },
      object: {
        name: 'NIKOLA',
        age: 40,
        title: 'Phd'
      }
    }
    let res = examples.professor.fromDTO(s)
    expect(isSuccess(res)).toBe(true)
  })

  it('Testing fromDTO for examples.professor object in case of unsatisfied restrictions', () => {
    let s: t.DtoTypeOf<typeof examples.professor> = {
      ref: { id: 1, category: 'Subtype', typeName: 'professor' },
      object: {
        name: 'NIKOLa',
        age: 40,
        title: 'Phd'
      }
    }
    let res = examples.professor.fromDTO(s)
    expect(isSuccess(res)).toBe(false)
  })

  it('Testing fromDTO error message for examples.professor object in case of unsatisfied restrictions', () => {
    let s = {
      ref: { id: 1, category: 'Subtype', typeName: 'professor' },
      object: {
        name: 'NIKOLA',
        age: '40',
        title: 'Phd'
      }
    }
    let res = examples.professor.fromDTO((s as unknown) as any)
    if (isFailure(res)) {
      expect(res.errors).toEqual([
        {
          code: 'ValidationError',
          message: 'Expected age:40 to be an integer, got 40',
          path: [{ actual: '40', segment: 'age' }],
          type: 'age',
          value: '"40"'
        }
      ])
    }
  })
})
