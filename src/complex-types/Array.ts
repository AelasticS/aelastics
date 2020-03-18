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
  Result,
  isSuccess
} from 'aelastics-result'
import { Any, ConversionOptions, DtoTypeOf, TypeOf } from '../common/Type'
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

  public validate(input: Array<TypeOf<E>>, path: Path = []): Result<boolean> {
    if (!Array.isArray(input)) {
      return failure(new Error(`Value ${path}: '${input}' is not Array`))
    }

    const errors: Errors = []
    for (let i = 0; i < input.length; i++) {
      const x = input[i]
      const validation = this.baseType.validate(x, appendPath(path, `[${i}]`, this.name))
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

  toDTOCyclic(
    input: Array<TypeOf<E>>,
    path: Path,
    visitedNodes: Map<any, any>,
    errors: Error[],
    options: ConversionOptions & { counter: number }
  ): Result<Array<DtoTypeOf<E>>> {
    if (!Array.isArray(input)) {
      return failure(new Error(`Value ${path} is not Array: '${input}' `))
    }
    const a: Array<DtoTypeOf<E>> = []
    for (let i = 0; i < input.length; i++) {
      const x = input[i]
      const conversion = this.baseType.toDTOCyclic(
        x,
        appendPath(path, `[${i}]`, this.name),
        visitedNodes,
        errors,
        options
      )
      if (isSuccess(conversion)) {
        a.push(conversion.value)
      }
    }
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
