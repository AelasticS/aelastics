import * as examples from '../testing-types'
import { isSuccess, isFailure } from 'aelastics-result'

describe('fromDTO tests for Map', () => {
  it('testing fromDTO with some values that comply with restrictions', () => {
    let DTOObject = [
      [
        1,
        {
          name: 'Ivan',
          age: 21
        }
      ],
      [
        2,
        {
          name: 'Stefan',
          age: 33
        }
      ]
    ]
    let map = examples.MapofPeople.fromDTO(DTOObject, [])
    expect(isSuccess(map)).toBe(true)
  })
  it("testing fromDTO with some values that don't comply with restrictions (name)", () => {
    let DTOObject = [
      [
        1,
        {
          name: 'Ivan34',
          age: 21
        }
      ],
      [
        2,
        {
          name: 'Stefan',
          age: 33
        }
      ]
    ]
    let map = examples.MapofPeople.fromDTO(DTOObject, [])
    if (isFailure(map)) {
      let s = examples.errorMessages(map)
      expect(s).toEqual('Expected [0]:undefined/name:Ivan34 to be alphabetical, got `Ivan34`\n')
    }
  })

  it('testing fromDTO with some values that comply with restrictions for type examples.MapOfCountries', () => {
    let DTOObject = [
      [
        1,
        {
          name: 'Serbia',
          cities: [
            [1, { name: 'Belgrade', languages: [[1, 'Serbian']] }],
            [
              2,
              {
                name: 'Subotica',
                languages: [
                  [1, 'Serbian'],
                  [2, 'Hungarian']
                ]
              }
            ]
          ]
        }
      ],
      [
        2,
        {
          name: 'Germany',
          cities: [
            [
              1,
              {
                name: 'Berlin',
                languages: [
                  [1, 'German'],
                  [2, 'English']
                ]
              }
            ]
          ]
        }
      ]
    ]
    let map = examples.MapOfCountries.fromDTO(DTOObject, [])
    expect(isSuccess(map)).toBe(true)
  })

  it("testing fromDTO with some values that don't comply with restrictions for type examples.MapOfCountries ", () => {
    let DTOObject = [
      [
        1,
        {
          name: 'Serbia',
          cities: [
            [1, { name: 'Belgrade.', languages: [[1, 'Serbian1']] }],
            [
              2,
              {
                name: 'Subotica',
                languages: [
                  [1, 'Serbian'],
                  [2, 'Hungarian']
                ]
              }
            ]
          ]
        }
      ],
      [
        2,
        {
          name: 'Germany',
          cities: [
            [
              1,
              {
                name: 'Berlin',
                languages: [
                  [1, 'German'],
                  [2, 'English']
                ]
              }
            ]
          ]
        }
      ]
    ]
    let map = examples.MapOfCountries.fromDTO(DTOObject, [])
    if (isFailure(map)) {
      let s = examples.errorMessages(map)
      expect(s).toEqual(
        'Expected [0]:undefined/cities:1,[object Object],2,[object Object]/[0]:undefined/name:Belgrade. to be alphabetical, got `Belgrade.`\nExpected [0]:undefined/cities:1,[object Object],2,[object Object]/[0]:undefined/languages:1,Serbian1/[0]:undefined to be alphabetical, got `Serbian1`\n'
      )
    }
  })
})
