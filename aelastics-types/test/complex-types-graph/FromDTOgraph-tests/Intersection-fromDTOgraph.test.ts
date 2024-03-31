import { isSuccess, isFailure } from 'aelastics-result'
import * as t from '../../../src/common/Type'
import {
  recursive1,
  recursiveIntersection,
  secondLevelIntersectionObject
} from '../../example/recursive-example'

describe('Testing fromDTOgraph for IntersectionType', () => {
  it('Should be valid for examples.recursiveIntersection type', () => {
    let result = recursiveIntersection.toDTO(recursive1)
    if (isSuccess(result)) {
      let result2 = recursiveIntersection.fromDTO(result.value)
      if (isSuccess(result2)) {
        let recursive2 = result2.value
        expect(recursive2.b).toEqual('A')
        expect(recursive2.a).toEqual(recursive1.a)
      }
    }
  })
})
