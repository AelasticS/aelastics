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
  FullNameType
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
  items: [
    [1, { id: 1, name: 'p1' }],
    [2, { id: 1, name: '4' }]
  ]
}

export const fullName: t.TypeOf<typeof FullNameType> = { name: 'Peter', familyName: 'Johnson' }
