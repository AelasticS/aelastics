/*
 * Copyright (c) AelasticS 2019.
 *
 */

import { ObjectType, ObjectTypeC, Props, DtoObjectType, isObject } from './ObjectType'
import {
  isFailure,
  // isSuccess,
  Result,
  Path,
  failures,
  success,
  failureValidation,
  Errors,
  validationError,
  appendPath
} from 'aelastics-result'
import { Any, TypeC } from '../common/Type'
import { TypeSchema } from '../common/TypeSchema'
import { OptionalTypeC } from '../simple-types/Optional'

export class SubtypeC<
  P extends Props,
  SP extends Props,
  S extends ObjectTypeC<Props>
> extends ObjectTypeC<P & SP> {
  //    public readonly _tag: 'Subtype' = 'Subtype';
  public readonly superType: ObjectTypeC<Props>
  //    public readonly  extraProps:P;
  //    public readonly  superProps:SP;
  //    protected readonly superInstance: ObjectTypeC<P & SP>;

  constructor(name: string, baseType: P, superType: ObjectTypeC<Props>) {
    // ToDo Nikola: verify that there are NO!!!! overriding properties (with same name as in supertype)
    super(name, baseType as P & SP)
    this.superType = superType
  }

  // get all properties from class hierarchy - overridden properties are not included!
  get allProperties(): Map<string, TypeC<any>> {
    let mp = this.superType.allProperties
    this.keys.forEach(key => {
      mp.set(key, this.baseType[key] as TypeC<any>)
    })
    return mp
  }

  public defaultValue(): any {
    return Object.assign(this.superType.defaultValue(), super.defaultValue())
  }

  validateCyclic(
    input: ObjectType<P & SP>,
    path: Path = [],
    traversed: Map<any, any>
  ): Result<boolean> {
    if (traversed.has(input)) {
      return success(true)
    }

    traversed.set(input, input)

    let mapOfAllProperties = this.allProperties
    let keys = Array.from(mapOfAllProperties.keys())

    const result = isObject(input)
      ? success(input)
      : failureValidation('Value is not object', path, this.name, input)
    if (isFailure(result)) {
      return result
    }

    const errors: Errors = []
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i]
      const t = mapOfAllProperties.get(k)

      if (t !== undefined) {
        if (!input.hasOwnProperty(k) && !(t instanceof OptionalTypeC)) {
          errors.push(validationError('missing property', appendPath(path, k, t.name), this.name))
          continue
        }

        const ak = input[k]
        const validation = t.validateCyclic(ak, appendPath(path, k, t.name, ak), traversed)
        if (isFailure(validation)) {
          errors.push(...validation.errors)
        }
      }
    }

    const res = this.checkValidators(input, path)
    if (isFailure(res)) {
      errors.push(...res.errors)
    }
    return errors.length ? failures(errors) : success(true)
  }

  // TODO: Consider property overriding
  public fromDTO(input: DtoObjectType<P & SP>, path: Path = []): Result<ObjectType<P & SP>> {
    const resSuper = this.superType.fromDTO(input, path)
    const res = super.fromDTO(input, path)

    if (isFailure(resSuper)) {
      if (isFailure(res)) {
        //  both failure
        Object.assign(resSuper.errors, res.errors)
      }

      return resSuper
    } else {
      if (isFailure(res)) {
        // only res failure
        return res
      } else {
        // both success
        Object.assign(resSuper.value, res.value)
        return resSuper as Result<ObjectType<P & SP>>
      }
    }
  }
  public toDTO(
    input: ObjectType<P & SP>,
    path: Path = [],
    validate: boolean = true
  ): Result<DtoObjectType<P & SP>> {
    if (validate) {
      const res = this.validate(input)
      if (isFailure(res)) {
        return failures(res.errors)
      }
    }
    let resSuper = this.superType.toDTO(input, path, validate)
    let res = super.toDTO(input, path, validate)
    if (isFailure(resSuper)) {
      if (isFailure(res)) {
        //  both failure
        Object.assign(resSuper.errors, res.errors)
      }

      return resSuper
    } else {
      if (isFailure(res)) {
        // only res failure
        return res
      } else {
        // both success
        Object.assign(resSuper.value, res.value)
        return resSuper as Result<DtoObjectType<P & SP>>
      }
    }
  }

  validateLinks(traversed: Map<Any, Any>): Result<boolean> {
    traversed.set(this, this)

    let mapOfAllProperties = this.allProperties
    let values = Array.from(mapOfAllProperties.values())

    let errors = []

    for (let i = 0; i < values.length; i++) {
      const t = values[i]

      if (traversed.has(t)) {
        continue
      }
      const res = t.validateLinks(traversed)

      if (isFailure(res)) {
        errors.push(...res.errors)
      }
    }

    return errors.length ? failures(errors) : success(true)
  }
}

const getSubtypeName = <U extends ObjectTypeC<any>>(superType: U): string => {
  return `subtype of ${superType.name})`
}

// @ts-ignore
export const subtype = <P extends Props, S extends Props>(
  superType: ObjectTypeC<S>,
  extraProps: P,
  name: string = getSubtypeName(superType),
  schema?: TypeSchema,
  superProps: S = superType['baseType']
): SubtypeC<P, S, ObjectTypeC<Props>> => {
  const obj: SubtypeC<P, S, ObjectTypeC<Props>> = new SubtypeC(
    name,
    extraProps,
    superType as ObjectTypeC<Props>
  ) // new ObjectTypeC<P>(name, props, identifier)
  if (schema) {
    schema.addType(obj)
  }
  return obj
}
