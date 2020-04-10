import * as examples from '../testing-types'

import { TypeOf } from '../../../src/aelastics-types'
import { isSuccess, isFailure } from 'aelastics-result'

describe('toDTO test cases for Map', () => {
  it('Testing  for some regular map of people', () => {
    const a: TypeOf<typeof examples.MapofPeople> = new Map([
      [1, { name: 'Ivan', age: 21 }],
      [2, { name: 'Stefan', age: 33 }]
    ])
    const res = examples.MapofPeople.toDTO(a)
    if (isSuccess(res)) {
      expect(res.value).toEqual([
        [1, { name: 'Ivan', age: 21 }],
        [2, { name: 'Stefan', age: 33 }]
      ])
    }
  })
  it("testing for some map  where value of one element doesn't comply with restrictions", () => {
    const a: TypeOf<typeof examples.MapofPeople> = new Map([
      [1, { name: 'Ivan', age: 21 }],
      [2, { name: 'Stefan', age: 33.8 }]
    ])
    const res = examples.MapofPeople.toDTO(a)
    expect(isFailure(res)).toBe(true)
  })
  it("testing for some map  where key of one element doesn't comply with restrictions", () => {
    const a: TypeOf<typeof examples.MapofPeople> = new Map([
      [5.3, { name: 'Ivan', age: 21 }],
      [2, { name: 'Stefan', age: 33 }]
    ])
    const res = examples.MapofPeople.toDTO(a)
    if (isFailure(res)) {
      expect(examples.errorMessages(res)).toEqual(
        'Expected [5.3]:undefined to be an integer, got 5.3\nExpected keys to be successive numbers\n'
      )
    }
  })

  it("testing for some map  where key of one element doesn't comply with restrictions(validator false)", () => {
    const a: TypeOf<typeof examples.MapofPeople> = new Map([
      [5.3, { name: 'Ivan', age: 21 }],
      [2, { name: 'Stefan', age: 33 }]
    ])
    const res = examples.MapofPeople.toDTO(a)
    if (isSuccess(res)) {
      expect(res.value).toEqual([
        [5.3, { name: 'Ivan', age: 21 }],
        [2, { name: 'Stefan', age: 33 }]
      ])
    }
  })
  it("testing for some map  where value of one element doesn't comply with restrictions(validator false)", () => {
    const a: TypeOf<typeof examples.MapofPeople> = new Map([
      [1, { name: 'Ivan', age: 21 }],
      [2, { name: 'Stefan', age: 33.8 }]
    ])
    const res = examples.MapofPeople.toDTO(a)
    expect(isSuccess(res)).toBe(true)
  })
  it('Testing for some valid map of countries', () => {
    const countries: TypeOf<typeof examples.MapOfCountries> = new Map([
      [
        1,
        {
          name: 'Serbia',
          cities: new Map([
            [
              1,
              {
                name: 'Vladicin Han',
                languages: new Map([[1, 'Serbian']])
              }
            ],
            [
              2,
              {
                name: 'Bosilegrad',
                languages: new Map([
                  [1, 'Serbian'],
                  [2, 'Bulgarian']
                ])
              }
            ]
          ])
        }
      ],
      [
        2,
        {
          name: 'Japan',
          cities: new Map([
            [
              1,
              {
                name: 'Tokio',
                languages: new Map([
                  [1, 'Japanese'],
                  [2, 'Engilsh']
                ])
              }
            ],
            [
              2,
              {
                name: 'Kyoto',
                languages: new Map([[1, 'Japanese']])
              }
            ]
          ])
        }
      ]
    ])
    const res = examples.MapOfCountries.toDTO(countries)
    if (isFailure(res)) {
      expect(examples.errorMessages(res)).toEqual('')
    }
  })
  it('Testing for map where language is not valid', () => {
    const countries: TypeOf<typeof examples.MapOfCountries> = new Map([
      [
        1,
        {
          name: 'Serbia',
          cities: new Map([
            [
              1,
              {
                name: 'Vladicin Han',
                languages: new Map([[1, 'Serbian']])
              }
            ],
            [
              2,
              {
                name: 'Bosilegrad',
                languages: new Map([
                  [1, 'Serbian'],
                  [2, 'Bulgarian']
                ])
              }
            ]
          ])
        }
      ],
      [
        2,
        {
          name: 'Japan',
          cities: new Map([
            [
              1,
              {
                name: 'Tokio',
                languages: new Map([
                  [1, 'Japanese'],
                  [2, 'Engilsh']
                ])
              }
            ],
            [
              2,
              {
                name: 'Kyoto',
                languages: new Map([[1, 'Japanese23']])
              }
            ]
          ])
        }
      ]
    ])
    expect(isSuccess(examples.MapOfCountries.toDTO(countries))).toBe(false)
  })
})
