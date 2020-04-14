/*
 * Copyright (c) AelasticS 2020.
 */

import { SimpleTypeC } from './SimpleType'
import { Error, failure, Path, pathToString, Result, success } from 'aelastics-result'
import { VisitedNodes } from '../common/VisitedNodes'
import { Any } from '../common/Type'

export class UndefinedTypeC extends SimpleTypeC<undefined> {
  public readonly _tag: 'Undefined' = 'Undefined'

  constructor() {
    super('Undefined')
  }

  validateCyclic(
    value: any,
    path: Path = [],
    traversed: VisitedNodes<Any, any, any>
  ): Result<boolean> {
    if (value === undefinedType) {
      return success(true)
    } else {
      return failure(new Error(`Value '${value}' at path:'${pathToString(path)}' is not undefined`))
    }
  }

  validate(value: any): Result<boolean> {
    if (value === undefined) {
      return success(true)
    } else {
      return failure(new Error(`Value '${value}' is not undefined`))
    }
  }

  defaultValue(): undefined {
    return undefined
  }
}

/**
 *  Undefined type
 */
// tslint:disable-next-line:variable-name
export const undefinedType: UndefinedTypeC = new UndefinedTypeC()
