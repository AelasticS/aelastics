/*
 * Copyright (c) AelasticS 2019.
 *
 */

import * as examples from '../complex-types-graph/testing-types'
import { isFailure, isSuccess } from 'aelastics-result'

describe('Subtype test', () => {
  it('Testing if examples.student object is of type examples.student', () => {
    let s = {
      name: 'Nikola',
      age: 22,
      average: 7
    }
    let f = examples.student.validate(s)
    if (isFailure(f)) {
      expect(f.errors).toEqual([])
    }
  })
  it("Testing if examples.student object who doesn't satisfy person restrictions is of type examples.student", () => {
    let s = {
      name: 'Nikola',
      age: 22.5,
      average: 7
    }
    expect(isSuccess(examples.student.validate(s))).toBe(false)
  })

  it('Testing if examples.professor object who has 2 field with same name is of type examples.professor. We consider only subtype restrictions', () => {
    let s = {
      name: 'Nikola',
      age: 40,
      title: 'Phd'
    }
    expect(isSuccess(examples.professor.validate(s))).toBe(false)
  })
  it('Testing if examples.professor object who has 2 field with same name is of type examples.professor. We consider only subtype restrictions', () => {
    let s = {
      name: 'NIKOLA1',
      age: 40,
      title: 'Phd'
    }
    expect(isSuccess(examples.professor.validate(s))).toBe(true)
  })
  it('Testing if examples.professor object who has 2 field with same name is of type examples.professor.We consider all restrictions', () => {
    let s = {
      name: 'NIKOLA',
      age: 40,
      title: 'Phd'
    }
    expect(isSuccess(examples.professor.validate(s))).toBe(true)
  })
  // compiler says type number is not compatibile with type string&number
  it('Testing if worker is subtype of person (worker has field age of type string), it is false because we consider subtype restrictions ', () => {
    let s = {
      name: 'Zika',
      age: 22
    }
    expect(isSuccess(examples.worker.validate((s as unknown) as any))).toBe(false)
  })
})
