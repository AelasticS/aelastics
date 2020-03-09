/*
 * Copyright (c) AelasticS 2019.
 */
import { SimpleTypeC } from './SimpleType'
import { Error, failure, success, isSuccess } from 'aelastics-result'

export class DateTypeC extends SimpleTypeC {
  constructor() {
    super('Date')
    this._tag = 'Date'
  }

  validate(input, path = []) {
    if (input instanceof Date && !isNaN(input.getTime())) {
      return super.validate(input)
    }
    return failure(new Error(`Value ${path}: '${input}' is not valid Date`))
  }

  fromDTO(value, path = []) {
    try {
      const d = new Date(value)
      const res = this.validate(d, path)
      if (isSuccess(res)) {
        return success(d)
      } else {
        return res
      }
    } catch (e) {
      return failure(new Error(`Value ${path}: '${value}' is not valid Date`))
    }
  }

  toDTO(d) {
    return success(d.toJSON())
  }
}

/**
 *  date type
 */
export const date = new DateTypeC()
//# sourceMappingURL=DateType.js.map
