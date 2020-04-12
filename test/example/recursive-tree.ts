import * as t from '../../src/aelastics-types'
import { DirectorType } from './types-example'
import { person, personAge, personName } from '../complex-types-graph/testing-types'

export const FileSystemSchema = t.schema('FileSystemSchema')
export const Item = t.object(
  {
    name: t.string,
    creationDate: t.date,
    parentDirectory: t.optional(t.link(FileSystemSchema, 'Directory'))
  },
  'Item',
  FileSystemSchema
)

export const File = t.subtype(
  Item,
  {
    fileType: t.string
  },
  'File',
  FileSystemSchema
)

export const directory = t.subtype(
  Item,
  {
    items: t.arrayOf(Item)
  },
  'Directory',
  FileSystemSchema
)

export const myFileSystem: t.TypeOf<typeof File> = {
  name: 'My file',
  creationDate: new Date(2020, 3, 30),
  parentDirectory: undefined,
  fileType: 'txt'
}

export const dir1: t.TypeOf<typeof directory> = {
  name: 'My dir1',
  creationDate: new Date(2020, 3, 30),
  parentDirectory: undefined,
  items: [myFileSystem]
}
export const dir2: t.TypeOf<typeof directory> = {
  name: 'My dir2',
  creationDate: new Date(2020, 3, 30),
  parentDirectory: undefined,
  items: [dir1]
}

dir1.parentDirectory = dir2
myFileSystem.parentDirectory = dir1

export const OsobaShema = t.schema('OsobaSchema')
// export const osoba = t.object(
//   {
//     name: t.string,
//     age: t.number.greaterThan(0)
//   },
//   'osoba',
//   OsobaShema
// )

export const osoba = t.object(
  {
    name: t.string,
    age: t.number.greaterThan(0),
    rodjaci: t.arrayOf(t.link(OsobaShema, 'osoba'))
  },
  'osoba',
  OsobaShema
)

export const radnik = t.subtype(
  osoba,
  {
    firma: t.string
  },
  'radnik',
  OsobaShema
)

export const student = t.subtype(
  osoba,
  {
    prosek: t.number.derive('prosek').inRange(6, 10)
  },
  'student',
  OsobaShema
)

// export const radnik = t.subtype(
//   osoba,
//   {
//     firma: t.string
//   },
//   'radnik',
//   OsobaShema
// )
OsobaShema.validate()

export const Pera: t.TypeOf<typeof radnik> = {
  name: 'Pera',
  age: 45,
  firma: 'FON',
  rodjaci: []
}

export const Mika: t.TypeOf<typeof radnik> = {
  name: 'Mika',
  age: 36,
  firma: 'PMF',
  rodjaci: []
}

export const Zika: t.TypeOf<typeof radnik> = {
  name: 'Zika',
  age: 25,
  firma: 'FPN',
  rodjaci: []
}
export const Jela: t.TypeOf<typeof student> = {
  name: 'Jela',
  age: 20,
  prosek: 10,
  rodjaci: [Zika]
}

export const Ana: t.TypeOf<typeof student> = {
  name: 'Ana',
  age: 23,
  prosek: 9.45,
  rodjaci: [Pera, Jela]
}

Jela.rodjaci.push(Ana)
