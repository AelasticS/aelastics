import { isFailure, isSuccess, Result } from 'aelastics-result'
import * as t from '../../../src/aelastics-types'
import * as tn from '../../example/travel-network'
// import {Belgrade} from '../../example/travel-network'

describe('Testing fromDTOgraph method of ObjectType', () => {
  it('Should be valid for Travel exemple in travel network', () => {
    let result = tn.Place.toDTO(tn.Belgrade)
    if (isSuccess(result)) {
      let result2 = tn.Place.fromDTO(result.value)
      if (isSuccess(result2)) {
        let Belgrade2 = result2.value
        expect(Belgrade2.name).toEqual(tn.Belgrade.name)
        expect(Belgrade2.neighbor.length).toEqual(tn.Belgrade.neighbor.length)
        let arr1 = []
        let arr2 = []
        for (let i = 0; i < tn.Belgrade.neighbor.length; i++) {
          arr1.push(((tn.Belgrade.neighbor[i] as any) as tn.IPlace).name)
        }
        for (let j = 0; j < Belgrade2.neighbor.length; j++) {
          arr2.push(((Belgrade2.neighbor[j] as any) as tn.IPlace).name)
        }
        expect(arr1).toEqual(jasmine.arrayContaining(arr2))
      }
    }
  })

  it('Should be valid for travel network (one place with itself)', () => {
    tn.NoviSad.neighbor.push(tn.NoviSad)

    let NoviSadDtoGraph = tn.Place.toDTO(tn.NoviSad)
    if (isSuccess(NoviSadDtoGraph)) {
      let NoviSadFromDto = tn.Place.fromDTO(NoviSadDtoGraph.value)
      if (isSuccess(NoviSadFromDto)) {
        let NoviSad2 = NoviSadFromDto.value
        expect((NoviSad2.neighbor[0] as tn.IPlace).name).toEqual(tn.Belgrade.name)
        expect((NoviSad2.neighbor[1] as tn.IPlace).name).toEqual(tn.NoviSad.name)
      }
    }

    tn.NoviSad.neighbor[1] = {}
  })

  it('Should be valid for loop', () => {
    let KraljevoDtoGraph = tn.Place.toDTO(tn.Kraljevo)
    if (isSuccess(KraljevoDtoGraph)) {
      let KraljevoFromDto = tn.Place.fromDTO(KraljevoDtoGraph.value)
      if (isSuccess(KraljevoFromDto)) {
        let Kraljevo2 = KraljevoFromDto.value
        expect((Kraljevo2.neighbor[0] as tn.IPlace).name).toEqual(tn.Nis.name)
        expect(((Kraljevo2.neighbor[0] as tn.IPlace).neighbor[0] as tn.IPlace).name).toEqual(
          tn.Belgrade.name
        )
        expect(
          (((Kraljevo2.neighbor[0] as tn.IPlace).neighbor[0] as tn.IPlace).neighbor[1] as tn.IPlace)
            .name
        ).toEqual(tn.Kraljevo.name)
      }
    }
  })
})
