/*
 * Copyright (c) AelasticS 2019.
 */

import {
  appendPath,
  failure,
  failures,
  isFailure,
  Path,
  pathToString,
  success,
  Result,
  validationError,
  Errors
} from 'aelastics-result'
import {
  Any,
  ToDtoContext,
  DtoTypeOf,
  InstanceReference,
  TypeOf,
  FromDtoContext
} from '../common/Type'
import { ComplexTypeC } from './ComplexType'
import { TypeInstancePair, VisitedNodes } from '../common/VisitedNodes'
import { SimpleTypeC } from '../simple-types/SimpleType'
import { TraversalContext, TraversalFunc } from '../common/TraversalContext'

/**
 * Array type
 */

type DtoArrayType<E extends Any> = { ref: InstanceReference; array?: Array<DtoTypeOf<E>> }

export class ArrayTypeC<
  E extends Any /*, T extends Array<TypeOf<E>>, D extends c*/
> extends ComplexTypeC<E, Array<TypeOf<E>>, DtoArrayType<E>, Array<DtoTypeOf<E>>> {
  public readonly _tag: 'Array' = 'Array'

  constructor(name: string, type: E) {
    super(name, type)
  }

  public defaultValue(): any {
    return []
  }

  makeEmptyInstance(
    value: Array<DtoTypeOf<E>> | DtoArrayType<E>,
    path: Path,
    context: FromDtoContext
  ): Array<TypeOf<E>> {
    return []
  }

  validateCyclic(
    input: Array<TypeOf<E>>,
    path: Path = [],
    traversed: VisitedNodes<any, any, any>
  ): Result<boolean> {
    if (!Array.isArray(input)) {
      return failure(new Error(`Value ${pathToString(path)}: '${input}' is not Array`))
    }

    let pair: TypeInstancePair<Any, any> = [this, input]

    if (traversed.has(pair)) {
      return success(true)
    }

    traversed.set(pair, undefined)

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

  protected traverseChildren<R>(
    value: Array<TypeOf<E>>,
    f: (type: Any, value: any, c: TraversalContext<R>) => R,
    context: TraversalContext<R>
  ) {
    for (let i = 0; i < value.length; i++) {
      const x = value[i]
      f(this, x, context)
      if (this.baseType instanceof SimpleTypeC && context.skipSimpleTypes) {
        continue
      } else {
        this.baseType.traverseCyclic(x, f, context)
      }
    }
  }

  protected isArrayRef(input: any): input is DtoArrayType<E> {
    if (input.ref && input.array) {
      return true
    }
    return false
  }

  makeInstanceFromDTO(
    input: Array<DtoTypeOf<E>>,
    output: Array<TypeOf<E>>,
    path: Path,
    context: FromDtoContext
  ): void {
    if (!Array.isArray(input)) {
      context.errors.push(
        validationError(
          `Input ${pathToString(path)}:'${input}' is not an array`,
          path,
          this.name,
          input
        )
      )
    }
    for (let i = 0; i < input.length; i++) {
      const x = input[i]
      const conversion = this.baseType.fromDTOCyclic(x, path, context)
      output.push(conversion)
    }
  }

  makeDTOInstance(
    input: Array<TypeOf<E>>,
    ref: InstanceReference,
    path: Path,
    context: ToDtoContext
  ): Array<DtoTypeOf<E>> {
    if (!Array.isArray(input)) {
      context.errors.push(
        validationError(`Value ${pathToString(path)} is not Array: '${input}' `, path, this.name)
      )
    }
    const outArray: Array<DtoTypeOf<E>> = []
    for (let i = 0; i < input.length; i++) {
      const conversion = this.baseType.toDTOCyclic(
        input[i],
        appendPath(path, `[${i}]`, this.name),
        context
      )
      outArray.push(conversion)
    }
    return outArray
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
