/*
 * Copyright (c) AelasticS 2020.
 */

import { SimpleTypeC } from './SimpleType'
import { Error, failure, Path, Result, success } from 'aelastics-result'

export class UndefinedTypeC extends SimpleTypeC<boolean> {
  public readonly _tag: 'Undefined' = 'Undefined'
  constructor() {
    super('Undefined')
  }
  validateCyclic(value: any, path: Path = [], traversed: Map<any, any>): Result<boolean> {
    return this.validate(value, path)
  }

  public validate(value: any, path: Path = []): Result<boolean> {
    if (typeof value === 'undefined') {
      return success(true)
    } else {
      return failure(new Error(`Value ${path}: '${value}' is not undefined`))
    }
  }
}

/**
 *  Undefined type
 */
// tslint:disable-next-line:variable-name
export const undefined: UndefinedTypeC = new UndefinedTypeC()
