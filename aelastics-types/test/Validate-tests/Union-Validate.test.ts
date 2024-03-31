import { isSuccess, isFailure } from 'aelastics-result'
import * as examples from '../complex-types-graph/testing-types'

describe('UnionTest', () => {
  it('Testing if 6 is a valid grade', () => {
    expect(isSuccess(examples.gradeType.validate(6))).toBe(true)
  })
  it('Testing if failed is a valid grade', () => {
    expect(isSuccess(examples.gradeType.validate('failed'))).toBe(true)
  })
  it('Testing if 15 is a valid grade', () => {
    expect(isSuccess(examples.gradeType.validate(15))).toBe(false)
  })
  it('Testing if null is a valid grade', () => {
    expect(isSuccess(examples.gradeType.validate((null as unknown) as any))).toBe(false)
  })
  it('Testing if undefined is a valid grade', () => {
    expect(isSuccess(examples.gradeType.validate((undefined as unknown) as any))).toBe(false)
  })
  it('Testing if object is a valid grade', () => {
    expect(isSuccess(examples.gradeType.validate(({} as unknown) as any))).toBe(false)
  })
  it('Testing if array is a valid grade', () => {
    expect(isSuccess(examples.gradeType.validate(([] as unknown) as any))).toBe(false)
  })
  it('Testing if unknown is a valid grade', () => {
    let a: unknown
    a = 6
    expect(isSuccess(examples.gradeType.validate((a as unknown) as any))).toBe(true)
  })
  it('Testing if profesor is of type employee', () => {
    let p = {
      name: 'Nikola',
      title: 'Msc'
    }
    expect(isSuccess(examples.EmployeeUnionType.validate(p))).toBe(true)
  })
  it('Testing if janitor is of type employee', () => {
    let p = {
      name: 'Milos',
      age: 45
    }
    expect(isSuccess(examples.EmployeeUnionType.validate(p))).toBe(true)
  })
  it('Testing if student is of type employee', () => {
    let s = {
      name: 'Stefan',
      averageMark: 10
    }
    let f = examples.EmployeeUnionType.validate((s as unknown) as any)
    if (isFailure(f)) {
      let st = examples.errorMessages(f)
      expect(st).toEqual("Value : '[object Object]' is not union: 'employee'\n")
    }
  })
})
