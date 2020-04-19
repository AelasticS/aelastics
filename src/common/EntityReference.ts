/*
 * Copyright (c) AelasticS 2020.
 *
 */

import { Any, FromDtoContext, InstanceReference, ToDtoContext, TypeC } from './Type'
import { isObject, ObjectTypeC, Props } from '../complex-types/ObjectType'
import {
  appendPath,
  Errors,
  Failure,
  failures,
  failureValidation,
  isFailure,
  Path,
  pathToString,
  Result,
  success,
  Success,
  validationError
} from 'aelastics-result'
import { ComplexTypeC } from '../complex-types/ComplexType'
import { VisitedNodes } from './VisitedNodes'
import { TraversalContext } from './TraversalContext'
import { SimpleTypeC } from '../simple-types/SimpleType'

// You can use const assertion (added in typescript 3.4)
// https://stackoverflow.com/questions/55570729/how-to-limit-the-keys-of-an-object-to-the-strings-of-an-array-in-typescript
// https://www.typescriptlang.org/docs/handbook/utility-types.html

export type TypeOfKey<C extends ObjectTypeC<any, readonly string[]>> = C['ID']
export type DtoTypeOfKey<C extends ObjectTypeC<any, readonly string[]>> = C['ID_DTO']
export type DtoTreeTypeOfKey<C extends ObjectTypeC<any, readonly string[]>> = C['ID_DTO_TREE']

export type DtoEntityReference<T extends ObjectTypeC<any, readonly string[]>> = {
  ref: InstanceReference
  reference: DtoTypeOfKey<T>
}

export class EntityReference<T extends ObjectTypeC<any, readonly string[]>> extends ComplexTypeC<
  T,
  TypeOfKey<T>,
  DtoEntityReference<T>,
  DtoTypeOfKey<T>
> {
  public readonly referencedType: T = this.baseType
  public readonly _tag: 'Reference' = 'Reference'

  constructor(name: string, obj: T) {
    super(name, obj)
  }

  protected traverseChildren<R>(
    value: TypeOfKey<T>,
    f: <R>(type: Any, value: any, c: TraversalContext) => R,
    context: TraversalContext
  ): void {
    const identifier = this.referencedType.identifier
    for (let i = 0; i < identifier.length; i++) {
      const k = identifier[i]
      const ak = value[k]
      const t = this.referencedType.baseType[k] as TypeC<any>
      if (t instanceof SimpleTypeC && context.skipSimpleTypes) {
        continue
      }
      t.traverseCyclic(value, f, context)
    }
  }

  // value should be of type corresponding to the identifier of the referenced type
  validateCyclic(
    value: TypeOfKey<T>,
    path: Path = [],
    traversed: VisitedNodes<Any, any, any>
  ): Success<boolean> | Failure {
    const result = isObject(value)
      ? success(value)
      : failureValidation('Value is not object', path, this.name, value)
    if (isFailure(result)) {
      return result
    }
    const identifier = this.referencedType.identifier
    const errors: Errors = []
    // if (Object.keys(value).length > identifier.length) {
    //   const fail = failureValidation('Extra properties', path, this.name, value)
    //   if (isFailure(fail)) {
    //     return fail
    //   }
    // }
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

  protected isEnityRef(input: any): input is DtoEntityReference<T> {
    if (input.ref && input.reference) {
      return true
    }
    return false
  }

  makeInstanceFromDTO(
    input: DtoTypeOfKey<T>,
    empty: TypeOfKey<T>,
    path: Path,
    context: FromDtoContext
  ) {
    let output: Props = empty
    if (!isObject(input)) {
      context.errors.push(validationError('Reference is not valid', path, this.name, input))
      return output
    }
    const identifier = this.referencedType.identifier
    for (let i = 0; i < identifier.length; i++) {
      const k: string = identifier[i]
      const ak = input[k]
      const t = this.referencedType.baseType[k] as TypeC<any>
      output[k] = t.fromDTOCyclic(ak, appendPath(path, k, t.name, ak), context)
    }
  }

  makeDTOInstance(
    input: TypeOfKey<T>,
    ref: InstanceReference,
    path: Path,
    context: ToDtoContext
  ): DtoTypeOfKey<T> {
    let outReference: DtoTypeOfKey<T> = {}
    const key = this.referencedType.identifier
    try {
      for (let i = 0; i < key.length; i++) {
        const k = key[i]
        const ak = input[k]
        const t = this.referencedType.baseType[k] as TypeC<any>
        const conversion = t.toDTOCyclic(ak, appendPath(path, k, t.name, ak), context)
        ObjectTypeC.addProperty(outReference, k, conversion)
      }
      return outReference
    } catch (e) {
      context.errors.push(
        validationError(
          `Entity Reference.makeDTOInstance caught error:'${e.toString()}' with value:'${input}' at the path:'${pathToString(
            path
          )}'`,
          path,
          this.name
        )
      )
      return outReference
    }
  }

  validateLinks(traversed: Map<Any, Any>): Result<boolean> {
    return this.referencedType.validateLinks(traversed)
  }

  defaultValue(): TypeOfKey<T> {
    const output: { [key: string]: any } = {}
    const identifier = this.referencedType.identifier
    for (let i = 0; i < identifier.length; i++) {
      const k: string = identifier[i]
      const t = this.referencedType.baseType[k] as TypeC<any>
      output[k] = t.defaultValue()
    }
    return output
  }

  makeEmptyInstance(
    value: DtoTypeOfKey<T> | DtoEntityReference<T>,
    path: Path,
    context: FromDtoContext
  ): TypeOfKey<T> {
    return {}
  }
}

export const ref = <T extends ObjectTypeC<any, readonly string[]>>(
  t: T,
  name: string = `referenceTo${t.name}`
) => new EntityReference<T>(name, t)
