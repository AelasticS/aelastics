/*
 * Copyright (c) AelasticS 2020.
 *
 */

import { Any, ToDtoContext, DtoTypeOf, InstanceReference, TypeC } from './Type'
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
  public readonly _tag: 'EntityReference' = 'EntityReference'

  constructor(name: string, obj: T) {
    super(name, obj)
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

  protected isEnityRef(input: any): input is DtoEntityReference<T> {
    if (input.ref && input.reference) {
      return true
    }
    return false
  }

  makeInstanceFromDTO(
    input: DtoTypeOfKey<T> | DtoEntityReference<T>,
    path: Path,
    context: ToDtoContext
  ): TypeOfKey<T> {
    let inputReference: DtoTypeOfKey<T>
    if (this.isEnityRef(input)) {
      inputReference = input.reference
    } else {
      inputReference = input
    }
    let output: Props = {}
    if (!isObject(inputReference)) {
      context.errors.push(validationError('Reference is not valid', path, this.name, input))
      return output
    }
    const identifier = this.referencedType.identifier
    for (let i = 0; i < identifier.length; i++) {
      const k: string = identifier[i]
      const ak = inputReference[k]
      const t = this.referencedType.baseType[k] as TypeC<any>
      const conversion = t.fromDTOCyclic(ak, appendPath(path, k, t.name, ak), context)
      output[k] = conversion
    }
    return output as TypeOfKey<T>
  }

  makeDTOInstance(
    input: TypeOfKey<T>,
    path: Path,
    context: ToDtoContext
  ): DtoTypeOfKey<T> | DtoEntityReference<T> {
    let output: DtoEntityReference<T> | TypeOfKey<T>
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
      if (context.options.isTreeDTO) {
        output = outReference
      } else {
        output = { ref: this.makeReference(input, context), reference: outReference }
      }
      return output
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
      return {}
    }
  }

  validateLinks(traversed: Map<Any, Any>): Result<boolean> {
    return this.referencedType.validateLinks(traversed)
  }
}

export const ref = <T extends ObjectTypeC<any, readonly string[]>>(
  t: T,
  name: string = `referenceTo${t.name}`
) => new EntityReference<T>(name, t)
