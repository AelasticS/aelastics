import * as t from '../../src/aelastics-types'
import { isSuccess } from 'aelastics-result'
// import {TypeOf} from "..";

describe('Test cases for literal type', () => {
  it('should be Literal type in case of valid String value', () => {
    const stringLiteral = t.literal('product')
    let value = 'product'
    expect(isSuccess(stringLiteral.validate(value))).toBe(true)
  })

  it('should not be Literal type in case of valid String value', () => {
    const stringLiteral = t.literal('product')
    let value = 'product123'
    expect(isSuccess(stringLiteral.validate(value))).toBe(false)
  })

  it('should be Literal type in case of valid Boolean value', () => {
    const booleanLiteral = t.literal(true)
    let value = true
    expect(isSuccess(booleanLiteral.validate(value))).toBe(true)
  })

  it('should not be Literal type in case of invalid Boolean value', () => {
    const booleanLiteral = t.literal(true)
    let value = false
    expect(isSuccess(booleanLiteral.validate(value))).toBe(false)
  })

  it('should be Literal type in case of valid Number value', () => {
    const numberLiteral = t.literal(55)
    let value = 55
    expect(isSuccess(numberLiteral.validate(value))).toBe(true)
  })

  it('should not be Literal type in case of Literal parametar is Number type and the value is same, but String type', () => {
    const numberLiteral = t.literal(107)
    let value = '107'
    expect(isSuccess(numberLiteral.validate(value))).toBe(false)
  })

  it('should not be Literal type in case of Literal parametar is Boolean type and the value is same, but String type', () => {
    const booleanLiteral = t.literal(false)
    let value = 'false'
    expect(isSuccess(booleanLiteral.validate(value))).toBe(false)
  })

  it("should not be Literal type in case of Literal parametar is Boolean type 'false' and the value is Number type '0' ", () => {
    const booleanLiteral = t.literal(false)
    let value = 0
    expect(isSuccess(booleanLiteral.validate(value))).toBe(false)
  })

  it("should not be Literal type in case of Literal parametar is Boolean type 'true' and the value is Number type '1' ", () => {
    const booleanLiteral = t.literal(true)
    let value = 1
    expect(isSuccess(booleanLiteral.validate(value))).toBe(false)
  })

  it("should not be Literal type in case of value is 'undefined'", () => {
    const stringLiteral = t.literal('undefined')
    let value = undefined
    expect(isSuccess(stringLiteral.validate((value as unknown) as boolean))).toBe(false)
  })

  it("should not be Literal type in case of value is 'null'", () => {
    const stringLiteral = t.literal('null')
    let value = null
    expect(isSuccess(stringLiteral.validate((value as unknown) as boolean))).toBe(false)
  })
})
