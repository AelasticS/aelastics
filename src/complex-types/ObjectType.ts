/*
 * Copyright (c) AelasticS 2019.
 *
 */

import {
  appendPath,
  Errors ,
  failures ,
  failureValidation ,
  isFailure ,
  success ,
  validationError ,
  Path ,
  Result
} from 'aelastics-result'
import { ComplexTypeC } from './ComplexType'
import { Any , DtoTypeOf , TypeC , TypeOf } from '../Type'
import { OptionalTypeC } from '../simple-types/Optional'
import { TypeSchema } from '../TypeSchema'

export interface Props {
  [key: string]: Any // TypeC<any>
}

export type ObjectType<P extends Props> = { [K in keyof P]: TypeOf<P[K]> }
export type DtoObjectType<P extends Props> = { [K in keyof P]: DtoTypeOf<P[K]> }

const hasOwnProperty = Object.prototype.hasOwnProperty
export const isObject = (u: any) => u !== null && typeof u === 'object'

export const getNameFromProps = (props: Props): string =>
  `{ ${Object.keys(props)
    .map(k => `${k}: ${props[k].name}`)
    .join(', ')} }`

/**
 *  Object class with tree structure, i.e.  no cyclic references
 */
export class ObjectTypeC<P extends Props> extends ComplexTypeC<P, ObjectType<P>, DtoObjectType<P>> {
  // { [K in keyof P]: TypeOf<P[K]> }> {
  public readonly _tag: 'Object' = 'Object'
  public readonly keys = Object.keys(this.baseType)
  public readonly types = this.keys.map(key => this.baseType[key] as TypeC<any>)
  public readonly len = this.keys.length
  public readonly identifier: Array<string> = []
  public inverseCollection: Map<string, { prop: string; type: ObjectTypeC<any> }> = new Map<
    string,
    { prop: string; type: ObjectTypeC<any> }
  >()

  constructor(name: string, props: P, identifier?: string | Array<string>) {
    super(name, props)
    if (identifier) {
      if (Array.isArray(identifier)) {
        this.identifier = Array.from(identifier)
      } else {
        this.identifier[0] = identifier
      }
      this.identifier.forEach(i => {
        if (!this.keys.includes(i)) {
          throw new Error(`Invalid identifier:${i} is not a property of obhect type ${name}`)
        }
      })
    }
  }

  // get all properties from class hierarchy - overridden properties are not included!
  get allProperties(): Map<string, TypeC<any>> {
    let mp = new Map<string, TypeC<any>>()
    this.keys.forEach(key => mp.set(key, this.baseType[key] as TypeC<any>))
    return mp
  }

  public defaultValue(): any {
    const obj = {}
    for (let i = 0; i < this.len; i++) {
      // @ts-ignore
      obj[this.keys[i]] =
        this.types[i] instanceof ObjectTypeC ? undefined : this.types[i].defaultValue()
      // obj[this.keys[i]] = this.types[i].defaultValue();
    }
    return obj
  }

  public validate(input: ObjectType<P>, path: Path = []): Result<boolean> {
    const result = isObject(input)
      ? success(input)
      : failureValidation('Value is not object', path, this.name, input)
    if (isFailure(result)) {
      return result
    }

    const errors: Errors = []
    for (let i = 0; i < this.len; i++) {
      const t = this.types[i]
      const k = this.keys[i]
      if (!hasOwnProperty.call(input, k) && !(t instanceof OptionalTypeC)) {
        errors.push(validationError('missing property', appendPath(path, k, t.name), this.name))
        continue
      }

      const ak = input[k]

      const validation = t.validate(ak, appendPath(path, k, t.name, ak))
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

  public fromDTO(input: DtoObjectType<P>, path: Path = []): Result<ObjectType<P>> {
    const result = isObject(input)
      ? success(input)
      : failureValidation('Value is not object', path, this.name, input)
    if (isFailure(result)) {
      return result
    }
    // const o = result.value;
    let a: ObjectType<P> = {} as ObjectType<P>

    const errors: Errors = []
    for (let i = 0; i < this.len; i++) {
      const t = this.types[i]
      const k = this.keys[i]
      if (!hasOwnProperty.call(input, k) && !(t instanceof OptionalTypeC)) {
        errors.push(validationError('missing property', appendPath(path, k, t.name), this.name))
        continue
      }

      const ak = input[k]

      const conversion = t.fromDTO(ak, appendPath(path, k, t.name, ak))
      if (isFailure(conversion)) {
        errors.push(...conversion.errors)
      } else {
        // const vak = conversion.value;
        // if (vak !== ak) {
        //
        //     if (a === o) { // make copy
        //         a = {...o}
        //     }
        //     a[k] = vak
        // }
        // Object.defineProperty(a, k,{value:conversion.value});
        ;((a as unknown) as any)[k] = conversion.value
      }
    }

    const res = this.checkValidators(a, path)
    if (isFailure(res)) {
      errors.push(...res.errors)
    }
    return errors.length ? failures(errors) : success(a)
  }
  // not sure if toDTO should do any validation
  public toDTO(
    input: ObjectType<P>,
    path: Path = [],
    validate: boolean = true
  ): Result<DtoObjectType<P>> {
    if (validate) {
      const res = this.validate(input)
      if (isFailure(res)) {
        return res
      }
    }
    let a: DtoObjectType<P> = {} as DtoObjectType<P>
    const errors: Errors = []
    for (let i = 0; i < this.len; i++) {
      const t = this.types[i]
      const k = this.keys[i]
      const ak = input[k]

      const conversion = t.toDTO(ak, appendPath(path, k, t.name, ak), validate)
      if (isFailure(conversion)) {
        errors.push(...conversion.errors)
      } else {
        // Object.defineProperty(a, k,{value:conversion.value});
        ;((a as unknown) as any)[k] = conversion.value
      }
    }

    return success(a)
  }

  validateLinks(traversed: Map<Any, Any>): Result<boolean> {
    traversed.set(this, this)

    let errors = []

    for (let i = 0; i < this.len; i++) {
      const t = this.types[i]

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

export const object = <P extends Props>(
  props: P,
  name: string = getNameFromProps(props),
  schema?: TypeSchema,
  identifier?: string | string[]
): ObjectTypeC<P> => {
  const obj = new ObjectTypeC<P>(name, props, identifier)
  if (schema) {
    schema.addType(obj)
  }
  return obj
}

export const inverseProps = (
  firstType: ObjectTypeC<any>,
  firstProp: string,
  secondType: ObjectTypeC<any>,
  secondProp: string
) => {
  // tslint:disable-next-line:no-constant-condition
  if (true) {
    // todo: Sinisa
    // check that props exist
    // check that props are object types or collections
    // check that prop already exist as an inverse, remove if true
    firstType.inverseCollection.set(firstProp, { prop: secondProp, type: secondType })
    secondType.inverseCollection.set(secondProp, { prop: firstProp, type: firstType })
  }
}
