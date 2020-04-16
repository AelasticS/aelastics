/*
 * Copyright (c) AelasticS 2019.
 */

import * as t from '../../src/aelastics-types'
import {
  BirthPlaceType,
  SexType,
  OccupationType,
  WorkerType,
  StringOrNumberType,
  StudentType,
  ChildType,
  PartTimeStudentType,
  InvoiceType,
  FullNameType,
  SingerType
} from './types-example'

export const london: t.TypeOf<typeof BirthPlaceType> = { name: 'London', state: 'UK' }
export const s: t.TypeOf<typeof StringOrNumberType> = 5

export const maleSex: t.TypeOf<typeof SexType> = 'male'
export const occ: t.TypeOf<typeof OccupationType> = {
  profession: 'Doctor',
  specialization: 'Surgeon'
}

export type IWorkerType = t.TypeOf<typeof WorkerType> // interface {name:string, age:number}

export const john: IWorkerType = {
  name: 'John',
  age: 35,
  sex: 'male',
  birthPlace: london,
  occupation: { profession: 'Driver', licences: ['B', 'C'] },
  children: [{ name: 'Peter' }, { name: 'Helen' }]
}
export const child: t.TypeOf<typeof ChildType> = { name: 'John' }
export const student: t.TypeOf<typeof StudentType> = { name: 'Peter', university: 'Belgrade' }
export const partTimeStudent: t.TypeOf<typeof PartTimeStudentType> = {
  name: 'Ana',
  university: 'Belgrade',
  payFee: 2.0
}

export const inv1: t.TypeOf<typeof InvoiceType> = {
  id: 1,
  date: new Date('2010-03-24'),
  items: new Map([
    [1, { id: 1, name: 'p1' }],
    [2, { id: 2, name: 'p2' }]
  ])
}
export const dateValue: t.DtoTypeOf<typeof t.date> = '5'

export const invDTO: t.DtoTreeTypeOf<typeof InvoiceType> = {
  id: 1,
  date: '2010-03-24',
  items: {
    ref: { id: 1, category: 'map', typeName: 'InvoiceType' },
    map: [
      [
        1,
        {
          ref: { id: 2, category: 'object', typeName: 'InvoiceItemType' },
          object: { id: 1, name: 'p1' }
        }
      ],
      [
        2,
        {
          ref: { id: 2, category: 'object', typeName: 'InvoiceItemType' },
          object: { id: 2, name: 'p2' }
        }
      ]
    ]
  }
}

export const fullName: t.TypeOf<typeof FullNameType> = { name: 'Peter', familyName: 'Johnson' }

export const singer1: t.TypeOf<typeof SingerType> = {
  singerName: { name: ' Farrokh ', familyName: 'Bulsara' },
  nickname: 'Freddie Mercury',
  albums: [
    {
      name: 'Barcelona',
      songs: [
        {
          no: 1,
          name: 'Barcelona',
          duration: 5.37,
          composers: [
            { name: { name: 'Mike', familyName: 'Moran' } },
            { name: { name: ' Freddie ', familyName: 'Mercury' } }
          ]
        },
        {
          no: 2,
          name: 'La Japonaise',
          duration: 4.49,
          composers: [{ name: { name: 'Freddie', familyName: 'Mercury' } }]
        },
        {
          no: 3,
          name: 'The Fallen Priest',
          duration: 5.46,
          composers: [
            { name: { name: 'Freddie', familyName: 'Mercury' } },
            { name: { name: 'Mike', familyName: 'Moran' } },
            { name: { name: 'Tim', familyName: 'Rice' } }
          ]
        },
        {
          no: 4,
          name: 'Ensueno',
          duration: 4.27,
          composers: [
            { name: { name: 'Freddie', familyName: 'Mercury' } },
            { name: { name: 'Montserarat', familyName: 'Caballe' } }
          ]
        },
        {
          no: 5,
          name: 'The Golden Boy',
          duration: 6.04,
          composers: [
            { name: { name: 'Freddie', familyName: 'Mercury' } },
            { name: { name: 'Mike', familyName: 'Moran' } },
            { name: { name: 'Tim', familyName: 'Rice' } }
          ]
        },
        {
          no: 6,
          name: 'Giude me home',
          duration: 2.49,
          composers: [
            { name: { name: 'Freddie', familyName: 'Mercury' } },
            { name: { name: 'Montserarat', familyName: 'Caballe' } }
          ]
        },
        {
          no: 7,
          name: 'How Can I go on',
          duration: 3.51,
          composers: [
            { name: { name: 'Freddie', familyName: 'Mercury' } },
            { name: { name: 'Mike', familyName: 'Moran' } }
          ]
        },
        {
          no: 8,
          name: 'Overture Piccante',
          duration: 6.4,
          composers: [
            { name: { name: 'Freddie', familyName: 'Mercury' } },
            { name: { name: 'Mike', familyName: 'Moran' } }
          ]
        }
      ],
      lyricsOfSongs: new Map([
        [1, 'I had this perfect dream, un sueno me envolvio, this dream was me and you....'],
        [
          2,
          'I feel the power of a stranger inside me, a force of magic surrounds, his fountain within me is overflowing..'
        ],
        [
          3,
          'Free me, free yourself, a life of sacrifice controlled me, but those promises I made, no longer hold me..'
        ],
        [4, 'En mi sueno te vi, tu luz llegaba de tan lejos, vibra en ti...'],
        [
          5,
          'I love you for your silence, I love you for your peace, the still and calm releases that sweep into my soul...'
        ],
        [6, 'Now my heart begins to bleed, dee dee dee dee dee ooh oh, who will find me....'],
        [7, 'How can I go on, from day to day...'],
        [8, 'Shaking all our lives, guide me back, once more....']
      ]),
      publishingHouse: {
        pib: 24,
        name: ' Polydor Records',
        established: 1924,
        contact: '098726547'
      }
    }
  ],
  genre: 'Rock',
  memberOfBand: {
    name: '',
    members: []
  }
}
