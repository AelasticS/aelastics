import { isSuccess, isFailure } from 'aelastics-result'
import * as t from '../../../src/aelastics-types'
import * as r from '../../complex-types-graph/testing-types'

describe('Testing fromDto graph for Union Type', () => {
  it('should be valid for Union3 example from testing-types', () => {
    let union3DtoGraph = r.Union3.toDTO(r.thirdUnion)
    if (isSuccess(union3DtoGraph)) {
      let union3FromDto = r.Union3.fromDTO(union3DtoGraph.value)
      if (isSuccess(union3FromDto)) {
        let union3 = union3FromDto.value
        expect(union3).toEqual({
          name: 'Jack',
          age: 35
          // profession: 'Driver',
          // licences: ['A', 'B']
        })
      }
    }
  })
})
