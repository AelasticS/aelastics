/*
 * Copyright (c) AelasticS 2019.
 */

import { Any, ConversionContext, TypeC } from '../common/Type'
import { Error, Path, Result, success } from 'aelastics-result'

export abstract class SimpleTypeC<V, G = V, T = V> extends TypeC<V, G, T> {
  //    public readonly _tagSimple: 'Simple' = 'Simple';

  constructor(name: string) {
    super(name)
  }

  /** @internal */
  public toDTOCyclic(input: V, path: Path, context: ConversionContext): T | G {
    return (input as any) as T | G
  }

  validateLinks(traversed: Map<Any, Any>): Result<boolean> {
    return success(true)
  }
}
