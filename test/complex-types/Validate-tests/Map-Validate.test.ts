import { isSuccess , isFailure } from 'aelastics-result'
import * as examples from '../testing-types'

describe('Map tests' , () => {

  it('Testing if regular map is of type examples.MapofPeople' , () => {
    let people = new Map([
      [1 , { name : 'Ivan' , age : 21 }] ,
      [2 , { name : 'Stefan' , age : 33 }]
    ])
    expect(isSuccess(examples.MapofPeople.validate(people))).toBe(true)
  })

  it('Testing if regular map who\'s keys arent successive numbers is of type examples.MapofPeople' , () => {
    let people = new Map([
      [1 , { name : 'Ivan' , age : 21 }] ,
      [3 , { name : 'Stefan' , age : 33 }] ,
      [22 , { name : 'Stefan' , age : 36 }]
    ])
    expect(isSuccess(examples.MapofPeople.validate(people))).toBe(false)
  })
  it('Testing if regular map whose values don\'t comply with restrictions (name) is of type examples.MapofPeople' , () => {
    let people = new Map([
      [1 , { name : 'Ivan34' , age : 21 }] ,
      [2 , { name : 'Stefan' , age : 33 }]
    ])
    let f = examples.MapofPeople.validate(people , [])
    if (isFailure(f)) {
      let s = examples.errorMessages(f)
      expect(s).toEqual(
        'Expected [1]:undefined/name:Ivan34 to be alphabetical, got `Ivan34`\n'
      )
    }
  })
  it('Testing if regular map whose values don\'t comply with restrictions (name and age) is of type examples.MapofPeople' , () => {
    let people = new Map([
      [1 , { name : 'Ivan34' , age : 21.3 }] ,
      [2 , { name : 'Stefan' , age : 33 }]
    ])
    let f = examples.MapofPeople.validate(people , [])
    if (isFailure(f)) {
      let s = examples.errorMessages(f)
      expect(s).toEqual(
        'Expected [1]:undefined/name:Ivan34 to be alphabetical, got \`Ivan34\`\nExpected [1]:undefined/age:21.3 to be an integer, got 21.3\n'
      )
    }
  })
  it('Testing if regular map whose value has some other property is of type examples.MapofPeople' , () => {
    let people = new Map([
      [1 , { name : 'Ivan' , age : 21 , married : true }] ,
      [2 , { name : 'Stefan' , age : 33 }]
    ])
    expect(isSuccess(examples.MapofPeople.validate(people , []))).toBe(true)
  })
  it('Testing if  map whose key is not integer is of type examples.MapofPeople' , () => {
    let people = new Map([
      [1 , { name : 'Ivan' , age : 21 , married : true }] ,
      [2.3 , { name : 'Stefan' , age : 33 }]
    ])
    expect(isSuccess(examples.MapofPeople.validate(people , []))).toBe(false)
  })
  it('Testing if regular map is of type examples.MapOfCountries' , () => {
    let countries = new Map([
      [1 , {
        name : 'Serbia' ,
        cities : new Map([[1 , { name : 'Belgrade' , languages : new Map([[1 , 'Serbian']]) }] ,
          [2 , { name : 'Subotica' , languages : new Map([[1 , 'Serbian'] , [2 , 'Hungarian']]) }]])
      }] ,
      [2 , {
        name : 'Germany' ,
        cities : new Map([[1 , {
          name : 'Berlin' ,
          languages : new Map([[1 , 'German'] , [2 , 'English']])
        }]])
      }]
    ])
    expect(isSuccess(examples.MapOfCountries.validate(countries , []))).toBe(true)
  })

  it('Testing if regular map whose values don\'t comply with restrictions is of type examples.MapOfCountries' , () => {
    let countries = new Map([
      [1 , {
        name : 'Serbia' ,
        cities : new Map([[1 , { name : 'Belgrade.' , languages : new Map([[1 , 'Serbian1']]) }] ,
          [2 , { name : 'Subotica' , languages : new Map([[1 , 'Serbian'] , [2 , 'Hungarian']]) }]])
      }]
    ])
    let f = examples.MapOfCountries.validate(countries , [])
    if (isFailure(f)) {
      let s = examples.errorMessages(f)
      expect(s).toEqual(
        'Expected [1]:undefined/cities:[object Map]/[1]:undefined/name:Belgrade. to be alphabetical, got `Belgrade.`\nExpected [1]:undefined/cities:[object Map]/[1]:undefined/languages:[object Map]/[1]:undefined to be alphabetical, got `Serbian1`\n'
      )
    }
  })

  it('Testing if regular map with wrong index values is of type examples.MapOfCountries' , () => {
    let countries = new Map([
      [6 , {
        name : 'Serbia' , cities : new Map(
          [[1 , {
            name : 'Belgrade' , languages : new Map(
              [[-1 , 'Serbian']])
          }] ,
            [2 , {
              name : 'Subotica' , languages : new Map(
                [[1 , 'Serbian'] , [7 , 'Hungarian']])
            }]])
      }]
    ])
    expect(isSuccess(examples.MapOfCountries.validate(countries , []))).toBe(true)
  })


})
