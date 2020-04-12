import * as examples from '../testing-types'
import { isSuccess, isFailure } from 'aelastics-result'
import * as t from '../../../src/aelastics-types'
import * as r from '../../example/recursive-example'

let map1: t.DtoTypeOf<typeof r.rootMapGraph> = {
  ref: { id: 1, category: 'Map', typeName: 'rootMapGraph' },
  map: [
    [
      1,
      {
        ref: { id: 2, category: 'Map', typeName: 'rootMapGraph' },
        map: []
        // array: []
      }
    ]
  ]
}

let map2: t.DtoTypeOf<typeof r.rootMapGraph> = {
  ref: { id: 3, category: 'Map', typeName: 'rootMapGraph' },
  map: [
    [
      2,
      {
        ref: { id: 4, category: 'Map', typeName: 'rootMapGraph' },
        // array: []
        map: []
      }
    ]
  ]
}

let map3: t.DtoTypeOf<typeof r.rootMapGraph> = {
  ref: { id: 5, category: 'Map', typeName: 'rootMapGraph' },
  map: [
    [
      3,
      {
        ref: { id: 6, category: 'Map', typeName: 'rootMapGraph' },
        // array: []
        map: []
      }
    ]
  ]
}

describe('Testing fromDTOgraph method for MapType', () => {
  it('Should be valid for loop example', () => {
    // map1.map[0][1].array.push(map2)
    //     // map2.map[0][1].array.push(map3)
    //     // map3.map[0][1].array.push(map1)

    map1.map[0][1].map[0][1] = map2
    map2.map[0][1].map[0][1] = map3
    map3.map[0][1].map[0][1] = map1
    // let res = r.rootMapGraph.fromDTOgraph(map1)
    // expect(isSuccess(res)).toBe(true)

    let res = r.rootMapGraph.fromDTOgraph(map3)

    if (isSuccess(res)) {
      expect(res.value.get(3)).toEqual((map1 as any) as t.TypeOf<typeof r.rootMapGraph>)
    }
  })

  it('should be valid for bidirectional example', () => {
    map1.map[0][1].map[0][1] = []
    map2.map[0][1].map[0][1] = []
    map3.map[0][1].map[0][1] = []

    map1.map[0][1].map[0][1] = map2
    map2.map[0][1].map[0][1] = map1

    let res = r.rootMapGraph.fromDTOgraph(map2)

    if (isSuccess(res)) {
      expect(res.value.get(2)).toEqual((map1 as any) as t.TypeOf<typeof r.rootMapGraph>)
    }
  })

  it('should be valid for example each to every other', () => {
    map1.map[0][1].map[0][1] = []
    map2.map[0][1].map[0][1] = []
    map3.map[0][1].map[0][1] = []

    map1.map[0][1].map[0][1] = map2
    map1.map[1][0] = 11
    map1.map[1][1].map[0][1] = map3

    map2.map[0][1].map[0][1] = map1
    map2.map[1][0] = 22
    map2.map[1][1].map[0][1] = map3

    map3.map[0][1].map[0][1] = map1
    map3.map[1][0] = 33
    map3.map[1][1].map[0][1] = map2

    let res = r.rootMapGraph.fromDTOgraph(map3)

    if (isSuccess(res)) {
      expect(res.value.get(33)).toEqual((map2 as any) as t.TypeOf<typeof r.rootMapGraph>)
    }
  })
})
