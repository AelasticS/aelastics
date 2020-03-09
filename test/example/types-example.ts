/*
 * Copyright (c) AelasticS 2019.
 */

import * as t from '../../src/aelastics-types'

export const AgeType = t.number.derive('Human age').int8.positive.inRange(1, 120)

export const StringOrNumberType = t.unionOf([t.string, t.number])

export const DoctorTypeProfession = t.literal('Doctor')
export const DoctorTypeSpecialization = t.string
  .derive('Specialization')
  .oneOf(['Surgeon', 'Cardiologist', 'Internist'])
export const DoctorType = t.object(
  {
    profession: DoctorTypeProfession,
    specialization: DoctorTypeSpecialization
  },
  'DoctorType'
)

export const LicenceType = t.string.derive('Driving licence').oneOf(['A', 'B', 'C', 'D', 'E'])

export const DriverTypeProfession = t.literal('Driver')
export const DriverTypeLicences = t.arrayOf(LicenceType)
export const DriverType = t.object(
  {
    profession: DriverTypeProfession,
    licences: DriverTypeLicences
  },
  'DriverType'
)

export const OccupationType = t.unionOf([DriverType, DoctorType])

export const SexType = t.unionOf([t.literal('male'), t.literal('female')], 'sex')

export const ChildType = t.object({ name: t.string }, 'Child')

export const BirthPlaceType = t.object({ name: t.string, state: t.string })

export const WorkerType = t.object(
  {
    name: t.string,
    age: t.optional(AgeType),
    sex: SexType,
    birthPlace: t.optional(BirthPlaceType),
    occupation: t.taggedUnion(
      {
        driver: DriverType,
        doctor: DoctorType
      },
      'profession'
    ),
    children: t.arrayOf(ChildType)
  },
  'WorkerType'
)

// subtype example
export const StudentType = t.subtype(ChildType, { university: t.string }, 'StudentType')

// multiple hierarchy subtype example
export const PartTimeStudentType = t.subtype(StudentType, { payFee: t.number }, 'PartTimeStudent')

// Map example
export const InvoiceType = t.object(
  {
    id: t.number,
    date: t.date,
    items: t.mapOf(
      t.number,
      t.object(
        {
          id: t.number,
          name: t.string
        },
        'ItemType'
      )
    )
  },
  'InvoiceType'
)

// Interface definitions
export type IWorkerType = t.TypeOf<typeof WorkerType>

// functional type example
export const firstChild = t.fun('firstChild', { worker: WorkerType }, ChildType)

// intersection type example
export const FullNameType = t.intersectionOf([
  t.object({ name: t.string.derive('').alphabetical }),
  t.object({ familyName: t.string })
])
