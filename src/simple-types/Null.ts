/*
 * Copyright (c) AelasticS 2019.
 */

import { SimpleTypeC } from './SimpleType'
import { Error, failure, Path, pathToString, Result, success } from 'aelastics-result'
import { VisitedNodes } from '../common/VisitedNodes'

export class NullTypeC extends SimpleTypeC<null> {
  public readonly _tag: 'Null' = 'Null'

  constructor() {
    super('Null')
  }

  validateCyclic(value: null, path: Path = [], traversed: VisitedNodes): Result<boolean> {
    if (value === null) {
      return success(true)
    } else {
      return failure(new Error(`Value '${value}' at path:'${pathToString(path)}' is not null`))
    }
  }

  validate(value: null): Result<boolean> {
    if (value === null) {
      return success(true)
    } else {
      return failure(new Error(`Value '${value}' is not null`))
    }
  }
}

/**
 *  Null type
 */
export const nullType: NullTypeC = new NullTypeC()
