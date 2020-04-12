import * as examples from '../testing-types'
import { isSuccess, isFailure } from 'aelastics-result'
import * as t from '../../../src/aelastics-types'
import * as r from '../../example/recursive-tree'

let studentAna: t.DtoTypeOf<typeof r.student> = {
  ref: { id: 1, category: 'Subtype', typeName: 'student' },
  object: {
    name: 'Ana',
    age: 23,
    prosek: 9.45,
    rodjaci: {
      ref: { id: 2, category: 'Array', typeName: 'Array<Link^osoba>' },
      array: []
    }
  }
}

let studentJela: t.DtoTypeOf<typeof r.student> = {
  ref: { id: 3, category: 'Subtype', typeName: 'student' },
  object: {
    name: 'Jela',
    age: 20,
    prosek: 10,
    rodjaci: {
      ref: { id: 4, category: 'Array', typeName: 'Array<Link^osoba>' },
      array: []
    }
  }
}

let radnikPera: t.DtoTypeOf<typeof r.radnik> = {
  ref: { id: 5, category: 'Subtype', typeName: 'radnik' },
  object: {
    name: 'Pera',
    age: 45,
    firma: 'FON',
    rodjaci: {
      ref: { id: 6, category: 'Array', typeName: 'Array<Link^osoba>' },
      array: []
    }
  }
}

let radnikZika: t.DtoTypeOf<typeof r.radnik> = {
  ref: { id: 7, category: 'Subtype', typeName: 'radnik' },
  object: {
    name: 'Zika',
    age: 25,
    firma: 'FPN',
    rodjaci: {
      ref: { id: 8, category: 'Subtype', typeName: 'Array<Link^osoba>' },
      array: []
    }
  }
}

describe('Testing fromDTOgraph method for Subtype', () => {
  it('Should be valid for example of person, student and worker ', () => {
    studentAna.object.rodjaci.array.push(radnikPera, studentJela)
    studentJela.object.rodjaci.array.push(radnikZika, studentAna)

    let res = r.student.fromDTOgraph(studentAna)

    if (isSuccess(res)) {
      expect(res.value).toEqual(r.Ana)
    }
  })

  it('Should not be valid if input is tree structure', () => {
    studentAna.object.rodjaci.array.push(radnikPera, studentJela)
    studentJela.object.rodjaci.array.push(radnikZika, studentAna)
    let res = r.student.fromDTOtree((studentAna as any) as t.DtoTreeTypeOf<typeof r.student>)
    expect(isSuccess(res)).toBe(false)
  })

  it('Should be valid for loop of subtypes', () => {
    studentAna.object.rodjaci.array = []
    studentJela.object.rodjaci.array = []

    studentAna.object.rodjaci.array.push(studentJela)
    studentJela.object.rodjaci.array.push(radnikZika)
    radnikZika.object.rodjaci.array.push(radnikPera)
    radnikPera.object.rodjaci.array.push(studentAna)

    let res = r.radnik.fromDTOgraph(radnikPera)
    if (isSuccess(res)) {
      expect(res.value.rodjaci[0]).toEqual((studentAna as any) as t.TypeOf<typeof r.radnik>)
    }
  })

  it('Should be valid for biderictional example', () => {
    studentAna.object.rodjaci.array = []
    studentJela.object.rodjaci.array = []
    radnikZika.object.rodjaci.array = []
    radnikPera.object.rodjaci.array = []

    studentAna.object.rodjaci.array.push(studentJela, radnikZika)
    studentJela.object.rodjaci.array.push(studentAna, radnikZika)
    radnikZika.object.rodjaci.array.push(studentAna, studentJela)

    let res = r.radnik.fromDTOgraph(radnikZika)

    if (isSuccess(res)) {
      expect(res.value.rodjaci[1]).toEqual((studentJela as any) as t.TypeOf<typeof r.osoba>)
    }
  })
})
