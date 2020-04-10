/*
 * Copyright (c) AelasticS 2019.
 */

import { success, Path, Result, failures, isFailure, ValidationError } from 'aelastics-result'
import { Any, ConversionContext, DtoTypeOf, TypeC, TypeOf } from './Type'

const getOptionalName = (base: Any): string => `optional ${base.name}`

export class OptionalTypeC<T extends TypeC<any>> extends TypeC<
  TypeOf<T> | undefined,
  DtoTypeOf<T> | undefined
> {
  public readonly _tag: 'Optional' = 'Optional'
  public readonly base: T

  public constructor(base: T, name: string = getOptionalName(base)) {
    super(name)
    this.base = base
  }

  public validate(value: TypeOf<T> | undefined, path: Path = []): Result<boolean> {
    if (typeof value === 'undefined') {
      return success(true)
    } else {
      return this.base.validate(value)
    }
  }

  fromDTOCyclic(value: any, path: Path, context: ConversionContext): TypeOf<T> | undefined {
    if (typeof value === 'undefined') {
      return undefined
    } else {
      return this.base.fromDTOCyclic(value, path, context)
    }
  }

  toDTOCyclic(
    input: TypeOf<T> | undefined,
    path: Path,
    context: ConversionContext
  ): DtoTypeOf<T> | undefined {
    if (typeof input === 'undefined') {
      return undefined
    } else {
      return this.base.toDTOCyclic(input, path, context)
    }
  }

  validateLinks(traversed: Map<Any, Any>): Result<boolean> {
    traversed.set(this, this)
    if (traversed.has(this.base)) return success(true)
    else return this.base.validateLinks(traversed)
  }
}

export function optional<RT extends Any>(type: RT, name?: string): OptionalTypeC<RT> {
  return new OptionalTypeC(type, name)
}
