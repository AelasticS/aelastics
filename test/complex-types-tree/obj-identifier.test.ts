/*
 * Copyright (c) AelasticS 2019.
 *
 */

import * as t from '../../src/aelastics-types'
import { isFailure, isSuccess } from 'aelastics-result'

const person = t.entity(
  {
    name: t.string,
    age: t.number
  },
  ['name'] as const,
  'person'
)

describe('Test cases for object identifier', () => {
  it('should throw error when wrong property name name is given as single identifier', () => {
    expect(() => {
      t.entity(
        {
          name: t.string,
          age: t.number
        },
        ['wrong_name'] as const,
        'person'
      )
    }).toThrow(Error)
  })

  it('should throw error when wrong identifier name is given in case in case of complex identifier spec', () => {
    expect(() => {
      t.entity(
        {
          name: t.string,
          age: t.number
        },
        ['name', 'age', 'wrong_name'] as const,
        'person'
      )
    }).toThrow(Error)
  })

  it('should accept when identifier is correctly given', () => {
    expect(() => {
      t.entity(
        {
          name: t.string,
          age: t.number
        },
        ['name'] as const,
        'person',
        undefined
      )
    }).toBeDefined()
  })

  it('should be valid reference', () => {
    const refPerson = t.ref(person, 'personRef')
    const o = { name: 'John' }
    expect(isSuccess(refPerson.validate(o))).toBe(true)
  })

  it('should not be valid reference when constraints of values are not satisfied', () => {
    const student = t.entity(
      {
        id: t.string.derive('student').nonEmpty.alphabetical,
        name: t.string
      },
      ['id'] as const,
      'student',
      undefined
    )
    const refStudent = t.ref(student, 'personRef')
    const o = { id: '11Ad' }
    expect(isSuccess(refStudent.validate(o))).toBe(false)
  })

  it('should not be valid reference when identifier has more properties then reference', () => {
    const student = t.entity(
      {
        name: t.string,
        id: t.string,
        age: t.number
      },
      ['name', 'id'] as const,
      'student',
      undefined
    )
    const refStudent = t.ref(student, 'studentRef')
    const o = { name: 'John' }
    expect(isSuccess(refStudent.validate(o as any))).toBe(false)
  })

  it('should be valid reference when identifier has less properties then reference', () => {
    const student = t.entity(
      {
        name: t.string,
        id: t.string,
        age: t.number
      },
      ['id'] as const,
      'student',
      undefined
    )
    const refStudent = t.ref(student, 'studentRef')
    const o = { id: '113A', name: 'John' }
    expect(isSuccess(refStudent.validate(o))).toBe(true)
  })

  it('should not be valid when reference has incorrect type of values', () => {
    const student = t.entity(
      {
        name: t.string,
        id: t.string,
        age: t.number
      },
      ['id', 'name'] as const,
      'student',
      undefined
    )
    const refStudent = t.ref(student, 'studentRef')
    const o = { id: 12, name: 'John' }
    expect(isSuccess(refStudent.validate(o as any))).toBe(false)
  })

  it('should be valid reference when complex identifier is correctly given', () => {
    const student = t.entity(
      {
        name: t.string,
        id: t.string,
        age: t.number
      },
      ['id', 'name'] as const,
      'student',
      undefined
    )
    const refStudent = t.ref(student, 'studentRef')
    const o = { id: '1231', name: 'John' }
    expect(isSuccess(refStudent.validate(o))).toBe(true)
  })
})

