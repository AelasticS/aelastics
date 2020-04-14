/*
 * Copyright (c) AelasticS 2019.
 */

import {
  appendPath,
  failure,
  failures,
  isFailure,
  Path,
  success,
  Result,
  ValidationError,
  validationError,
  Errors
} from 'aelastics-result'
import {
  Any,
  ToDtoContext,
  DtoTypeOf,
  InstanceReference,
  TypeC,
  TypeOf,
  FromDtoContext
} from '../common/Type'
import { ComplexTypeC } from './ComplexType'
import { TypeInstancePair, VisitedNodes } from '../common/VisitedNodes'

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

  protected makeEmptyInstance(
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
      return failure(new Error(`Value ${path}: '${input}' is not Array`))
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

  protected isArrayRef(input: any): input is DtoArrayType<E> {
    if (input.ref && input.array) {
      return true
    }
    return false
  }

  makeInstanceFromDTO(
    input: Array<DtoTypeOf<E>> | DtoArrayType<E>,
    path: Path,
    context: ToDtoContext
  ): Array<TypeOf<E>> {
    let inputArray: Array<DtoTypeOf<E>>
    if (this.isArrayRef(input)) {
      if (!Array.isArray(input.array)) {
        context.errors.push(validationError('Input is not an array', path, this.name, input))
        return []
      }
      inputArray = input.array
    } else {
      inputArray = input
    }

    const output: Array<TypeOf<E>> = []
    for (let i = 0; i < inputArray.length; i++) {
      const x = inputArray[i]
      const conversion = this.baseType.fromDTOCyclic(x, path, context)
      output.push(conversion)
    }
    return output
  }

  makeDTOInstance(
    input: Array<TypeOf<E>>,
    path: Path,
    context: ToDtoContext
  ): Array<DtoTypeOf<E>> | DtoArrayType<E> {
    if (!Array.isArray(input)) {
      context.errors.push(
        validationError(`Value ${path} is not Array: '${input}' `, path, this.name)
      )
    }
    let output: Array<DtoTypeOf<E>> | DtoArrayType<E>
    const outArray: Array<DtoTypeOf<E>> = []
    for (let i = 0; i < input.length; i++) {
      const conversion = this.baseType.toDTOCyclic(
        input[i],
        appendPath(path, `[${i}]`, this.name),
        context
      )
      outArray.push(conversion)
    }
    if (context.options.isTreeDTO) {
      output = outArray
    } else {
      output = {
        ref: this.retrieveRefFromVisited(input, context.visitedNodes),
        array: outArray
      }
    }
    return output
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
