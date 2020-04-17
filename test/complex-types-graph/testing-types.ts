/*
 * Copyright (c) AelasticS 2019.
 *
 */

import * as t from '../../src/aelastics-types'
import { Failure } from 'aelastics-result'
import { DoctorType, DriverType } from '../example/types-example'
// function that returns only error messages from failure
export const errorMessages = (emp: Failure) => {
  let s = ''
  emp.errors.forEach(value => {
    s = s + value.message + '\n'
  })
  return s
}

// object
export const deanType = t.object(
  {
    name: t.string,
    surname: t.string,
    age: t.number,
    title: t.string,
    expertise: t.string,
    workingExperiance: t.number
  },
  'dean'
)
export const DateType = t
  .object(
    {
      day: t.number.derive('').inRange(1, 31),
      month: t.number.derive('').inRange(1, 12),
      year: t.number
    },
    'date'
  )
  .addValidator({
    message: (value, label) => `Expected ${label} to be correct value of date, got ${value}`,
    predicate: value =>
      (value.day < 29 && value.month === 2) ||
      (value.day < 31 &&
        (value.month === 4 || value.month === 6 || value.month === 9 || value.month === 11)) ||
      value.month === 1 ||
      value.month === 3 ||
      value.month === 5 ||
      value.month === 7 ||
      value.month === 8 ||
      value.month === 10 ||
      value.month === 12
  })
export const EmployeeType = t
  .object(
    {
      name: t.string.derive(''),
      employmentDate: DateType,
      dateOfBirth: DateType
    },
    'Worker'
  )
  .addValidator({
    message: (value, label) =>
      `Expected ${label} date of birth is in correct relation with date of employment (employee age 18 or more), got ${value}`,
    predicate: value => {
      let s = 0
      let d = new Date()

      if (value.dateOfBirth.year > value.employmentDate.year) {
        return false
      }
      s = value.employmentDate.year - value.dateOfBirth.year

      if (value.dateOfBirth.month < value.employmentDate.month + 1) {
        return s >= 18
      }

      if (value.dateOfBirth.month > value.employmentDate.month + 1) {
        s -= 1
        return s >= 18
      }

      if (value.dateOfBirth.day > value.employmentDate.month) {
        s -= 1
      }

      return s >= 18
    }
  })
export const facultyType = t.object(
  {
    name: t.string,

    dean: deanType,
    studentCapacity: t.number
  },
  'faculty'
)

export const entranceYearType = t
  .object(
    {
      year: t.number
    },
    'entranceYear'
  )
  .addValidator({
    message: (value, label) => `Expected ${label} to be less then current year, got ${value}`,
    predicate: value =>
      value.year <= new Date().getFullYear() && new Date().getFullYear() - value.year <= 8
  })

export const cityType = t.object(
  {
    city: t.string.derive('').nonEmpty.alphabetical.maxLength(25),
    country: t.string.derive('').nonEmpty.alphabetical.maxLength(25),
    postalCode: t.number.derive('').positive.integer.finite
  },
  'typeCity'
)

export const addressType = t.object(
  {
    street: t.string.derive('').nonEmpty,
    city: cityType
  },
  'address'
)

export const studentType = t
  .object(
    {
      ID: t.string.derive('').nonEmpty.matches(/^[0-9]{13}$/),
      pol: t.string.derive('').nonEmpty.maxLength(6),
      name: t.string.derive('').nonEmpty,
      surname: t.string.derive('').nonEmpty,
      age: t.number.derive('').integer.finite.positive,
      average: t.number.derive('').inRange(5, 10),
      faculty: facultyType,
      entrance: entranceYearType,
      dateOfBirth: DateType,
      address: addressType,
      index: t.string
        .derive('')
        .nonEmpty.includes('/')
        .matches(/[0-9]{1,4}\/[0-9]{4}/) // 122/2016
    },
    'student'
  )
  .addValidator({
    message: value =>
      `Last 3 digits to be ` +
      (value.pol === 'Male' ? `less` : `more`) +
      `  than 500 , got ${Number(value.ID.substring(9, 12))}`,
    predicate: value =>
      (Number(value.ID.substring(9, 12)) < 500 && value.pol === 'Male') ||
      (Number(value.ID.substring(9, 12)) > 500 && value.pol === 'Female')
  })
  .addValidator({
    message: (value, label) => `Expected ${label} to be less than , got ${value}`,
    predicate: value =>
      (Number(value.ID.charAt(7)) === 1 &&
        value.address.city.country === 'Bosnia and Herzegovina') ||
      (Number(value.ID.charAt(7)) === 2 && value.address.city.country === 'Montenegro') ||
      (Number(value.ID.charAt(7)) === 3 && value.address.city.country === 'Croatia') ||
      (Number(value.ID.charAt(7)) === 4 && value.address.city.country === 'Macedonia') ||
      (Number(value.ID.charAt(7)) === 5 && value.address.city.country === 'Slovenia') ||
      (Number(value.ID.charAt(7)) >= 7 &&
        Number(value.ID.charAt(7)) <= 9 &&
        value.address.city.country === 'Serbia')
  })
  .addValidator({
    message: value =>
      `Expected last 4 digits of index to ${value.entrance.year} , got ${value.index.substring(
        value.index.length - 4,
        value.index.length
      )}`,
    predicate: value =>
      value.index.substring(value.index.length - 4, value.index.length) ===
      value.entrance.year.toString()
  })
  .addValidator({
    message: (value, label) => `Expected ${label} to be less than , got ${value}`,
    predicate: value => Number(value.ID.substring(0, 2)) === value.dateOfBirth.day
  })
  .addValidator({
    message: (value, label) => `Expected ${label} to be less than , got ${value}`,
    predicate: value => Number(value.ID.substring(2, 4)) === value.dateOfBirth.month
  })
  .addValidator({
    message: (value, label) => `Expected ${label} to be less than , got ${value}`,
    predicate: value =>
      value.ID.substring(4, 7) === value.dateOfBirth.year.toString().substring(1, 4)
  })
  .addValidator({
    message: (value, label) => `Expected ${label} to be less than , got ${value}`,
    predicate: value => value.pol === 'Male' || value.pol === 'Female'
  })

