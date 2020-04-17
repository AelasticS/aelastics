/*
 * Copyright (c) AelasticS 2019.
 */

import { Any, ToDtoContext, FromDtoContext, TypeC } from '../common/Type'
import { Path, Result, success } from 'aelastics-result'

export abstract class SimpleTypeC<V, G = V, T = V> extends TypeC<V, G, T> {
  //    public readonly _tagSimple: 'Simple' = 'Simple';

  constructor(name: string) {
    super(name)
  }

  fromDTOCyclic(value: T | G, path: Path, context: FromDtoContext): V | undefined {
    return value as any
  }

  /** @internal */
  public toDTOCyclic(input: V, path: Path, context: ToDtoContext): T | G {
    return (input as any) as T | G
  }

  validateLinks(traversed: Map<Any, Any>): Result<boolean> {
    return success(true)
  }
}
