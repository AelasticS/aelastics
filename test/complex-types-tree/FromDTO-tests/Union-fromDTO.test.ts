import * as examples from '../testing-types'
import { isFailure, isSuccess } from 'aelastics-result'

describe('fromDTOtree tests for Union type', () => {
  it('Testing fromDTOtree with basic case, should be true', () => {
    let pDTO = {
      name: 'Nick',
      title: 'Msc'
    }
    let p = examples.EmployeeUnionType.fromDTOtree((pDTO as unknown) as any)
    expect(isSuccess(p)).toBe(true)
  })

  it('Testing fromDTOtree for EmployeeUnionType in case of wrong field name, should be false ', () => {
    let pDTO = {
      name: 'Nick',
      surname: 'Msc'
    }
    let p = examples.EmployeeUnionType.fromDTOtree((pDTO as unknown) as any)
    expect(isSuccess(p)).toBe(false)
  })

  it('Testing fromDTOtree message for EmployeeUnionType in case of unsatisfied constraint for fields', () => {
    let pDTO = {
      name: 'Nick11',
      title: 'Msc'
    }
    let p = examples.EmployeeUnionType.fromDTOtree((pDTO as unknown) as any)
    if (isFailure(p)) {
      expect(examples.errorMessages(p)).toBe(
        'Value \'{"name":"Nick11","title":"Msc"}\' is not member of union \'employee\'\n'
      )
    }
  })

  it('Testing fromDTOtree for EmployeeUnionType with extra fields, should be true', () => {
    let pDTO = {
      name: 'Nick',
      title: 'Msc',
      surname: 'Scott'
    }
    let p = examples.EmployeeUnionType.fromDTOtree((pDTO as unknown) as any)
    expect(isSuccess(p)).toBe(true)
  })

  it('Testing fromDTOtree with literal, should be true', () => {
    let g = examples.gradeType.fromDTOtree('failed')
    expect(isSuccess(g)).toBe(true)
  })

  it('Testing fromDTOtree message for gradeType in case of unsatisfied constraint for fields', () => {
    let g = examples.gradeType.fromDTOtree(11)
    if (isFailure(g)) {
      expect(examples.errorMessages(g)).toBe("Value '11' is not member of union 'grade'\n")
    }
  })
})
