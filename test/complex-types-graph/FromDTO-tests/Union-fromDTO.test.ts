import * as examples from '../testing-types'
import { isFailure, isSuccess } from 'aelastics-result'
import * as t from '../../../src/aelastics-types'

describe('fromDTO tests for Union type', () => {
  it('Testing fromDTO with basic case, should be true', () => {
    let pDTO: t.DtoTypeOf<typeof examples.EmployeeUnionType> = {
      ref: { id: 1, category: 'Union', typeName: 'employee' },
      typeInUnion: 'profesor',
      union: {
        ref: { id: 2, category: 'Object', typeName: 'profesor' },
        object: {
          name: 'Nick',
          title: 'Msc'
        }
      }
    }
    let p = examples.EmployeeUnionType.fromDTO(pDTO)
    expect(isSuccess(p)).toBe(true)
  })

  it('Testing fromDTO for EmployeeUnionType for wrong property value, should be false', () => {
    let pDTO: t.DtoTypeOf<typeof examples.EmployeeUnionType> = {
      ref: { id: 1, category: 'Union', typeName: 'employee' },
      typeInUnion: 'janitor',
      union: {
        ref: { id: 2, category: 'Object', typeName: 'janitor' },
        object: {
          name: 'Nick',
          age: -15
        }
      }
    }
    let p = examples.EmployeeUnionType.fromDTO((pDTO as unknown) as any)
    expect(isSuccess(p)).toBe(false)
  })

  it('Testing fromDTO message for EmployeeUnionType in case of unsatisfied constraint for fields', () => {
    let pDTO: t.DtoTypeOf<typeof examples.EmployeeUnionType> = {
      ref: { id: 1, category: 'Union', typeName: 'employee' },
      typeInUnion: 'profesor',
      union: {
        ref: { id: 2, category: 'Object', typeName: 'profesor' },
        object: {
          name: 'Nick11',
          title: 'Msc'
        }
      }
    }
    let p = examples.EmployeeUnionType.fromDTO(pDTO)
    if (isFailure(p)) {
      expect(examples.errorMessages(p)).toBe("Value : '[object Object]' is not union: 'employee'\n")
    }
  })

  it('Testing fromDTO for EmployeeUnionType with extra fields, should be true', () => {
    let pDTO = {
      ref: { id: 1, category: 'Union', typeName: 'employee' },
      typeInUnion: 'profesor',
      union: {
        ref: { id: 2, category: 'Object', typeName: 'profesor' },
        object: {
          name: 'Nick',
          title: 'Msc',
          surname: 'Scott'
        }
      }
    }
    let p = examples.EmployeeUnionType.fromDTO(pDTO)
    expect(isSuccess(p)).toBe(true)
  })

  it('Testing fromDTO with literal, should be true', () => {
    // let DtoType: t.DtoTypeOf<typeof examples.gradeType> = {
    //   ref:{id:1, category:'Union', typeName:'grade'},
    //   typeInUnion:'',
    //   union:'failed'
    //   };
    let g = examples.gradeType.fromDTO('failed')
    expect(isSuccess(g)).toBe(true)
    // if(isFailure(g))
    // {
    //   expect(g.errors).toEqual('')
    // }
  })

  it('Testing fromDTO message for gradeType in case of unsatisfied constraint for fields', () => {
    let g = examples.gradeType.fromDTO({
      ref: { id: 1, category: 'Union', typeName: 'grade' },
      typeInUnion: 'PassingGrade',
      union: 11
    })
    if (isFailure(g)) {
      expect(examples.errorMessages(g)).toBe("Value : '11' is not union: 'grade'\n")
    }
  })
})
