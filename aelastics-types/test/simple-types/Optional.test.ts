import * as t from '../../src/aelastics-types'
import { isSuccess } from 'aelastics-result'

const personName = t.string.derive('name').alphabetical
const personAge = t.number.derive('age').int8
const person = t.object(
  {
    name: personName,
    age: personAge
  },
  'person'
)

const optPerson = t.optional(person, 'Optional person')

describe('Optional test', () => {
  it('Testing if person is valid optional Person', () => {
    let a: t.TypeOf<typeof t.number> = 22
    let p = {
      name: 'Peter',
      age: a
    }
    expect(isSuccess(optPerson.validate(p, []))).toBe(true)
  })
  it('Testing if undefined is optional person', () => {
    expect(isSuccess(optPerson.validate(undefined, []))).toBe(true)
  })
})
