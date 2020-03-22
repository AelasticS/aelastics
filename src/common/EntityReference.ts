/*
 * Copyright (c) AelasticS 2019.
 *
 */

import { TypeC, Any, InstanceReference, ConversionContext } from './Type'
import { ObjectTypeC, TypeOfKey } from '../complex-types/ObjectType'
import {
  appendPath,
  Errors,
  Failure,
  failures,
  failureValidation,
  isFailure,
  Path,
  Result,
  success,
  Success,
  validationError
} from 'aelastics-result'

// You can use const assertion (added in typescript 3.4)
// https://stackoverflow.com/questions/55570729/how-to-limit-the-keys-of-an-object-to-the-strings-of-an-array-in-typescript
// https://www.typescriptlang.org/docs/handbook/utility-types.html

const isObject = (u: any) => u !== null && typeof u === 'object'

export class EntityReference<T extends ObjectTypeC<any, readonly string[]>> extends TypeC<
  TypeOfKey<T>
> {
  public readonly referencedType: T

  constructor(name: string, obj: T) {
    super(name)
    this.referencedType = obj
  }

  // value should be of type corresponding to the identifier of the referenced type
  validate(value: any, path: Path = []): Success<boolean> | Failure {
    const result = isObject(value)
      ? success(value)
      : failureValidation('Value is not object', path, this.name, value)
    if (isFailure(result)) {
      return result
    }
    const identifier = this.referencedType.identifier
    const errors: Errors = []

    if (Object.keys(value).length > identifier.length) {
      const fail = failureValidation('Extra properties', path, this.name, value)
      if (isFailure(fail)) {
        return fail
      }
    }

    for (let i = 0; i < identifier.length; i++) {
      const k = identifier[i]

      if (value[k] === undefined) {
        errors.push(
          validationError(
            'missing property',
            appendPath(path, k, this.referencedType.baseType[k] as TypeC<any>),
            this.name
          )
        )
        continue
      }

      const ak = value[k]
      const t = this.referencedType.baseType[k] as TypeC<any>

      const validation = t.validate(ak, appendPath(path, k, t.name, ak))
      if (isFailure(validation)) {
        errors.push(...validation.errors)
      }
    }

    return errors.length ? failures(errors) : success(true)
  }

  fromDTO(value: any, path: Path = []): Success<any> | Failure {
    const result = isObject(value)
      ? success(value)
      : failureValidation('Value is not object', path, this.name, value)
    if (isFailure(result)) {
      return result
    }
    let a = {}

    const identifier = this.referencedType.identifier
    const errors: Errors = []

    if (Object.keys(value).length > identifier.length) {
      const fail = failureValidation('Extra properties', path, this.name, value)
      if (isFailure(fail)) {
        return fail
      }
    }

    for (let i = 0; i < identifier.length; i++) {
      const k: string = identifier[i]

      if (value[k] === undefined) {
        errors.push(
          validationError(
            'missing property',
            appendPath(path, k, this.referencedType.baseType[k] as TypeC<any>),
            this.name
          )
        )
        continue
      }
      const ak = value[k]
      const t = this.referencedType.baseType[k] as TypeC<any>

      const conversion = t.fromDTO(ak, appendPath(path, k, t.name, ak))
      if (isFailure(conversion)) {
        errors.push(...conversion.errors)
      } else {
        // @ts-ignore
        a[k] = conversion.value
      }
    }

    return errors.length ? failures(errors) : success(a)
  }

  toDTOCyclic(
    input: any,
    path: Path,
    visitedNodes: Map<any, any>,
    errors: Error[],
    context: ConversionContext
  ): InstanceReference | TypeOfKey<T> {
    let a: { [index: string]: any } = {}
    const key = this.referencedType.identifier
    for (let i = 0; i < key.length; i++) {
      const k = key[i]
      const ak = input[k]
      const t = this.referencedType.baseType[k] as TypeC<any>
      const conversion = t.toDTOCyclic(
        input,
        appendPath(path, k, t.name, ak),
        visitedNodes,
        errors,
        context
      )

      a[k] = conversion.value
    }
    return a
  }
  validateLinks(traversed: Map<Any, Any>): Result<boolean> {
    return this.referencedType.validateLinks(traversed)
  }
}

export const ref = (t: ObjectTypeC<any, string[]>, name: string = `referenceTo${t.name}`) =>
  new EntityReference(name, t)
