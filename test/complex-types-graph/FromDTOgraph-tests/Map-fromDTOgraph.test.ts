import * as examples from '../testing-types'
import { isSuccess, isFailure } from 'aelastics-result'
import * as t from '../../../src/aelastics-types'
import * as r from '../../example/recursive-example'

let map1: t.DtoTypeOf<typeof r.rootMapGraph> = {
  ref: { id: 1, category: 'Map', typeName: 'rootMapGraph' },
  map: [
    [
      'mapa1',
      {
        ref: { id: 2, category: 'Map', typeName: "Array<Link^rootMapGraph>'" },
        array: []
        // map:[]
      }
    ]
  ]
}

let map2: t.DtoTypeOf<typeof r.rootMapGraph> = {
  ref: { id: 3, category: 'Map', typeName: 'rootMapGraph' },
  map: [
    [
      'mapa2',
      {
        ref: { id: 4, category: 'Array', typeName: "Array<Link^rootMapGraph>'" },
        array: []
        // map:[]
      }
    ]
  ]
}

let map3: t.DtoTypeOf<typeof r.rootMapGraph> = {
  ref: { id: 5, category: 'Map', typeName: 'rootMapGraph' },
  map: [
    [
      'mapa3',
      {
        ref: { id: 6, category: 'Array', typeName: "Array<Link^rootMapGraph>'" },
        array: []
        // map:[]
      }
    ]
  ]
}
describe('Testing fromDTOgraph method for MapType', () => {
  it('Should be valid for rootMapGraph', () => {
    map1.map.push(map2, map3)
    map1.map.push(map3)
    map2.map.push(map1, map3)
    map3.map.push(map1, map2)

    let res = r.rootMapGraph.fromDTOgraph(map1)

    if (isSuccess(res)) {
      expect(res.value).toEqual([['mapa1', [map2, map3]]])
    }
  })
})
