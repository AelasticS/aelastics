import * as examples from '../testing-types'
import { isSuccess, isFailure } from 'aelastics-result'
import * as t from '../../../src/aelastics-types'
import * as r from '../../example/recursive-example'
import { map3 } from '../../example/recursive-example'

describe('Testing fromDTOgraph method for MapType', () => {
  it('should be valid for bidirectional example', () => {
    let map1DtoGraph = r.rootMapGraph.toDTO(r.map1)

    if (isSuccess(map1DtoGraph)) {
      let map1FromDto = r.rootMapGraph.fromDTO(map1DtoGraph.value)
      if (isSuccess(map1FromDto)) {
        let firstMap = map1FromDto.value
        expect(firstMap.size).toEqual(r.map1.size)
        expect(firstMap.get(1)).toEqual(r.map1.get(1))
        expect(firstMap.get(1)).toEqual(r.map2)
        expect((firstMap.get(1) as t.TypeOf<typeof r.rootMapGraph>).get(1)).toEqual(r.map1)
      }
    }
  })

  it('should be valid for example one map maps itself', () => {
    r.map3.set(2, r.map3)

    let map3DtoGraph = r.rootMapGraph.toDTO(r.map3)
    if (isSuccess(map3DtoGraph)) {
      let map3FromDto = r.rootMapGraph.fromDTO(map3DtoGraph.value)
      if (isSuccess(map3FromDto)) {
        let thirdMap = map3FromDto.value
        expect(thirdMap.size).toEqual(1)
        expect(thirdMap.get(2)).toEqual(r.map3.get(2))
      }
    }

    r.map3.delete(2)
  })

  it('should be valid for loop', () => {
    r.map1.set(2, map3)

    let map1DtoGraph = r.rootMapGraph.toDTO(r.map1)
    if (isSuccess(map1DtoGraph)) {
      let map1FromDto = r.rootMapGraph.fromDTO(map1DtoGraph.value)
      if (isSuccess(map1FromDto)) {
        let firstMap = map1FromDto.value
        expect(firstMap.size).toEqual(r.map1.size)
        expect(firstMap.size).toEqual(2)
        expect(firstMap.get(2)).toEqual(r.map1.get(2))
      }
    }

    r.map1.delete(2)
  })
})
