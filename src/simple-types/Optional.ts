/*
 * Copyright (c) AelasticS 2019.
 */

import { success, Path, Result, failures, isFailure } from 'aelastics-result'
import { Any, DtoTypeOf, TypeC, TypeOf } from '../common/Type'

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

  public fromDTO(value: DtoTypeOf<T> | undefined, path: Path = []): Result<T | undefined> {
    if (typeof value === 'undefined') {
      return success(undefined)
    } else {
      return this.base.fromDTO(value, path)
    }
  }
  /**
   * toDTO
   */
  public toDTO(
    value: TypeOf<T> | undefined,
    path: Path = [],
    validate: boolean = true
  ): Result<DtoTypeOf<T>> {
    if (validate) {
      const res = this.validate(value, path)
      if (isFailure(res)) {
        return failures(res.errors)
      }
    }

    if (typeof value === 'undefined') {
      return success(undefined)
    } else {
      return this.base.toDTO(value, path, validate)
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
