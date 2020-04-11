import { isFailure, isSuccess, Result } from 'aelastics-result'
import * as t from '../../../src/aelastics-types'
import * as tn from '../../example/travel-network'

let Belgrade: tn.IPlaceGraph = {
  ref: { id: 1, category: 'Object', typeName: 'Place' },
  object: {
    name: 'Belgrade',
    neighbor: {
      ref: { id: 2, category: 'Array', typeName: 'Array<Link^Place>' },
      array: []
    }
  }
}
let Nis: tn.IPlaceGraph = {
  ref: { id: 3, category: 'Object', typeName: 'Place' },
  object: {
    name: 'Nis',
    neighbor: {
      ref: { id: 4, category: 'Array', typeName: 'Array<Link^Place>' },
      array: []
    }
  }
}
let Kraljevo: tn.IPlaceGraph = {
  ref: { id: 5, category: 'Object', typeName: 'Place' },
  object: {
    name: 'Kraljevo',
    neighbor: {
      ref: { id: 6, category: 'Array', typeName: 'Array<Link^Place>' },
      array: []
    }
  }
}

let NoviSad: tn.IPlaceGraph = {
  ref: { id: 7, category: 'Object', typeName: 'Place' },
  object: {
    name: 'NoviSad',
    neighbor: {
      ref: { id: 8, category: 'Array', typeName: 'Array<Link^Place>' },
      array: []
    }
  }
}
describe('Testing fromDTOgraph method of ObjectType', () => {
  it('Should be valid for Travel exemple in travel network', () => {
    Belgrade.object.neighbor.array.push(NoviSad, Kraljevo, Nis)
    NoviSad.object.neighbor.array.push(Belgrade)
    Nis.object.neighbor.array.push(Belgrade, Kraljevo)
    Kraljevo.object.neighbor.array.push(Nis, Belgrade)
    let t = tn.Place.fromDTOgraph(Belgrade)

    if (isSuccess(t)) {
      expect(t.value).toEqual(tn.Belgrade)
    }
  })

  it('Should be valid for Travel network biderectional each to every other', () => {
    Belgrade.object.neighbor.array = []
    Nis.object.neighbor.array = []
    Kraljevo.object.neighbor.array = []
    Belgrade.object.neighbor.array.push(Nis, Kraljevo)
    Nis.object.neighbor.array.push(Kraljevo, Belgrade)
    Kraljevo.object.neighbor.array.push(Belgrade, Nis)

    let b = tn.Place.fromDTOgraph(Belgrade)

    if (isSuccess(b)) {
      expect(
        ((b.value.neighbor[0] as tn.IPlace).neighbor[0] as tn.IPlace).neighbor[0] as tn.IPlace
      ).toEqual(
        ((b.value.neighbor[1] as tn.IPlace).neighbor[1] as tn.IPlace).neighbor[1] as tn.IPlace
      )
    }
  })

  it('Should be valid for travel network (one place with itself)', () => {
    Belgrade.object.neighbor.array = []
    Belgrade.object.neighbor.array.push(Belgrade)
    let res = tn.Place.fromDTOgraph(Belgrade)
    // expect((res as any as tn.IPlace).neighbor[0]).toEqual(Belgrade as any as tn.IPlace)
    if (isSuccess(res)) {
      expect(res.value).toEqual({
        object: {
          name: 'Belgrade',
          neighbor: [Belgrade]
        }
      })
    }
  })

  it('Should be valid for loop', () => {
    Belgrade.object.neighbor.array = []
    Nis.object.neighbor.array = []
    Kraljevo.object.neighbor.array = []
    Belgrade.object.neighbor.array.push(Nis)
    Nis.object.neighbor.array.push(Kraljevo)
    Kraljevo.object.neighbor.array.push(Belgrade)

    let b = tn.Place.fromDTOgraph(Belgrade)

    if (isSuccess(b)) {
      expect(b.value.neighbor[0]).toEqual((Nis as any) as tn.IPlace)
    }

    let k = tn.Place.fromDTOgraph(Kraljevo)
    if (isSuccess(k)) {
      expect(k.value.neighbor[0]).toEqual(b)
    }

    let n = tn.Place.fromDTOgraph(Nis)
    if (isSuccess(n)) {
      expect(n.value.neighbor[0]).toEqual(k)
    }
    if (isSuccess(b)) {
      expect(((b.value.neighbor[0] as tn.IPlace).neighbor[0] as tn.IPlace).neighbor[0]).toEqual(b)
    }
    // expect(t).toEqual((tn.Belgrade.neighbor[0] as tn.IPlace).name==="Nis" )
    // expect(((t as any as tn.IPlace).neighbor[0] as tn.IPlace).name).toEqual("Nis")
    // expect((t as any as tn.IPlace).neighbor[0]).toEqual(Nis)

    // expect(t).toBeInstanceOf(tn.Belgrade)
  })
})
