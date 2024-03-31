/*
 * Copyright (c) AelasticS 2019.
 *
 */

import * as t from '../..'
import { ServiceError, isSuccess } from 'aelastics-result'

const person = t.entity(
  {
    name: t.string,
    age: t.number
  },
  ['age'] as const,
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
        ['wrong_name'] as const
      )
    }).toThrow(ServiceError)
  })

  it('should throw error when wrong identifier name is given in case in case of complex identifier spec', () => {
    expect(() => {
      t.entity(
        {
          name: t.string,
          age: t.number
        },
        ['name', 'age', 'wrong_name'] as const,
      )
    }).toThrow(ServiceError)
    //  toThrow(Error) befora but not working
  })

  it('should accept when identifier is correctly given', () => {
    expect(() => {
      t.entity(
        {
          name: t.string,
          age: t.number
        },

        ['name'] as const,
      )
    }).toBeDefined()
  })
  test('if property isEntity return true for an entity', () => {
    const ent:t.AnyObjectType = t.entity(
      {
        name: t.string,
        age: t.number
      },

      ['name'] as const,
    )
    expect( ent.isEntity).toBeTruthy()
  }
)
test('if property isEntity return false for an object', () => {
  const ent:t.AnyObjectType = t.object(
    {
      name: t.string,
      age: t.number
    }
  )
  expect( ent.isEntity).toBeFalsy()
}
)

  it('should be valid reference', () => {
    const refPerson = t.entityRef(person, 'personRef')
    const o = { age: 12 }
    expect(isSuccess(refPerson.validate(o))).toBe(true)
  })

  it('should not be valid reference when constraints of values are not satisfied', () => {
    const student = t.entity(
      {
        id: t.string.derive('studentID').nonEmpty.alphabetical,
        name: t.string
      },
      ['id'] as const,
      'student1',
      undefined
    )
    const refStudent = t.entityRef(student, 'refStudent')
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
      'student2',
      undefined
    )
    const refStudent1 = t.entityRef(student, 'refStudent1')
    const o = { name: 'John' }
    expect(isSuccess(refStudent1.validate((o as unknown) as any))).toBe(false)
  })

  it('should be valid reference when identifier has less properties then reference', () => {
    const student = t.entity(
      {
        name: t.string,
        id: t.string,
        age: t.number
      },
      ['id'] as const,
      'student3',
      undefined
    )
    const refStudent2 = t.entityRef(student, 'refStudent2')
    const o = { id: '113A', name: 'John' }
    expect(isSuccess(refStudent2.validate(o))).toBe(true)
  })

  it('should not be valid when reference has incorrect type of values', () => {
    const student = t.entity(
      {
        name: t.string,
        id: t.string,
        age: t.number
      },
      ['id', 'name'] as const,
      'student4',
      undefined
    )
    const refStudent3 = t.entityRef(student, 'studentRef3')
    const o = { id: 12, name: 'John', age: 32 }
    expect(isSuccess(refStudent3.validate(o as any))).toBe(false)
  })

  it('should be valid reference when complex identifier is correctly given', () => {
    const student = t.entity(
      {
        name: t.string,
        id: t.string,
        age: t.number
      },
      ['id', 'name'] as const,
      'student5',
      undefined
    )
    const refStudent4 = t.entityRef(student, 'studentRef4')
    const o = { id: '1231', name: 'John' }
    expect(isSuccess(refStudent4.validate(o))).toBe(true)
  })
})

