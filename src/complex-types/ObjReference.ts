/*
 * Copyright (c) AelasticS 2019.
 *
 */

import { TypeC, Any } from '../common/Type'
import { ObjectTypeC } from './ObjectType'
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

export type IdentifierOfType<T extends ObjectTypeC<any>> = T extends ObjectTypeC<infer P>
  ? P
  : never

const isObject = (u: any) => u !== null && typeof u === 'object'

export class ObjReference<T extends ObjectTypeC<any>> extends TypeC<IdentifierOfType<T>> {
  public readonly referencedType: T
  constructor(name: string, obj: T) {
    super(name)
    this.referencedType = obj
  }

  // ToDo: Ivana
  // value should be of type corresponding to the identifier of the referenced type

  validateCyclic(
    value: IdentifierOfType<T>,
    path: Path = [],
    traversed: Map<any, any>
  ): Success<boolean> | Failure {
    if (traversed.has(value)) {
      return success(true)
    }

    traversed.set(this, this)

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

      const validation = t.validateCyclic(ak, appendPath(path, k, t.name, ak), traversed)
      if (isFailure(validation)) {
        errors.push(...validation.errors)
      }
    }

    return errors.length ? failures(errors) : success(true)
  }

  // ToDo: Ivana
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

  // ToDo: Ivana
  toDTO(value: any, path: Path = [], validate: boolean = true): Success<any> | Failure {
    if (validate) {
      const res = this.validate(value)
      if (isFailure(res)) {
        return res
      }
    }
    let a = {}
    const identifier = this.referencedType.identifier
    const errors: Errors = []
    for (let i = 0; i < identifier.length; i++) {
      const k = identifier[i]
      const ak = value[k]
      const t = this.referencedType.baseType[k] as TypeC<any>

      const conversion = t.toDTO(ak, appendPath(path, k, t.name, ak), validate)
      if (isFailure(conversion)) {
        errors.push(...conversion.errors)
      } else {
        // @ts-ignore
        a[k] = conversion.value
      }
    }

    return success(a)
  }
  validateLinks(traversed: Map<Any, Any>): Result<boolean> {
    return this.referencedType.validateLinks(traversed)
  }
}

export const ref = (t: ObjectTypeC<any>, name: string = `referenceTo${t.name}`) =>
  new ObjReference(name, t)
