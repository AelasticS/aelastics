/*
 * Copyright (c) AelasticS 2019.
 */

import { SimpleTypeC } from './SimpleType'
import { Error, failure, Path, Result, success } from 'aelastics-result'

export class NullTypeC extends SimpleTypeC<boolean> {
  public readonly _tag: 'Null' = 'Null'
  constructor() {
    super('Null')
  }

  public validate(value: any, path: Path = []): Result<boolean> {
    if (value === null) {
      return success(true)
    } else {
      return failure(new Error(`Value ${path}: '${value}' must be null`))
    }
  }
}

/**
 *  Null type
 */
export const nullType: NullTypeC = new NullTypeC()
