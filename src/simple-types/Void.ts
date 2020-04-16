/*
 * Copyright (c) AelasticS 2020.
 */

import { SimpleTypeC } from './SimpleType'
import { appendPath, Error, failure, Path, pathToString, Result, success } from 'aelastics-result'
import { VisitedNodes } from '../common/VisitedNodes'
import { Any } from '../common/Type'

/**
 *  Void type
 */
export class VoidTypeC extends SimpleTypeC<void> {
  public readonly _tag: 'Void' = 'Void'

  constructor() {
    super('Void')
  }

  validateCyclic(
    value: any,
    path: Path = [],
    traversed: VisitedNodes<Any, any, any>
  ): Result<boolean> {
    if (typeof value === 'undefined' || value === null) {
      return success(true)
    } else {
      return failure(new Error(`Value '${value}' at path:'${pathToString(path)}' is not void`))
    }
  }

  // Null can be treated as void https://www.typescriptlang.org/docs/handbook/basic-types.html#void
  validate(value: any): Result<boolean> {
    if (typeof value === 'undefined' || value === null) {
      return success(true)
    } else {
      return failure(new Error(`Value '${value}' is not void`))
    }
  }

  defaultValue(): void {
    return undefined
  }
}

export const voidType: VoidTypeC = new VoidTypeC()
voidType.systemType = true
