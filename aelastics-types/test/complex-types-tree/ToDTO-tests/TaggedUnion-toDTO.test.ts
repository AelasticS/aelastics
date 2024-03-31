import * as examples from '../testing-types'
import { isFailure, isSuccess } from 'aelastics-result'
import * as t from '../../../src/aelastics-types'

describe('toDTOtree test cases for TaggedUnion', () => {
  it('Testing if valid doctor will serialize into dto of employee type', () => {
    const doc: t.TypeOf<typeof examples.doctorType> = {
      profession: 'doctor',
      specialization: true,
      worksAt: 'Prinston plainsbro'
    }
    const res = examples.employeeType.toDTOtree(doc)
    if (isSuccess(res)) {
      expect(res.value).toEqual({
        profession: 'doctor',
        specialization: true,
        worksAt: 'Prinston plainsbro'
      })
    }
  })
  it('Testing if valid lawyer will serialize into dto of employee type', () => {
    const doc: t.TypeOf<typeof examples.lawyerType> = {
      profession: 'lawyer',
      masterDegree: true,
      worksAt: 'Goliath National Bank'
    }
    const res = examples.employeeType.toDTOtree(doc)
    if (isSuccess(res)) {
      expect(res.value).toEqual({
        profession: 'lawyer',
        masterDegree: true,
        worksAt: 'Goliath National Bank'
      })
    }
  })
  it('Testing if invalid lawyer will serialize into dto of employee type', () => {
    const doc: t.TypeOf<typeof examples.lawyerType> = {
      profession: 'lawyer',
      masterDegree: true,
      worksAt: ''
    }
    const res = examples.employeeType.toDTOtree(doc)
    expect(isSuccess(res)).toBe(false)
  })
  it('Testing error message for invalid lawyer serializing into dto of employee type', () => {
    const doc: t.TypeOf<typeof examples.lawyerType> = {
      profession: 'lawyer',
      masterDegree: true,
      worksAt: ''
    }
    const res = examples.employeeType.toDTOtree(doc)
    expect(isFailure(res)).toBe(true)
    if (isFailure(res)) {
      expect(res.errors).toEqual([
        {
          code: 'ValidationError',
          message: 'Expected worksAt: to not be empty',
          path: [{ actual: '', segment: 'worksAt' }],
          type: '',
          value: '""'
        }
      ])
    }
  })
  it('', () => {
    const t1 = t.object({
      a: t.literal('a'),
      b: t.literal(3)
    })
    const t2 = t.object({
      a: t.literal('b'),
      c: t.string
    })

    try {
      const type = t.taggedUnion({ t1, t2 }, 'b')
      let ty1: t.TypeOf<typeof t1> = {
        a: 'a',
        b: 3
      }
      expect(isSuccess(type.toDTOtree(ty1)))

      // tslint:disable-next-line:no-empty
    } catch (error) {}
  })
})
