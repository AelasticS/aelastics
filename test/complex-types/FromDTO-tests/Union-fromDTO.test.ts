import * as examples from '../testing-types'
import { isFailure , isSuccess } from 'aelastics-result'

describe('fromDTO tests for Union type' , () => {

  it('Testing fromDTO with basic case, should be true' , () => {
    let pDTO = {
      name : 'Nick' ,
      title : 'Msc'
    }
    let p = examples.EmployeeUnionType.fromDTO(pDTO , [])
    expect(isSuccess(p)).toBe(true)
  })

  it('Testing fromDTO for EmployeeUnionType in case of wrong field name, should be false ' , () => {
    let pDTO = {
      name : 'Nick' ,
      surname : 'Msc'
    }
    let p = examples.EmployeeUnionType.fromDTO(pDTO as unknown as any , [])
    expect(isSuccess(p)).toBe(false)
  })

  it('Testing fromDTO message for EmployeeUnionType in case of unsatisfied constraint for fields' , () => {
    let pDTO = {
      name : 'Nick11' ,
      title : 'Msc'
    }
    let p = examples.EmployeeUnionType.fromDTO(pDTO , [])
    if (isFailure(p)) {
      expect(examples.errorMessages(p)).toBe('Value : \'[object Object]\' is not union: \'employee\'\n')
    }
  })

  it('Testing fromDTO for EmployeeUnionType with extra fields, should be true' , () => {
    let pDTO = {
      name : 'Nick' ,
      title : 'Msc' ,
      surname : 'Scott'
    }
    let p = examples.EmployeeUnionType.fromDTO(pDTO , [])
    expect(isSuccess(p)).toBe(true)
  })

  it('Testing fromDTO with literal, should be true' , () => {
    let g = examples.gradeType.fromDTO('failed' , [])
    expect(isSuccess(g)).toBe(true)
  })

  it('Testing fromDTO message for gradeType in case of unsatisfied constraint for fields' , () => {
    let g = examples.gradeType.fromDTO(11 , [])
    if (isFailure(g)) {
      expect(examples.errorMessages(g)).toBe('Value : \'11\' is not union: \'grade\'\n')
    }
  })


})
