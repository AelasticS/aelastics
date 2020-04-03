/*
 * Copyright (c) AelasticS 2019.
 */

import { SimpleTypeC } from './SimpleType'
import { Error, failure, Result, Path, validationError } from 'aelastics-result'
import { ConversionContext } from '../common/Type'

export class DateTypeC extends SimpleTypeC<Date, string, string> {
  public readonly _tag: 'Date' = 'Date'

  constructor() {
    super('Date')
  }

  validateCyclic(value: Date, path: Path = [], traversed: Map<any, any>): Result<boolean> {
    return this.validate(value, path)
  }

  public validate(input: Date, path: Path = []): Result<boolean> {
    if (input instanceof Date && !isNaN(input.getTime())) {
      return super.validate(input)
    }
    return failure(new Error(`Value ${path}: '${input}' is not valid Date`))
  }

  fromDTOCyclic(value: string, path: Path, context: ConversionContext): Date | undefined {
    try {
      const d = new Date(value)
      return d
    } catch (e) {
      context.errors.push(
        validationError(`Value ${path}: '${value}' is not valid Date`, path, this.name)
      )
      return undefined
    }
  }

  toDTOCyclic(input: Date, path: Path, context: ConversionContext): string {
    return input.toJSON()
  }
}

/**
 *  date type
 */

export const date = new DateTypeC()
