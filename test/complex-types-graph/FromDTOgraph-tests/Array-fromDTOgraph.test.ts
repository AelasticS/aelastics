import { isSuccess, isFailure, Failure } from 'aelastics-result'
import * as examples from '../../example/recursive-example'

describe('Testing fromDto graph for Array Type', () => {
  it('Should be valid for simple cyclic example', () => {
    let arrDtoGraph = examples.firstLevelArray.toDTO(examples.f)
    if (isSuccess(arrDtoGraph)) {
      let arrFromDto = examples.firstLevelArray.fromDTO(arrDtoGraph.value)
      if (isSuccess(arrFromDto)) {
        let f2 = arrFromDto.value
        expect(f2.length).toEqual(examples.f.length)
        expect(f2.length).toEqual(2)
        expect(f2[0].a).toEqual(examples.f[0].a)
        expect(f2[0].b).toEqual(10)
        expect(f2[1].a).toEqual(examples.f[1].a)
        expect(f2[1].b).toEqual(20)
      }
    }
  })
})
