import * as t from '../..'
import { isSuccess } from 'aelastics-result'
// import {TypeOf} from "..";

describe('Test cases for Number type', () => {
  it('should be Number type', () => {
    const numberInRange = t.number
    let num = 2
    expect(isSuccess(numberInRange.validate(num))).toBe(true)
  })

  it('should not be Number type in case of String value', () => {
    const isNumber = t.number.derive()
    let num = 'cs'
    expect(isSuccess(isNumber.validate((num as unknown) as number))).toBe(false)
  })

  it("should not be Number type in case of 'undefined'", () => {
    const isNumberUndefined = t.number.derive()
    let num = undefined
    expect(isSuccess(isNumberUndefined.validate((num as unknown) as number))).toBe(false)
  })

  it("should not be Number type in case of 'null'", () => {
    const isNumber = t.number.derive()
    let num = null
    expect(isSuccess(isNumber.validate((num as unknown) as number))).toBe(false)
  })

  it('should be in range of Number values', () => {
    const numberInRange = t.number.derive().inRange(0, 100)
    let num: number = 23
    expect(isSuccess(numberInRange.validate(num))).toBe(true)
  })

  it('should not be in range of Number values in case of value above upper limit', () => {
    const numberInRange = t.number.derive().inRange(0, 100)
    let num: number = 112
    expect(isSuccess(numberInRange.validate(num))).toBe(false)
  })

  it('should not be in range of Number values in case of value bellow upper limit', () => {
    const numberInRange = t.number.derive().inRange(0, 100)
    let num: number = -12
    expect(isSuccess(numberInRange.validate(num))).toBe(false)
  })

  it('should be in range of Number values in case of value which is equal to upper limit', () => {
    const numberInRange = t.number.derive().inRange(0, 100)
    let num: number = 100
    expect(isSuccess(numberInRange.validate(num))).toBe(true)
  })

  it('should be in range of Number values in case of value which is equal to lower limit', () => {
    const numberInRange = t.number.derive().inRange(0, 100)
    let num: number = 0
    expect(isSuccess(numberInRange.validate(num))).toBe(true)
  })

  it('should be greater than Number value', () => {
    const numberGraterThan0 = t.number.derive().greaterThan(0)
    let num: number = 4
    expect(isSuccess(numberGraterThan0.validate(num))).toBe(true)
  })

  it('should not be greater than Number value in case of value bellow limit', () => {
    const numberGraterThan0 = t.number.derive().greaterThan(0)
    let num: number = -5
    expect(isSuccess(numberGraterThan0.validate(num))).toBe(false)
  })

  it('should not be greater than Number value in case of equal Number value ', () => {
    const numberGraterThan0 = t.number.derive().greaterThan(0)
    let num: number = 0
    expect(isSuccess(numberGraterThan0.validate(num))).toBe(false)
  })

  it('should be greater than or equal to Number value', () => {
    const numberGraterThanOrEqual0 = t.number
      .derive()
      .greaterThanOrEqual(0)
    let num: number = 5
    expect(isSuccess(numberGraterThanOrEqual0.validate(num))).toBe(true)
  })

  it('should not be greater than or equal to Number value in case of value bellow limit', () => {
    const numberGraterThanOrEqual0 = t.number
      .derive()
      .greaterThanOrEqual(0)
    let num: number = -10
    expect(isSuccess(numberGraterThanOrEqual0.validate(num))).toBe(false)
  })

  it('should be greater than or equal to Number value in case of equal Number value', () => {
    const numberGraterThanOrEqual0 = t.number
      .derive()
      .greaterThanOrEqual(0)
    let num: number = 0
    expect(isSuccess(numberGraterThanOrEqual0.validate(num))).toBe(true)
  })

  it('should be less than Number value', () => {
    const numberlessThan0 = t.number.derive().lessThan(0)
    let num: number = -5
    expect(isSuccess(numberlessThan0.validate(num))).toBe(true)
  })

  it('should not be less than Number value in case of value above limit', () => {
    const numberlessThan0 = t.number.derive().lessThan(0)
    let num: number = 6
    expect(isSuccess(numberlessThan0.validate(num))).toBe(false)
  })

  it('should not be less than Number value in case of equal Number value', () => {
    const numberlessThan0 = t.number.derive().lessThan(0)
    let num: number = 0
    expect(isSuccess(numberlessThan0.validate(num))).toBe(false)
  })

  it('should be less than or equal to Number value', () => {
    const numberlessThanOrEqual0 = t.number.derive().lessThanOrEqual(0)
    let num: number = -5
    expect(isSuccess(numberlessThanOrEqual0.validate(num))).toBe(true)
  })

  it('should not be less than or equal to Number value in case of value above limit', () => {
    const numberlessThanOrEqual0 = t.number.derive().lessThanOrEqual(0)
    let num: number = 5
    expect(isSuccess(numberlessThanOrEqual0.validate(num))).toBe(false)
  })

  it('should be less than or equal to Number value in case of equal Number value', () => {
    const numberlessThanOrEqual0 = t.number.derive().lessThanOrEqual(0)
    let num: number = 0
    expect(isSuccess(numberlessThanOrEqual0.validate(num))).toBe(true)
  })

  it('should be valid for equal Number values', () => {
    const numberEqual0 = t.number.derive().equal(0)
    let num: number = 0
    expect(isSuccess(numberEqual0.validate(num))).toBe(true)
  })

  it('should not be valid in case of unequal Number values', () => {
    const numberEqual0 = t.number.derive().equal(0)
    let num: number = 7
    expect(isSuccess(numberEqual0.validate(num))).toBe(false)
  })

  it('should be valid for integer Number values', () => {
    const numberInteger = t.number.derive().integer
    let num: number = 3
    expect(isSuccess(numberInteger.validate(num))).toBe(true)
  })

  it('should not be valid for non integer Number values', () => {
    const numberInteger = t.number.derive().integer
    let num: number = 3.325
    expect(isSuccess(numberInteger.validate(num))).toBe(false)
  })

  it('should be valid for infinite value', () => {
    const infiniteNumber = t.number.derive().infinite
    let num: number = 3 / 0
    expect(isSuccess(infiniteNumber.validate(num))).toBe(true)
  })

  it('should not be valid for finite value', () => {
    const infiniteNumber = t.number.derive().infinite
    let num: number = 3
    expect(isSuccess(infiniteNumber.validate(num))).toBe(false)
  })

  it('should be valid for positive value', () => {
    const positiveNumber = t.number.derive().positive
    let num: number = 3
    expect(isSuccess(positiveNumber.validate(num))).toBe(true)
  })

  it('should not be valid for negative value', () => {
    const positiveNumber = t.number.derive().positive
    let num: number = -3
    expect(isSuccess(positiveNumber.validate(num))).toBe(false)
  })

  it('should not be valid positive value in case of value 0', () => {
    const positiveNumber = t.number.derive().positive
    let num: number = 0
    expect(isSuccess(positiveNumber.validate(num))).toBe(false)
  })

  it('should be valid for negative value', () => {
    const negativeNumber = t.number.derive().negative
    let num1: number = -3
    expect(isSuccess(negativeNumber.validate(num1))).toBe(true)
  })

  it('should not be valid for positive value', () => {
    const negativeNumber = t.number.derive().negative
    let num: number = 3
    expect(isSuccess(negativeNumber.validate(num))).toBe(false)
  })

  it('should not be valid negative value in case of value 0', () => {
    const negativeNumber = t.number.derive().negative
    let num: number = 0
    expect(isSuccess(negativeNumber.validate(num))).toBe(false)
  })

  it('shoud be integer or infinite value in case of integer value', () => {
    const numberIntOrInf = t.number.derive().integerOrInfinite
    let num: number = 2
    expect(isSuccess(numberIntOrInf.validate(num))).toBe(true)
  })

  it('shoud be integer or infinite value in case of infinite value', () => {
    const numberIntOrInf = t.number.derive().integerOrInfinite
    let num: number = 2 / 0
    expect(isSuccess(numberIntOrInf.validate(num))).toBe(true)
  })

  it('shoud not be integer or infinite value in case of finite and non integer value', () => {
    const numberIntOrInf = t.number.derive().integerOrInfinite
    let num: number = 2.25
    expect(isSuccess(numberIntOrInf.validate(num))).toBe(false)
  })

  it('should be uint8 value', () => {
    const uint8Number = t.number.derive().uint8
    let num: number = 20
    expect(isSuccess(uint8Number.validate(num))).toBe(true)
  })

  it('should not be uint8 value in case of value above limit of uint8', () => {
    const uint8Number = t.number.derive().uint8
    let num: number = 260
    expect(isSuccess(uint8Number.validate(num))).toBe(false)
  })

  it('should not be uint8 in case of negative value', () => {
    const uint8Number = t.number.derive().uint8
    let num: number = -2
    expect(isSuccess(uint8Number.validate(num))).toBe(false)
  })

  it('should be uint8 value in case of value which is equal to upper limit', () => {
    const uint8Number = t.number.derive().uint8
    let num: number = 255
    expect(isSuccess(uint8Number.validate(num))).toBe(true)
  })

  it('should be uint8 value in case of value which is equal to lower limit', () => {
    const uint8Number = t.number.derive().uint8
    let num: number = 0
    expect(isSuccess(uint8Number.validate(num))).toBe(true)
  })

  it('should be uint16 value', () => {
    const uint16Number = t.number.derive().uint16
    let num: number = 20
    expect(isSuccess(uint16Number.validate(num))).toBe(true)
  })

  it('should not be uint16 value in case of value above limit of uint16', () => {
    const uint16Number = t.number.derive().uint16
    let num: number = 70000
    expect(isSuccess(uint16Number.validate(num))).toBe(false)
  })

  it('should not be uint16 in case of negative value', () => {
    const uint16Number = t.number.derive().uint16
    let num: number = -2
    expect(isSuccess(uint16Number.validate(num))).toBe(false)
  })

  it('should be uint16 value in case of value which is equal to upper limit', () => {
    const uint16Number = t.number.derive().uint16
    let num: number = 65535
    expect(isSuccess(uint16Number.validate(num))).toBe(true)
  })

  it('should be uint16 value in case of value which is equal to lower limit', () => {
    const uint16Number = t.number.derive().uint16
    let num: number = 0
    expect(isSuccess(uint16Number.validate(num))).toBe(true)
  })

  it('should be uint32 value', () => {
    const uint32Number = t.number.derive().uint32
    let num: number = 20
    expect(isSuccess(uint32Number.validate(num))).toBe(true)
  })

  it('should not be uint32 value in case of value above limit of uint32', () => {
    const uint32Number = t.number.derive().uint32
    let num: number = 5000000000
    expect(isSuccess(uint32Number.validate(num))).toBe(false)
  })

  it('should not be uint32 in case of negative value', () => {
    const uint32Number = t.number.derive().uint32
    let num: number = -2
    expect(isSuccess(uint32Number.validate(num))).toBe(false)
  })

  it('should be uint32 value in case of value which is equal to upper limit', () => {
    const uint32Number = t.number.derive().uint32
    let num: number = 4294967295
    expect(isSuccess(uint32Number.validate(num))).toBe(true)
  })

  it('should be uint32 value in case of value which is equal to lower limit', () => {
    const uint32Number = t.number.derive().uint32
    let num: number = 0
    expect(isSuccess(uint32Number.validate(num))).toBe(true)
  })

  it('should be int8 value', () => {
    const int8Number = t.number.derive().int8
    let num: number = -8
    expect(isSuccess(int8Number.validate(num))).toBe(true)
  })

  it('should not be int8 value in case of value above limit of int8', () => {
    const int8Number = t.number.derive().int8
    let num: number = 130
    expect(isSuccess(int8Number.validate(num))).toBe(false)
  })
  it('should not be int8 in case of value bellow lower limit of int8', () => {
    const int8Number = t.number.derive().int8
    let num: number = -200
    expect(isSuccess(int8Number.validate(num))).toBe(false)
  })

  it('should be int8 value in case of value which is equal to upper limit', () => {
    const int8Number = t.number.derive().int8
    let num: number = 127
    expect(isSuccess(int8Number.validate(num))).toBe(true)
  })

  it('should be int8 value in case of value which is equal to lower limit', () => {
    const int8Number = t.number.derive().int8
    let num: number = -128
    expect(isSuccess(int8Number.validate(num))).toBe(true)
  })

  it('should be int16 value', () => {
    const int16Number = t.number.derive().int16
    let num: number = -8
    expect(isSuccess(int16Number.validate(num))).toBe(true)
  })

  it('should not be int16 value in case of value above limit of int16', () => {
    const int16Number = t.number.derive().int16
    let num: number = 35000
    expect(isSuccess(int16Number.validate(num))).toBe(false)
  })

  it('should not be int16 in case of value bellow lower limit of int16', () => {
    const int16Number = t.number.derive().int16
    let num: number = -35000
    expect(isSuccess(int16Number.validate(num))).toBe(false)
  })

  it('should be int16 value in case of value which is equal to upper limit', () => {
    const int16Number = t.number.derive().int16
    let num: number = 32767
    expect(isSuccess(int16Number.validate(num))).toBe(true)
  })

  it('should be int16 value in case of value which is equal to lower limit', () => {
    const int16Number = t.number.derive().int16
    let num: number = -32768
    expect(isSuccess(int16Number.validate(num))).toBe(true)
  })

  it('should be int32 value', () => {
    const int32Number = t.number.derive().int32
    let num: number = -8000
    expect(isSuccess(int32Number.validate(num))).toBe(true)
  })

  it('should not be int32 value in case of value above limit of int32', () => {
    const int32Number = t.number.derive().int32
    let num: number = 2500000000
    expect(isSuccess(int32Number.validate(num))).toBe(false)
  })

  it('should not be int32 in case of value bellow lower limit of int32', () => {
    const int32Number = t.number.derive().int32
    let num: number = -2500000000
    expect(isSuccess(int32Number.validate(num))).toBe(false)
  })

  it('should be int32 value in case of value which is equal to upper limit', () => {
    const int32Number = t.number.derive().int32
    let num: number = 2147483647
    expect(isSuccess(int32Number.validate(num))).toBe(true)
  })

  it('should be int32 value in case of value which is equal to lower limit', () => {
    const int32Number = t.number.derive().int32
    let num: number = -2147483648
    expect(isSuccess(int32Number.validate(num))).toBe(true)
  })

  // Combinations
  it('should be positive and in range Number value', () => {
    const numberInRange = t.number.derive().positive.inRange(-10, 50)
    let num = 5
    expect(isSuccess(numberInRange.validate(num))).toBe(true)
  })

  it('should not be positive and in range Number value', () => {
    const numberInRange = t.number.derive().positive.inRange(-10, 50)
    let num = -5
    expect(isSuccess(numberInRange.validate(num))).toBe(false)
  })

  it('should be negative, greater then and less then or equal Number value', () => {
    const isNumber = t.number
      .derive()
      .negative.greaterThan(-10)
      .lessThanOrEqual(10)
    let num = -5
    expect(isSuccess(isNumber.validate(num))).toBe(true)
  })

  it('should not be positive, greater then and less then or equal Number value', () => {
    const isNumber = t.number
      .derive()
      .positive.greaterThan(-10)
      .lessThanOrEqual(10)
    let num = -10
    expect(isSuccess(isNumber.validate(num))).toBe(false)
  })

  it('should be positive, greater then and less then or equal Number value', () => {
    const isNumber = t.number
      .derive()
      .positive.greaterThan(-10)
      .lessThanOrEqual(10)
    let num = 5
    expect(isSuccess(isNumber.validate(num))).toBe(true)
  })

  it('should not be positive, greater then and less then or equal Number value in case of infinite value', () => {
    const isNumber = t.number
      .derive()
      .positive.greaterThan(-10)
      .lessThanOrEqual(10)
    let num = 5 / 0
    expect(isSuccess(isNumber.validate(num))).toBe(false)
  })

  it('should be negative and uint8 Number value', () => {
    const isNumber = t.number.derive().negative.int8
    let num = -50
    expect(isSuccess(isNumber.validate(num))).toBe(true)
  })

  it('should not be negative and uint8 Number value', () => {
    const isNumber = t.number.derive().negative.uint8
    let num = -50
    expect(isSuccess(isNumber.validate(num))).toBe(false)
  })

  it('should not be negative and uint8 Number value', () => {
    const isNumber = t.number.derive().negative.uint32
    let num = -500000
    expect(isSuccess(isNumber.validate(num))).toBe(false)
  })

  it('should not be negative and uint16 Number value', () => {
    const isNumber = t.number.derive().int8.uint16
    let num = -2
    expect(isSuccess(isNumber.validate(num))).toBe(false)
  })

  it("should not be less than and equal Number value in case of 'null' value", () => {
    const isNumber = t.number
      .derive()
      .lessThan(20)
      .equal(5)
    let num = null
    expect(isSuccess(isNumber.validate((num as unknown) as number))).toBe(false)
  })
  // failed
  it("should not be less than and equal Number value in case of 'undefined' value", () => {
    const isNumber = t.number
      .derive()
      .lessThan(20)
      .equal(5)
    let num = undefined
    expect(isSuccess(isNumber.validate((num as unknown) as number))).toBe(false)
  })

  it('should be less than and equal Number value', () => {
    const isNumber = t.number
      .derive()
      .lessThan(20)
      .equal(5)
    let num = 5
    expect(isSuccess(isNumber.validate(num))).toBe(true)
  })

  it('should be less than, equal and integer or infinite value', () => {
    const isNumber = t.number
      .derive()
      .lessThan(20)
      .equal(5).integerOrInfinite
    let num = 5
    expect(isSuccess(isNumber.validate(num))).toBe(true)
  })
  it('should not be less than, equal and integer or infinite value in case of non integer value', () => {
    const isNumber = t.number
      .derive()
      .lessThan(20)
      .equal(5).integerOrInfinite
    let num = 5.25
    expect(isSuccess(isNumber.validate(num))).toBe(false)
  })

  it('should not be less than, equal and integer or infinite value in case of infinite value', () => {
    const isNumber = t.number
      .derive()
      .lessThan(20)
      .equal(5).integerOrInfinite
    let num = 5 / 0
    expect(isSuccess(isNumber.validate(num))).toBe(false)
  })

  it("should not be less than, uint32 and integer or infinite value in case of 'undefined' value", () => {
    const isNumber = t.number.derive().lessThan(20).integerOrInfinite
      .uint32
    let num = undefined
    expect(isSuccess(isNumber.validate((num as unknown) as number))).toBe(false)
  })

  it('should be integer, finite and greater then or equal Number value', () => {
    const isNumber = t.number
      .derive()
      .integer.finite.greaterThanOrEqual(10)
    let num = 10
    expect(isSuccess(isNumber.validate(num))).toBe(true)
  })

  it('should not be integer, finite and greater then or equal Number value in case of non integer value', () => {
    const isNumber = t.number
      .derive()
      .integer.finite.greaterThanOrEqual(10)
    let num = 10.25
    expect(isSuccess(isNumber.validate(num))).toBe(false)
  })

  test('should not be integer, finite and greater then or equal Number value in case of string value', () => {
    const isNumber = t.number
      .derive()
      .integer.finite.greaterThanOrEqual(10)
    let num = '25'
    expect(isSuccess(isNumber.validate((num as unknown) as number))).toBe(false)
  })

  it('should be int16, less than, finite and greater then or equal Number value', () => {
    const isNumber = t.number
      .derive()
      .int16.lessThan(100)
      .greaterThanOrEqual(-20).finite
    let num = 50
    expect(isSuccess(isNumber.validate(num))).toBe(true)
  })

  it("should not be int16, less than, finite and greater then or equal Number value in case of 'null' value", () => {
    const isNumber = t.number
      .derive()
      .int16.lessThan(100)
      .greaterThanOrEqual(-20).finite
    let num = null
    expect(isSuccess(isNumber.validate((num as unknown) as number))).toBe(false)
  })

  it('should not be int16, less than, finite and greater then or equal Number value in case of infinite value', () => {
    const isNumber = t.number
      .derive()
      .int16.lessThan(100)
      .greaterThanOrEqual(-20).finite
    let num = 1 / 0
    expect(isSuccess(isNumber.validate(num))).toBe(false)
  })
  it('should be positive, in range, finite and less then or equal Number value', () => {
    const isNumber = t.number
      .derive()
      .positive.inRange(-10, 50)
      .lessThanOrEqual(10).finite
    let num = 5
    expect(isSuccess(isNumber.validate(num))).toBe(true)
  })

  it('should not be positive, in range, finite and less then or equal Number value in case of negative value', () => {
    const isNumber = t.number
      .derive()
      .positive.inRange(-10, 50)
      .lessThanOrEqual(10).finite
    let num = -20
    expect(isSuccess(isNumber.validate(num))).toBe(false)
  })

  it('should not be positive, in range, finite and less then or equal Number value in case of infinite value', () => {
    const isNumber = t.number
      .derive()
      .positive.inRange(-10, 50)
      .lessThanOrEqual(10).finite
    let num = 5 / 0
    expect(isSuccess(isNumber.validate(num))).toBe(false)
  })
})