describe('Test cases for testing fromDTO of object identifier', () => {
  const student = t.entity(
    {
      name: t.string,
      id: t.string.derive('student6ID').nonEmpty.uppercase,
      age: t.number
    },
    ['name', 'id'] as const,
    'student6',
    undefined
  )

/*  it('should be valid fromDTO', () => {
    const refPerson = t.entityRef(person, 'personRef')
    const o: t.DtoGraphTypeOf<typeof refPerson> = {
      ref: { id: 1, category: 'EntityReference', typeName: 'personRef' },
      reference: { age: 25 }
    }
    const exm = { age: 25 }
    const resToDTO = refPerson.toDTO(exm)
    expect(isSuccess(resToDTO)).toBe(true)
    if (isSuccess(resToDTO)) {
      expect(isSuccess(refPerson.fromDTO(resToDTO.value))).toBe(true)
    }
  })*/

/*  it('should not be valid fromDTO when constraints of values are not satisfied', () => {
    const refStudent = t.entityRef(student, 'personRef')
    const o = {
      ref: { id: 1, category: 'reference', typeName: 'personRef' },
      reference: { name: 'John', id: '11Ad' }
    }
    const res = refStudent.fromDTO(o)
    expect(isFailure(res)).toBe(true)
    if (isFailure(res)) {
      expect(res.errors.length).toEqual(1)
      let e = res.errors[0]
      let code: ErrorCode = 'ValidationError'
      expect(e).toBeInstanceOf(ServiceError)
      expect(e.code).toEqual(code)
      expect(e.message.includes('to be uppercase')).toBeTruthy()
    }
  })*/

/*  it('should not be valid fromDTO when identifier has more properties then reference', () => {
    const refStudent = t.entityRef(student, 'studentRef')
    const o = {
      ref: { id: 1, category: 'Object', typeName: 'studentRef' },
      reference: { name: 'John' }
    }
    const res = refStudent.fromDTO(o as any)
    expect(isFailure(res)).toBe(true)
    if (isFailure(res)) {
      expect(res.errors.length).toEqual(1)
      let e = res.errors[0]
      let code: ErrorCode = 'ValidationError'
      expect(e).toBeInstanceOf(ServiceError)
      expect(e.code).toEqual(code)
    }
  })*/

/*  it('should be valid fromDTO when identifier has less properties then reference', () => {
    const refStudent = t.entityRef(student, 'studentRef')
    const o = {
      ref: { id: 1, category: 'Object', typeName: 'studentRef' },
      reference: { id: 'AA13', name: 'John', age: 21 }
    }
    const res = refStudent.fromDTO(o)
    expect(isSuccess(res)).toBe(true)
  })*/

/*  it('should not be valid fromDTO when reference has incorrect type of values', () => {
    const refStudent = t.entityRef(student, 'studentRef')
    const o = {
      ref: { id: 1, category: 'Object', typeName: 'studentRef' },
      reference: { id: 12, name: 'John' }
    }
    const res = refStudent.fromDTO(o as any)
    expect(isFailure(res)).toBe(true)
    if (isFailure(res)) {
      expect(res.errors.length).toEqual(2)
      let code: ErrorCode = 'ValidationError'
      for (let e of res.errors) {
        expect(e).toBeInstanceOf(ServiceError)
        expect(e.code).toEqual(code)
      }
    }
  })*/

/*  it('should be valid fromDTO when complex identifier is correctly given', () => {
    const refStudent = t.entityRef(student, 'studentRef')
    const o = {
      ref: { id: 1, category: 'Object', typeName: 'studentRef' },
      reference: { id: 'AA13', name: 'John' }
    }
    expect(isSuccess(refStudent.fromDTO(o))).toBe(true)
  })*/
})


/*

describe('Test cases for testing toDTO of object identifier', () => {
  const student = t.entity(
    {
      name: t.string,
      id: t.string.derive('student7ID').nonEmpty.uppercase,
      age: t.number
    },
    ['name', 'id'] as const,
    'student7',
    undefined
  )

  it('should be valid toDTO', () => {
    const refPerson = t.entityRef(person, 'personRef')
    const o = { age: 25 }
    expect(isSuccess(refPerson.toDTO(o))).toBe(true)
  })

  it('should be valid toDTO value', () => {
    const refPerson = t.entityRef(person, 'personRef')
    const o = { age: 25 }
    const res = refPerson.toDTO(o)
    expect(isSuccess(res)).toBe(true)
    if (isSuccess(res)) {
      expect(res.value).toEqual({
        ref: { category: 'reference', id: 1, typeName: 'personRef' },
        reference: { age: 25 }
      })
    }
  })

  it('should be valid toDTO error when constraints of values are not satisfied', () => {
    const refStudent = t.entityRef(student, 'personRef')
    const o = { name: 'John', id: '11Ad' }
    const res = refStudent.toDTO(o)
    expect(isFailure(res)).toBe(true)
    if (isFailure(res)) {
      expect(res.errors.length).toEqual(1)
      let e = res.errors[0]
      let code: ErrorCode = 'ValidationError'
      expect(e).toBeInstanceOf(ServiceError)
      expect(e.code).toEqual(code)
      expect(e.message.includes('to be uppercase')).toBeTruthy()
    }
  })

  it('should be valid fromDTO error when identifier has more properties then reference', () => {
    const refStudent = t.entityRef(student, 'studentRef')
    const o = { name: 'John' }
    const res = refStudent.fromDTO(o as any)
    expect(isFailure(res)).toBe(true)
    if (isFailure(res)) {
      expect(res.errors.length).toEqual(1)
      let e = res.errors[0]
      let code: ErrorCode = 'ValidationError'
      expect(e).toBeInstanceOf(ServiceError)
      expect(e.code).toEqual(code)
      expect(res.errors[0].message).toEqual('Reference is not valid')
    }
  })

  it('should not be valid toDTO when identifier has less properties then reference', () => {
    const refStudent = t.entityRef(student, 'studentRef')
    const o = { id: 'AA13', name: 'John', age: 21 }
    const res = refStudent.toDTO(o)
    expect(isSuccess(res)).toBe(true)
  })

  it('should not be valid toDTO when reference has incorrect type of values', () => {
    const refStudent = t.entityRef(student, 'studentRef')
    const o = { id: 12, name: 'John' }
    const res = refStudent.toDTO(o as any)
    expect(isFailure(res)).toBe(true)
  })

  it('should be valid toDTO value when complex identifier is correctly given', () => {
    const refStudent = t.entityRef(student, 'studentRef')
    const o = { id: 'AA13', name: 'John' }
    const res = refStudent.toDTO(o)
    expect(isSuccess(res)).toBe(true)
    if (isSuccess(res)) {
      expect(res.value).toEqual({
        ref: { category: 'reference', id: 1, typeName: 'studentRef' },
        reference: { id: 'AA13', name: 'John' }
      })
    }
  })
})
*/
