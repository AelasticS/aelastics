/*
 * Copyright (c) AelasticS 2019.
 *
 */

import {
  appendPath,
  Errors,
  failures,
  failureValidation,
  isFailure,
  success,
  validationError,
  Path,
  Result,
  Error,
  isSuccess,
  failure
} from 'aelastics-result'
import { ComplexTypeC } from './ComplexType'
import {
  Any,
  ConversionContext,
  ConversionOptions,
  DtoTypeOf,
  InstanceReference,
  TypeC,
  TypeOf
} from '../common/Type'
import { OptionalTypeC } from '../common/Optional'
import { TypeSchema } from '../common/TypeSchema'
import * as t from '../aelastics-types'

export interface Props {
  [key: string]: Any // TypeC<any>
}

export type ObjectType<P extends Props> = { [K in keyof P]: TypeOf<P[K]> }
export type DtoObjectType<P extends Props> = { [K in keyof P]: DtoTypeOf<P[K]> }
export type TypeOfKey<C extends ObjectTypeC<any, readonly string[]>> = C['ID']

const hasOwnProperty = Object.prototype.hasOwnProperty
export const isObject = (u: any) => u !== null && typeof u === 'object'

export const getNameFromProps = (props: Props): string =>
  `{ ${Object.keys(props)
    .map(k => `${k}: ${props[k].name}`)
    .join(', ')} }`

/**
 *  Object class with tree structure, i.e.  no cyclic references
 */
export class ObjectTypeC<P extends Props, I extends readonly string[]> extends ComplexTypeC<
  P,
  ObjectType<P>,
  DtoObjectType<P>
> {
  // https://stackoverflow.com/questions/55570729/how-to-limit-the-keys-of-an-object-to-the-strings-of-an-array-in-typescript
  // @ts-ignore
  public ID: { [k in I[number]]: TypeOf<P[k]> }
  // @ts-ignore
  public ID_DTO: { [k in I[number]]: DtoTypeOf<P[k]> }
  public readonly _tag: 'Object' = 'Object'
  public readonly keys = Object.keys(this.baseType)
  public readonly types = this.keys.map(key => this.baseType[key] as TypeC<any>)
  public readonly len = this.keys.length
  public readonly identifier: I
  public inverseCollection: Map<string, { prop: string; type: ObjectTypeC<any, []> }> = new Map<
    string,
    { prop: string; type: ObjectTypeC<any, []> }
  >()

  constructor(name: string, props: P, identifier: I) {
    super(name, props)
    this.identifier = identifier
    this.identifier.forEach(i => {
      if (!this.keys.includes(i)) {
        throw new Error(`Invalid identifier:${i} is not a property of object type ${name}`)
      }
    })
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

  /** @internal */
  toDTOCyclic(
    input: ObjectType<P>,
    path: Path,
    visitedNodes: Map<any, any>,
    errors: Error[],
    context: ConversionContext
  ): DtoObjectType<P> | InstanceReference {
    let output: DtoObjectType<P> = {} as DtoObjectType<P>
    try {
      let ref = this.handleGraph(input, path, visitedNodes, errors, context)
      if (ref) {
        return ref
      }
      for (let i = 0; i < this.len; i++) {
        const t = this.types[i]
        const k = this.keys[i]
        const ak = input[k]
        const conversion = t.toDTOCyclic(
          ak,
          appendPath(path, k, t.name, ak),
          visitedNodes,
          errors,
          context
        )
        ObjectTypeC.addProperty(output, k, conversion)
        // ((a as unknown) as any)[k] = conversion.value
      }
      return output
    } catch (e) {
      errors.push(
        validationError(`Catched exception '${(e as Error).message}'`, path, this.name, input)
      )
      return output
    }
  }

  private static addProperty(obj: Object, prop: string, value: any) {
    Object.defineProperty(obj, prop, {
      value: value,
      writable: true,
      enumerable: true,
      configurable: true
    })
  }

  validateLinks(traversed: Map<any, any>): Result<boolean> {
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

/**
 *
 * @param props
 * @param name
 * @param schema
 */
export const object = <P extends Props>(
  props: P,
  name: string = getNameFromProps(props),
  schema?: TypeSchema
): ObjectTypeC<P, []> => {
  const obj = new ObjectTypeC<P, []>(name, props, [])
  if (schema) {
    schema.addType(obj)
  }
  return obj
}

/**
 *
 * @param props
 * @param keys
 * @param name
 * @param schema
 */
export const entity = <P extends Props, I extends readonly string[]>(
  props: P,
  keys: I,
  name: string = getNameFromProps(props),
  schema?: TypeSchema
): ObjectTypeC<P, I> => {
  const obj = new ObjectTypeC<P, I>(name, props, keys)
  if (schema) {
    schema.addType(obj)
  }
  return obj
}

export const inverseProps = (
  firstType: ObjectTypeC<any, any>,
  firstProp: string,
  secondType: ObjectTypeC<any, any>,
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