// unions
export const passingGrade = t.number.derive('PassingGrade').inRange(6, 10)
export const failed = t.literal('failed')
export const gradeType = t.unionOf([passingGrade, failed], 'grade')
export const ProfessorTypeName = t.string.derive('name').alphabetical
export const ProfessorTypeTitle = t.string.derive('title').oneOf(['Msc', 'Mr', 'Phd'])
export const profesorType = t.object(
  {
    name: ProfessorTypeName,
    title: ProfessorTypeTitle
  },
  'profesor'
)
export const janitorType = t.object(
  {
    name: t.string.derive('name').alphabetical,
    age: t.number.derive('positive').positive
  },
  'janitor'
)
export const EmployeeUnionType = t.unionOf([profesorType, janitorType], 'employee')

export const Union3 = t.unionOf([DriverType, janitorType], 'union3')
export const Union2 = t.unionOf([DoctorType, janitorType], 'union2')
export const Union1 = t.unionOf([DoctorType, DriverType, Union2, Union3], 'union1')

// Maps
export const MapOfPeopleKey = t.number.derive('integer').integer
export const MapOfPeoplePropName = t.string.derive('name').alphabetical
export const MapOfPeoplePropAge = t.number.derive('age').integer
export const MapOfPeopleValue = t.object(
  {
    name: MapOfPeoplePropName,
    age: MapOfPeoplePropAge
  },
  'person'
)
export const MapofPeople = t.mapOf(MapOfPeopleKey, MapOfPeopleValue, 'people').addValidator({
  message: () => `Expected keys to be successive numbers`,
  predicate: value => {
    const keys = value.keys()
    let k: number = keys.next().value
    for (const i of keys) {
      if (i !== ++k) {
        return false
      }
    }
    return true
  }
})
export const MapOfCountries = t.mapOf(
  t.number,
  t.object(
    {
      name: t.string.derive('name').alphabetical.nonEmpty.maxLength(20),
      cities: t.mapOf(
        t.number,
        t.object(
          {
            name: t.string.derive('name').alphabetical.maxLength(20),
            languages: t.mapOf(
              t.number,
              t.string.derive('name').alphabetical.nonEmpty,
              'map of languages'
            )
          },
          'city'
        ),
        'map of cities'
      )
    },
    'country'
  ),
  'map of countries'
)

// subtypes
export const personName = t.string.derive('name').alphabetical
export const personAge = t.number.derive('age').int8
export const person = t.object(
  {
    name: personName,
    age: personAge
  },
  'person'
)
export const worker = t.subtype(person, { age: t.string }, 'worker')
export const student = t.subtype(
  person,
  { average: t.number.derive('averageGrade').inRange(6, 10) },
  'student'
)
export const professor = t.subtype(
  person,
  {
    name: t.string.derive('uppercasse').uppercase,
    title: t.string
  },
  'professor'
)

// tagged unions
export const doctorTypeProfession = t.literal('doctor')
export const TypeWorksAt = t.string.derive('').nonEmpty.maxLength(30)
export const doctorType = t.object(
  {
    profession: doctorTypeProfession,
    specialization: t.boolean,
    worksAt: TypeWorksAt
  },
  'doctorObject'
)
export const LawyerTypeProfession = t.literal('lawyer')
export const lawyerType = t.object(
  {
    profession: LawyerTypeProfession,
    masterDegree: t.boolean,
    worksAt: TypeWorksAt
  },
  'lawyerObject'
)
export const employeeType = t.taggedUnion(
  {
    doctor: doctorType,
    lawyer: lawyerType
  },
  'profession',
  'employee'
)

export const personType = t.object(
  {
    name: t.string.derive('').alphabetical.nonEmpty,
    age: t.number.derive('').positive.greaterThan(18),
    occupation: employeeType
  },
  'personObject'
)

export const politicalOrganisationType = t.object(
  {
    name: t.string.derive('').nonEmpty.maxLength(50),
    address: t.string.derive('').nonEmpty.maxLength(50),
    members: t.arrayOf(personType, 'arrayOfPersons')
  },
  'politicalOrganisationObject'
)

export const ElemOfArrayOfNumbers = t.number.derive('arrayOfNumbers').positive.greaterThan(10)
  .finite
export const arrayOfNumbers = t.arrayOf(ElemOfArrayOfNumbers, 'array of num')
export const arrayOfPeople = t.arrayOf(person)

export const ProfessorIntersectionType = t.intersectionOf([person, profesorType], 'professor')

export const DoctorIntersectionType = t.intersectionOf([person, doctorType], 'doctor intersection')

export const Employed = t.boolean
export const DateOfBirth = t.date

export const optPerson = t.optional(person, 'Optional person')

export const s1: t.TypeOf<typeof student> = {
  name: 'John',
  age: 23,
  average: 8.9
}
