/*
 * Copyright (c) AelasticS 2019.
 */

import { Any, ConversionContext, TypeC } from '../common/Type'
import { Error, Path, Result, success } from 'aelastics-result'

export abstract class SimpleTypeC<T, D = T> extends TypeC<T, D> {
  //    public readonly _tagSimple: 'Simple' = 'Simple';

  constructor(name: string) {
    super(name)
  }

  /** @internal */
  public toDTOCyclic(
    input: T,
    path: Path,
    visitedNodes: Map<any, any>,
    errors: Error[],
    context: ConversionContext
  ): D {
    return (input as any) as D
  }

  validateLinks(traversed: Map<Any, Any>): Result<boolean> {
    return success(true)
  }
}
