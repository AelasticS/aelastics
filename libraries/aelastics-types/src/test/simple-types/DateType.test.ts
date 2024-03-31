import * as t from '../..'
import { isFailure, isSuccess } from 'aelastics-result'
describe('DateType tests', () => {
  const dateAfter2000 = t.date.derive('year after 2000').addValidator({
    message: (value, label) => `Expected ${label} to be after 2000,got ${value}`,
    predicate: value => value.getFullYear() > 2000
  })

  it('Testing now Date to be valid Date', () => {
    expect(isSuccess(t.date.validate(new Date()))).toBe(true)
  })

  // false
  it('Testing if Date given via string is a valid Date', () => {
    expect(isSuccess(t.date.validate(new Date('1995-12-17T03:24:00')))).toBe(true)
  })
  // false
  it('Testing if specific Date format given via string is a valid Date', () => {
    expect(isSuccess(t.date.validate(new Date('1995-12-17')))).toBe(true)
  })
  // false
  it('Testing if given string Date in a format mm.dd.yy is a valid Date', () => {
    expect(isSuccess(t.date.validate(new Date('7.10.2018.')))).toBe(true)
  })
  it('Testing if given string Date in a format mm.dd.yy with wrong values is a valid Date', () => {
    expect(isSuccess(t.date.validate(new Date('17.10.2018.')))).toBe(false)
  })
  it("Testing if 'null' is a valid Date", () => {
    expect(isSuccess(t.date.validate((null as unknown) as Date))).toBe(false)
  })
  it("Testing if 'undefined' is a valid Date", () => {
    expect(isSuccess(t.date.validate((undefined as unknown) as Date))).toBe(false)
  })
  it('Testing if number value is a valid Date', () => {
    expect(isSuccess(t.date.validate((10 as unknown) as Date))).toBe(false)
  })
  it('Testing if string value in Date format is a valid Date', () => {
    expect(isSuccess(t.date.validate(('10.02.2016.' as unknown) as Date))).toBe(false)
  })
  // failed - without toString on new Date
  it('Testing now Date to be valid dateAfter2000', () => {
    expect(isSuccess(dateAfter2000.validate(new Date()))).toBe(true)
  })

  it('Testing some date before 2000 to be valid dateAfter2000', () => {
    expect(isSuccess(dateAfter2000.validate(new Date('1995-12-17T03:24:00')))).toBe(false)
  })

  it('Testing if fromDTO  is valid in case of valid format date', () => {
    let res = t.date.fromDtoGraph('5.05.2019.')
    expect((res)).toEqual(new Date('5.05.2019.'))
  })

  // new Date from number is valid date!
  it('Testing if fromDTO  is valid in case of number value', () => {
    let res = t.date.fromDtoGraph((55 as unknown) as any)
    expect((res)).toEqual(new Date(55))
  })

  it("Testing if fromDTO errors are valid in case of 'null' value", () => {
    let res = t.date.fromDtoGraph((null as unknown) as any)
    expect((res)).toEqual(new Date(null as any))

  })
})
