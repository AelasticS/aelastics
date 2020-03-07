/*
 * Copyright (c) AelasticS 2019.
 */

import { Any, TypeC } from '../Type'
import { Result, success } from 'aelastics-result'

export abstract class SimpleTypeC<T, D = T> extends TypeC<T, D> {
  //    public readonly _tagSimple: 'Simple' = 'Simple';

  constructor(name: string) {
    super(name)
  }

  validateLinks(traversed: Map<Any, Any>): Result<boolean> {
    return success(true)
  }
}
