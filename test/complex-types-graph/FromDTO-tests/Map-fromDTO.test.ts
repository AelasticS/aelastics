import * as examples from '../testing-types'
import { isSuccess, isFailure } from 'aelastics-result'
import * as t from '../../../src/aelastics-types'

describe('fromDTO tests for Map', () => {
  it('testing fromDTO with some values that comply with restrictions', () => {
    let DTOObject: t.DtoTypeOf<typeof examples.MapofPeople> = {
      ref: { id: 1, category: 'Map', typeName: 'people' },
      map: [
        [
          1,
          {
            ref: { id: 2, category: 'Object', typeName: 'person' },
            object: {
              name: 'Ivan',
              age: 21
            }
          }
        ],
        [
          2,
          {
            ref: { id: 2, category: 'Object', typeName: 'person' },
            object: {
              name: 'Stefan',
              age: 33
            }
          }
        ]
      ]
    }
    let map = examples.MapofPeople.fromDTO(DTOObject)
    expect(isSuccess(map)).toBe(true)
  })
  it("testing fromDTO with some values that don't comply with restrictions (name)", () => {
    let DTOObject: t.DtoTypeOf<typeof examples.MapofPeople> = {
      ref: { id: 1, category: 'Map', typeName: 'people' },
      map: [
        [
          1,
          {
            ref: { id: 2, category: 'Object', typeName: 'person' },
            object: {
              name: 'Ivan25',
              age: 21
            }
          }
        ],
        [
          2,
          {
            ref: { id: 2, category: 'Object', typeName: 'person' },
            object: {
              name: 'Stefan',
              age: 33
            }
          }
        ]
      ]
    }
    let map = examples.MapofPeople.fromDTO(DTOObject)
    if (isFailure(map)) {
      let s = examples.errorMessages(map)
      expect(s).toEqual('Expected [0]:undefined/name:Ivan34 to be alphabetical, got `Ivan34`\n')
    }
  })

  it('testing fromDTO with some values that comply with restrictions for type examples.MapOfCountries', () => {
    let DTOObject: t.DtoTypeOf<typeof examples.MapOfCountries> = {
      ref: { id: 1, category: 'Map', typeName: 'map of countries' },
      map: [
        [
          1,
          {
            ref: { id: 2, category: 'Object', typeName: 'country' },
            object: {
              name: 'Serbia',
              cities: {
                ref: { id: 3, category: 'Map', typeName: 'map of cities' },
                map: [
                  [
                    1,
                    {
                      ref: { id: 4, category: 'Object', typeName: 'city' },
                      object: {
                        name: 'Belgrade',
                        languages: {
                          ref: { id: 5, category: 'Map', typeName: 'map of languages' },
                          map: [[1, 'Serbian']]
                        }
                      }
                    }
                  ],
                  [
                    2,
                    {
                      ref: { id: 6, category: 'Object', typeName: 'city' },
                      object: {
                        name: 'Subotica',
                        languages: {
                          ref: { id: 7, category: 'Map', typeName: 'map of languages' },
                          map: [
                            [1, 'Serbian'],
                            [2, 'Hungarian']
                          ]
                        }
                      }
                    }
                  ]
                ]
              }
            }
          }
        ],
        [
          2,
          {
            ref: { id: 8, category: 'Object', typeName: 'country' },
            object: {
              name: 'Germany',
              cities: {
                ref: { id: 9, category: 'Map', typeName: 'map of cities' },
                map: [
                  [
                    1,
                    {
                      ref: { id: 10, category: 'Object', typeName: 'city' },
                      object: {
                        name: 'Berlin',
                        languages: {
                          ref: { id: 11, category: 'Map', typeName: 'map of languages' },
                          map: [
                            [1, 'German'],
                            [2, 'English']
                          ]
                        }
                      }
                    }
                  ]
                ]
              }
            }
          }
        ]
      ]
    }
    let map = examples.MapOfCountries.fromDTO(DTOObject)
    expect(isSuccess(map)).toBe(true)
  })

  // CHECK !!! SOME ERROR
  it("testing fromDTO with some values that don't comply with restrictions for type examples.MapOfCountries ", () => {
    let DTOObject: t.DtoTypeOf<typeof examples.MapOfCountries> = {
      ref: { id: 1, category: 'Map', typeName: 'map of countries' },
      map: [
        [
          1,
          {
            ref: { id: 2, category: 'Object', typeName: 'country' },
            object: {
              name: '',
              cities: {
                ref: { id: 3, category: 'Map', typeName: 'map of cities' },
                map: [
                  [
                    1,
                    {
                      ref: { id: 4, category: 'Object', typeName: 'city' },
                      object: {
                        name: 'Belgrade154',
                        languages: {
                          ref: { id: 5, category: 'Map', typeName: 'map of languages' },
                          map: [[1, 'Serbian1122']]
                        }
                      }
                    }
                  ],
                  [
                    2,
                    {
                      ref: { id: 6, category: 'Object', typeName: 'city' },
                      object: {
                        name: 'Subotica',
                        languages: {
                          ref: { id: 7, category: 'Map', typeName: 'map of languages' },
                          map: [
                            [1, 'Serbian'],
                            [2, 'Hungarian']
                          ]
                        }
                      }
                    }
                  ]
                ]
              }
            }
          }
        ]
      ]
    }

    let map = examples.MapOfCountries.fromDTO(DTOObject)
    expect(isSuccess(map)).toBe(true)
    // This shouldn't be true
    if (isFailure(map)) {
      //  let s = examples.errorMessages(map)
      expect(map.errors).toEqual('')
    }
  })
})
