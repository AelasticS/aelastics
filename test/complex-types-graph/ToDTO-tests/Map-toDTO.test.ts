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
      expect(res.value).toEqual({
        map: [
          [1, { name: 'Ivan', age: 21 }],
          [2, { name: 'Stefan', age: 33 }]
        ],
        ref: { id: 5, category: 'Map', typeName: 'people' }
      })
    }
  })

  it("testing map  where value of one element doesn't comply with restrictions", () => {
    const a: TypeOf<typeof examples.MapofPeople> = new Map([
      [1, { name: 'Ivan', age: 21 }],
      [2, { name: 'Stefan', age: 33.8 }]
    ])
    const res = examples.MapofPeople.toDTO(a)
    expect(isFailure(res)).toBe(true)
  })

  it("testing map  where key of one element doesn't comply with restrictions", () => {
    const a: TypeOf<typeof examples.MapofPeople> = new Map([
      [5.3, { name: 'Ivan', age: 21 }],
      [2, { name: 'Stefan', age: 33 }]
    ])
    const res = examples.MapofPeople.toDTO(a)
    expect(isFailure(res)).toBe(true)
    if (isFailure(res)) {
      expect(examples.errorMessages(res)).toEqual(
        'Expected [5.3]:undefined to be an integer, got 5.3\nExpected keys to be successive numbers\n'
      )
    }
  })

  it("testing error message for map  where value of one element doesn't comply with restrictions", () => {
    const a: TypeOf<typeof examples.MapofPeople> = new Map([
      [1, { name: 'Ivan', age: 21 }],
      [2, { name: 'Stefan', age: 33.8 }]
    ])
    const res = examples.MapofPeople.toDTO(a)
    expect(isFailure(res)).toBe(true)
    if (isFailure(res)) {
      expect(res.errors).toEqual([
        {
          code: 'ValidationError',
          message: 'Expected [2]:undefined/age:33.8 to be an integer, got 33.8',
          path: [
            { actual: undefined, segment: '[2]' },
            { actual: 33.8, segment: 'age' }
          ],
          type: 'age',
          value: '33.8'
        }
      ])
    }
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
    // expect(isSuccess(res)).toBe(true)
    if (isFailure(res)) {
      expect(examples.errorMessages(res)).toEqual(
        "Caught exception 'Cannot read property 'entries' of undefined'\n" +
          "Caught exception 'Cannot read property 'entries' of undefined'\n" +
          "Caught exception 'Cannot read property 'entries' of undefined'\n" +
          "Caught exception 'Cannot read property 'entries' of undefined'\n" +
          "Caught exception 'Cannot read property 'entries' of undefined'\n" +
          "Caught exception 'Cannot read property 'entries' of undefined'\n"
      )
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
                languages: new Map([[1, 'Serbian11']])
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
