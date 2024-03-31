import { isSuccess, isFailure } from 'aelastics-result'
import * as t from '../../../src/aelastics-types'
import * as r from '../../complex-types-graph/testing-types'

describe('Testing fromDTO graph for TaggedUnion', () => {
  it('Should be valid for taggedUnionEmployee example', () => {
    let tuDtoGraph = r.employeeType.toDTO(r.taggedUnionEmployee)
    if (isSuccess(tuDtoGraph)) {
      let tuFromDto = r.employeeType.fromDTO(tuDtoGraph.value)
      if (isSuccess(tuFromDto)) {
        let tuggedUnion2 = tuFromDto.value
        expect(tuggedUnion2).toEqual({
          profession: 'doctor',
          specialization: true,
          worksAt: 'Bel Medic'
        })
      }
    }
  })
})
