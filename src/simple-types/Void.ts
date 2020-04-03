/*
 * Copyright (c) AelasticS 2020.
 */

import { SimpleTypeC } from './SimpleType'
import { Error, failure, Path, Result } from 'aelastics-result'

export class VoidTypeC extends SimpleTypeC<boolean> {
  public readonly _tag: 'Void' = 'Void'
  constructor() {
    super('Void')
  }
  // Null can be treated as void https://www.typescriptlang.org/docs/handbook/basic-types.html#void

  validateCyclic(value: any, path: Path = [], traversed: Map<any, any>): Result<boolean> {
    return this.validate(value, path)
  }

  public validate(value: any | undefined, path: Path = []): Result<boolean> {
    if (typeof value === 'undefined' || value === null) {
      return this.checkValidators(value, path)
    } else {
      return failure(new Error(`Value ${path}: '${value}' is not void`))
    }
  }
}

/**
 *  Void type
 */
export const voidType: VoidTypeC = new VoidTypeC()