describe('Test cases for testing fromDTOtree of object identifier', () => {
  const student = t.entity(
    {
      name: t.string,
      id: t.string.derive('student').nonEmpty.uppercase,
      age: t.number
    },
    ['name', 'id'] as const,
    'student',
    undefined
  )

  it('should be valid fromDTOtree', () => {
    const refPerson = t.ref(person, 'personRef')
    const o = { name: 'John' }
    expect(isSuccess(refPerson.fromDTOtree(o))).toBe(true)
  })

  it('should not be valid fromDTOtree when constraints of values are not satisfied', () => {
    const refStudent = t.ref(student, 'personRef')
    const o = { name: 'John', id: '11Ad' }
    const res = refStudent.fromDTOtree(o)
    if (isFailure(res)) {
      expect(res.errors).toEqual([
        {
          code: 'ValidationError',
          message: 'Expected id:11Ad to be uppercase, got `11Ad`',
          path: [{ actual: '11Ad', segment: 'id' }],
          type: 'student',
          value: '"11Ad"'
        }
      ])
    }
  })

  it('should not be valid fromDTOtree when identifier has more properties then reference', () => {
    const refStudent = t.ref(student, 'studentRef')
    const o = { name: 'John' }
    const res = refStudent.fromDTOtree(o as any)
    if (isFailure(res)) {
      expect(res.errors).toEqual([
        {
          code: undefined,
          message: 'missing property',
          path: [{ actual: undefined, segment: 'id' }],
          type: 'studentRef',
          value: undefined
        }
      ])
    }
  })

  it('should not be valid fromDTOtree when identifier has less properties then reference', () => {
    const refStudent = t.ref(student, 'studentRef')
    const o = { id: 'AA13', name: 'John', age: 21 }
    const res = refStudent.fromDTOtree(o)
    if (isFailure(res)) {
      expect(res.errors).toEqual([
        {
          code: undefined,
          message: 'Extra properties',
          path: [],
          type: 'studentRef',
          value: '{"id":"AA13","name":"John","age":21}'
        }
      ])
    }
  })

  it('should not be valid fromDTOtree when reference has incorrect type of values', () => {
    const refStudent = t.ref(student, 'studentRef')
    const o = { id: 12, name: 'John' }
    const res = refStudent.fromDTOtree(o as any)
    if (isFailure(res)) {
      expect(res.errors).toEqual([
        {
          code: 'ValidationError',
          message: 'Expected id:12 to be uppercase, got `12`',
          path: [{ actual: 12, segment: 'id' }],
          type: 'student',
          value: '12'
        },
        {
          code: 'ValidationError',
          message: 'value.trim is not a function',
          path: [{ actual: 12, segment: 'id' }],
          type: 'student',
          value: '12'
        }
      ])
    }
  })

  it('should be valid fromDTOtree when complex identifier is correctly given', () => {
    const refStudent = t.ref(student, 'studentRef')
    const o = { id: 'AA13', name: 'John' }
    expect(isSuccess(refStudent.fromDTOtree(o))).toBe(true)
  })
})

describe('Test cases for testing toDTOtree of object identifier', () => {
  const student = t.entity(
    {
      name: t.string,
      id: t.string.derive('student').nonEmpty.uppercase,
      age: t.number
    },
    ['name', 'id'] as const,
    'student',
    undefined
  )

  it('should be valid toDTOtree', () => {
    const refPerson = t.ref(person, 'personRef')
    const o = { name: 'John' }
    expect(isSuccess(refPerson.fromDTOtree(o))).toBe(true)
  })

  it('should be valid toDTOtree value', () => {
    const refPerson = t.ref(person, 'personRef')
    const o = { name: 'John' }
    const res = refPerson.fromDTOtree(o)
    if (isSuccess(res)) {
      expect(res.value).toEqual({ name: 'John' })
    }
  })

  it('should be valid toDTOtree error when constraints of values are not satisfied', () => {
    const refStudent = t.ref(student, 'personRef')
    const o = { name: 'John', id: '11Ad' }
    const res = refStudent.toDTOtree(o)
    if (isFailure(res)) {
      expect(res.errors).toEqual([
        {
          code: 'ValidationError',
          message: 'Expected id:11Ad to be uppercase, got `11Ad`',
          path: [{ actual: '11Ad', segment: 'id' }],
          type: 'student',
          value: '"11Ad"'
        }
      ])
    }
  })

  it('should be valid toDTOtree error when identifier has more properties then reference', () => {
    const refStudent = t.ref(student, 'studentRef')
    const o = { name: 'John' }
    const res = refStudent.fromDTOtree(o as any)
    if (isFailure(res)) {
      expect(res.errors).toEqual([
        {
          code: undefined,
          message: 'missing property',
          path: [{ actual: undefined, segment: 'id' }],
          type: 'studentRef',
          value: undefined
        }
      ])
    }
  })

  it('should be valid toDTOtree when identifier has less properties then reference', () => {
    const refStudent = t.ref(student, 'studentRef')
    const o /*:t.TypeOf<typeof refStudent>*/ = { id: 'AA13', name: 'John', age: 21 }
    const res = refStudent.fromDTOtree(o)
    expect(isSuccess(res)).toBe(true)
  })

  it('should not be valid toDTOtree when reference has incorrect type of values', () => {
    const refStudent = t.ref(student, 'studentRef')
    const o = { id: 12, name: 'John' }
    const res = refStudent.fromDTOtree(o as any)
    expect(isFailure(res)).toBe(true)
  })

  it('should be valid toDTOtree value when complex identifier is correctly given', () => {
    const refStudent = t.ref(student, 'studentRef')
    const o = { id: 'AA13', name: 'John' }
    const res = refStudent.fromDTOtree(o)
    if (isSuccess(res)) {
      expect(res.value).toEqual({ id: 'AA13', name: 'John' })
    }
  })
})
