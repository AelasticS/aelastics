/*
 * Copyright (c) AelasticS 2019.
 */

import {
  appendPath,
  Error,
  Errors,
  failure,
  failures,
  isFailure,
  Path,
  success,
  Result
} from 'aelastics-result'
import { Any, DtoTypeOf, TypeOf } from '../common/Type'
import { ComplexTypeC } from './ComplexType'

/**
 * Array type
 */

export class ArrayTypeC<
  E extends Any /*, T extends Array<TypeOf<E>>, D extends c*/
> extends ComplexTypeC<E, Array<TypeOf<E>>, Array<DtoTypeOf<E>>> {
  public readonly _tag: 'Array' = 'Array'

  constructor(name: string, type: E) {
    super(name, type)
  }

  public defaultValue(): any {
    return []
  }

  validateCyclic(
    input: Array<TypeOf<E>>,
    path: Path = [],
    traversed: Map<any, any>
  ): Result<boolean> {
    if (!Array.isArray(input)) {
      return failure(new Error(`Value ${path}: '${input}' is not Array`))
    }

    if (traversed.has(input)) {
      return success(true)
    }

    traversed.set(this, this)

    const errors: Errors = []
    for (let i = 0; i < input.length; i++) {
      const x = input[i]
      const validation = this.baseType.validateCyclic(
        x,
        appendPath(path, `[${i}]`, this.name, x),
        traversed
      )
      if (isFailure(validation)) {
        errors.push(...validation.errors)
      }
    }

    const res = this.checkValidators(input, path)
    if (isFailure(res)) {
      errors.push(...res.errors)
    }
    return errors.length ? failures(errors) : success(true)
  }

  public fromDTO(input: Array<DtoTypeOf<E>>, path: Path = []): Result<Array<TypeOf<E>>> {
    if (!Array.isArray(input)) {
      return failure(new Error(`Value ${path}: '${input}' is not Array`))
    }

    const a: Array<TypeOf<E>> = []
    const errors: Errors = []
    for (let i = 0; i < input.length; i++) {
      const x = input[i]
      const conversion = this.baseType.fromDTO(x, [])
      if (isFailure(conversion)) {
        errors.push(...conversion.errors)
      } else {
        a.push(conversion.value)
      }
    }

    const res = this.checkValidators(input, path)
    if (isFailure(res)) {
      errors.push(...res.errors)
    }
    return errors.length ? failures(errors) : success(a)
  }
  public toDTO(
    input: Array<TypeOf<E>>,
    path: Path = [],
    validate: boolean = true
  ): Result<Array<DtoTypeOf<E>>> {
    if (validate) {
      const res = this.validate(input, path)
      if (isFailure(res)) {
        return failures(res.errors)
      }
    } else {
      if (!Array.isArray(input)) {
        return failure(new Error(`Value ${path}: '${input}' is not Array`))
      }
    }

    const a: Array<DtoTypeOf<E>> = []
    const errors: Errors = []
    for (let i = 0; i < input.length; i++) {
      const x = input[i]
      const conversion = this.baseType.toDTO(x, [], validate)
      if (isFailure(conversion)) {
        errors.push(...conversion.errors)
      } else {
        a.push(conversion.value)
      }
    }
    /* const res = this.checkValidators(input, path);
        if (isFailure(res)) {
            errors.push(...res.errors)
        } */
    return errors.length ? failures(errors) : success(a)
  }

  validateLinks(traversed: Map<Any, Any>): Result<boolean> {
    return this.baseType.validateLinks(traversed)
  }
}

/*export interface ArrayType<T extends Any> extends ArrayTypeC<T, Array<TypeOf<T>>> {
}*/

export const arrayOf = <T extends Any>(
  element: T,
  name: string = `Array<${element.name}>`
): ArrayTypeC<T> => {
  return new ArrayTypeC<T>(name, element)
}
