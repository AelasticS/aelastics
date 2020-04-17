import * as examples from '../testing-types'
import { isSuccess, isFailure } from 'aelastics-result'
import * as t from '../../../src/aelastics-types'
// import * as r from '../../example/recursive-tree'
import { student, radnik, osoba, Ana, Jela, Zika, Mika, Pera } from '../../example/recursive-tree'

describe('Testing fromDTOgraph method for Subtype', () => {
  it('Should be valid for example of person, student and worker ', () => {
    let result = student.toDTO(Ana)
    if (isSuccess(result)) {
      let result2 = student.fromDTO(result.value)
      if (isSuccess(result2)) {
        let Ana2 = result2.value
        expect(Ana2.name).toEqual(Ana.name)
        expect(Ana2.age).toEqual(Ana.age)
        expect(Ana2.prosek).toEqual(Ana.prosek)
        expect(Ana2.rodjaci.length).toEqual(Ana.rodjaci.length)
        let arr1 = []
        let arr2 = []
        for (let i = 0; i < Ana2.rodjaci.length; i++) {
          arr2.push(Ana2.rodjaci[i])
        }
        for (let j = 0; j < Ana.rodjaci.length; j++) {
          arr1.push(Ana.rodjaci[j])
        }
        expect(arr1).toEqual(jasmine.arrayContaining(arr2))
      }
    }
  })

  it('Should be valid for example one person with itself ', () => {
    Mika.rodjaci.push(Mika)

    let MikaDtoGraph = radnik.toDTO(Mika)
    if (isSuccess(MikaDtoGraph)) {
      let MikaFromDto = radnik.fromDTO(MikaDtoGraph.value)
      if (isSuccess(MikaFromDto)) {
        let Mika2 = MikaFromDto.value
        expect(Mika2.name).toEqual(Mika.name)
        expect(Mika2.rodjaci.length).toEqual(1)
        expect((Mika2.rodjaci[0] as t.TypeOf<typeof osoba>).name).toEqual(Mika.name)
      }
    }
  })
  it('Should be valid for biderictional example', () => {
    let JelaDtoGraph = student.toDTO(Jela)
    if (isSuccess(JelaDtoGraph)) {
      let JelaFromDto = student.fromDTO(JelaDtoGraph.value)
      if (isSuccess(JelaFromDto)) {
        let Jela2 = JelaFromDto.value
        expect(Jela2.rodjaci.length).toEqual(2)
        expect((Jela2.rodjaci[0] as t.TypeOf<typeof osoba>).name).toEqual(Zika.name)
        expect((Jela2.rodjaci[0] as t.TypeOf<typeof osoba>).rodjaci.length).toEqual(1)
        expect(
          ((Jela2.rodjaci[0] as t.TypeOf<typeof osoba>).rodjaci[0] as t.TypeOf<typeof osoba>).name
        ).toEqual(Jela.name)
      }
    }
  })
})
