/*
 * Copyright (c) AelasticS 2019.
 *
 */

import * as t from '../../src/aelastics-types'
import { isSuccess } from 'aelastics-result'
// import {isSuccess} from "aelastics-result";

const PersonTypeWithSimpleIdentifier = t.entity(
  {
    name: t.string,
    age: t.number
  },
  ['name'] as const,
  'person',
  undefined
)

const PersonTypeWithComplexIdentifier = t.entity(
  {
    name: t.string,
    age: t.number
  },
  ['name', 'age'] as const,
  'person'
)

describe('Test identifiers for object reference', () => {
  it('should correctly verify when is given a single identifier', () => {
    let refType = t.ref(PersonTypeWithSimpleIdentifier)
    let p = {} as t.TypeOf<typeof refType>
    expect(isSuccess(refType.validate(p))).toBeFalsy()
    p = { name: 'pera' }
    expect(refType.validate(p)).toBeTruthy()
  })

  it('should correctly verify when is given a complex identifier', () => {
    let refType = t.ref(PersonTypeWithComplexIdentifier)
    let p = { age: 6 } as t.TypeOf<typeof refType>
    expect(isSuccess(refType.validate(p))).toBeFalsy()
    p = { name: 'pera', age: 6 }
    expect(refType.validate(p)).toBeTruthy()
  })
})

describe('Test recursive object references', () => {
  it('should correctly verify when is given a single identifier', () => {
    let refType = t.ref(PersonTypeWithSimpleIdentifier)
    let p = ({ age: 6 } as unknown) as t.TypeOf<typeof refType>
    expect(isSuccess(refType.validate(p))).toBeFalsy()
    p = { name: 'pera' }
    expect(refType.validate(p)).toBeTruthy()
  })
})
