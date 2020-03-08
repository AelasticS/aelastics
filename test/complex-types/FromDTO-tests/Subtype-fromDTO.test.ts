import * as examples from '../testing-types'
import { isSuccess , isFailure } from 'aelastics-result'


describe('Testing fromDTO for subtype' , () => {
  it('Testing fromDTO for valid examples.student object' , () => {
    let s = {
      name : 'Nikola' ,
      age : 22 ,
      average : 9.5
    }
    let res = examples.student.fromDTO(s , [])
    expect(isSuccess(res)).toBe(true)

  })

  it('Testing fromDTO for examples.student object in case of unsatisfied restrictions' , () => {
    let s = {
      name : 'Nikola' ,
      age : 22 ,
      average : 12
    }
    let res = examples.student.fromDTO(s , [])
    expect(isSuccess(res)).toBe(false)
  })

  it('Testing fromDTO error message for examples.student object in case of unsatisfied restrictions' , () => {
    let s = {
      name : 'Nikola' ,
      age : 22.5 ,
      average : 12
    }
    let res = examples.student.fromDTO(s , [])
    if (isFailure(res)) {
      expect(res.errors).toEqual(
        [
          {
            'code' : 'ValidationError' ,
            'message' : 'Expected average:12 to be in range [6..10], got 12' ,
            'path' : [
              {
                'actual' : 12 ,
                'segment' : 'average'
              }
            ] ,
            'type' : 'averageGrade' ,
            'value' : '12'
          }
        ])
    }
  })

  it('Testing fromDTO for examples.professor object' , () => {
    let s = {
      name : 'NIKOLA' ,
      age : 40 ,
      title : 'Phd'
    }
    let res = examples.professor.fromDTO(s , [])
    expect(isSuccess(res)).toBe(true)
  })

  it('Testing fromDTO for examples.professor object in case of unsatisfied restrictions' , () => {
    let s = {
      name : 'NIKOLa' ,
      age : 40 ,
      title : 'Phd'
    }
    let res = examples.professor.fromDTO(s , [])
    expect(isSuccess(res)).toBe(false)
  })

  it('Testing fromDTO error message for examples.professor object in case of unsatisfied restrictions' , () => {
    let s = {
      name : 'NIKOLA' ,
      age : '40' ,
      title : 'Phd'
    }
    let res = examples.professor.fromDTO(s as unknown as any , [])
    if (isFailure(res)) {
      expect(res.errors).toEqual([
          {
            'code' : 'ValidationError' ,
            'message' : 'Expected age:40 to be an integer, got 40' ,
            'path' : [
              {
                'actual' : '40' ,
                'segment' : 'age'
              }
            ] ,
            'type' : 'age' ,
            'value' : '"40"'
          }
        ]
      )
    }
  })
})
