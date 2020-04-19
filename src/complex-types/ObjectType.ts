/*
 * Copyright (c) AelasticS 2019.
 *
 */

import {
  appendPath,
  failures,
  failureValidation,
  isFailure,
  Path,
  pathToString,
  Result,
  success,
  validationError,
  ValidationError
} from 'aelastics-result'
import { ComplexTypeC } from './ComplexType'
import {
  Any,
  DtoTreeTypeOf,
  DtoTypeOf,
  FromDtoContext,
  InstanceReference,
  ToDtoContext,
  TypeC,
  TypeOf
} from '../common/Type'
import { OptionalTypeC } from '../common/Optional'
import { TypeSchema } from '../common/TypeSchema'
import { ArrayTypeC } from './Array'
import { MapTypeC } from './Map'
import { TypeInstancePair, VisitedNodes } from '../common/VisitedNodes'
import { LinkC } from '../common/LinkC'
import { SimpleTypeC } from '../simple-types/SimpleType'
import { TraversalContext, TraversalFunc } from '../common/TraversalContext'

export interface Props {
  [key: string]: Any // TypeC<any>
}

export type ObjectType<P extends Props> = { [K in keyof P]: TypeOf<P[K]> }
export type DtoProps<P extends Props> = { [K in keyof P]: DtoTypeOf<P[K]> }

export type DtoObjectType<P extends Props> = {
  ref: InstanceReference
  object?: DtoProps<P>
  // object: DtoProps<P>
}

export const isObject = (u: any) => u !== null && typeof u === 'object'

export const getNameFromProps = (props: Props): string =>
  `{ ${Object.keys(props)
    .map(k => `${k}: ${props[k].name}`)
    .join(', ')} }`

/**
 *
 */
export class ObjectTypeC<P extends Props, I extends readonly string[]> extends ComplexTypeC<
  P,
  ObjectType<P>,
  DtoObjectType<P>,
  DtoProps<P>
> {
  public ID!: { [k in I[number]]: TypeOf<P[k]> }
  public ID_DTO!: { [k in I[number]]: DtoTypeOf<P[k]> }
  public ID_DTO_TREE!: { [k in I[number]]: DtoTreeTypeOf<P[k]> }
  public readonly _tag: 'Object' = 'Object'
  public readonly _keys = Object.keys(this.baseType)
  public readonly _types = this._keys.map(key => this.baseType[key] as TypeC<any>)
  public readonly _len = this._keys.length
  public readonly identifier: I
  public inverseCollection: Map<string, { prop: string; type: ObjectTypeC<any, []> }> = new Map<
    string,
    { prop: string; type: ObjectTypeC<any, []> }
  >()

  constructor(name: string, props: P, identifier: I) {
    super(name, props)
    this.identifier = identifier
    this.identifier.forEach(i => {
      if (!this._keys.includes(i)) {
        throw new Error(`Invalid identifier:${i} is not a property of object type ${name}`)
      }
    })
  }

  // get all properties from class hierarchy - overridden properties are not included!
  get allProperties(): Map<string, TypeC<any>> {
    let mp = new Map<string, TypeC<any>>()
    this._keys.forEach(key => mp.set(key, this.baseType[key] as TypeC<any>))
    return mp
  }

  /** @internal */
  public static addProperty(obj: Object, prop: string, value: any) {
    Object.defineProperty(obj, prop, {
      value: value,
      writable: true,
      enumerable: true,
      configurable: true
    })
  }

  public getPropsInfo(): [string[], TypeC<any, any, any>[], number] {
    return [this._keys, this._types, this._len]
  }

  public defaultValue(): any {
    const obj = {}
    // ToDo correct subtype
    /*    if (context.options.includeTypeInfo) {
      ObjectTypeC.addProperty(output, context.options.typeInfoPropName, this.name)
    }*/
    let [keys, types, len] = this.getPropsInfo()
    for (let i = 0; i < len; i++) {
      // @ts-ignore
      obj[keys[i]] =
        types[i] instanceof ObjectTypeC
          ? undefined // default object property is undefined
          : types[i].defaultValue()
      // obj[this.keys[i]] = this.types[i].defaultValue();
    }
    return obj
  }

  validateCyclic(
    input: ObjectType<P>,
    path: Path = [],
    traversed: VisitedNodes<Any, any, any>
  ): Result<boolean> {
    const result = isObject(input)
      ? success(input)
      : failureValidation('Value is not object', path, this.name, input)
    if (isFailure(result)) {
      return result
    }
    let pair: TypeInstancePair<Any, any> = [this, input]

    if (traversed.has(pair)) {
      return success(true)
    } else {
      traversed.set(pair, input)
    }

    let [keys, types, len] = this.getPropsInfo()
    const errors: ValidationError[] = []
    for (let i = 0; i < len; i++) {
      const t = types[i]
      const k = keys[i]
      if (!Object.prototype.hasOwnProperty.call(input, k) && !(t instanceof OptionalTypeC)) {
        errors.push(validationError('missing property', appendPath(path, k, t.name), this.name))
        continue
      }
      const ak = input[k]
      const validation = t.validateCyclic(ak, appendPath(path, k, t.name, ak), traversed)
      if (isFailure(validation)) {
        errors.push(...(validation.errors as ValidationError[]))
      }
    }
    const res = this.checkValidators(input, path)
    if (isFailure(res)) {
      errors.push(...(res.errors as ValidationError[]))
    }
    return errors.length ? failures(errors) : success(true)
  }

  makeDTOInstance(
    input: ObjectType<P>,
    ref: InstanceReference,
    path: Path,
    context: ToDtoContext
  ): DtoProps<P> {
    try {
      //      let output: DtoProps<P> | DtoObjectType<P>
      let outObject: DtoProps<P> = {} as DtoProps<P>
      // ToDo save correct subtype in Ref,
      if (ref && context.options.includeTypeInfo) {
        ref.specificTypeName = input[context.options.typeInfoPropName]
      }
      let [keys, types, len] = this.getPropsInfo()
      for (let i = 0; i < len; i++) {
        const t = types[i]
        const k = keys[i]
        const ak = input[k]
        const conversion = t.toDTOCyclic(ak, appendPath(path, k, t.name, ak), context)
        ObjectTypeC.addProperty(outObject, k, conversion)
      }
      return outObject
    } catch (e) {
      context.errors.push(
        validationError(`Caught exception '${(e as Error).message}'`, path, this.name, input)
      )
      return {} as DtoProps<P>
    }
  }

  makeEmptyInstance(
    value: DtoProps<P> | DtoObjectType<P>,
    path: Path,
    context: FromDtoContext
  ): ObjectType<P> {
    return {} as any
  }

  makeInstanceFromDTO(
    input: DtoProps<P>,
    output: ObjectType<P>,
    path: Path,
    context: FromDtoContext
  ) {
    /*    if (!context.options.isTreeDTO) {
          let ref = this.getRefFromNode(input)
          output = this.retrieveRefFromVisited<number, any>(ref.id, context.visitedNodes!) // {} as ObjectType<P>
        } else {
          output = this.makeEmptyInstance(input, path, context) // empty
        }*/
    if (!isObject(input)) {
      context.errors.push(
        validationError(
          `Value ${pathToString(path)} is not Object: '${input}'`,
          path,
          this.name,
          input
        )
      )
      return output
    }
    if (context.options.includeTypeInfo) {
      // ToDo correct subtype, determine correct subtype, add schema to context or to TypeC
      let typeName = input[context.options.typeInfoPropName]
      ObjectTypeC.addProperty(output, context.options.typeInfoPropName, this.name)
      if (typeName !== this.name) {
        context.errors.push(
          validationError(
            `Types are not matching: input type is '${input.ref.typeName}' and expected type is '${this.name}'. A possible subtype cannot be handled!`,
            path,
            this.name,
            input
          )
        )
        return output // empty
      }
    }

    let [keys, types, len] = this.getPropsInfo()
    for (let i = 0; i < len; i++) {
      const t = types[i]
      const k = keys[i]
      if (!Object.prototype.hasOwnProperty.call(input, k) && !(t instanceof OptionalTypeC)) {
        context.errors.push(
          validationError('missing property', appendPath(path, k, t.name), this.name)
        )
        continue
      }
      const ak = input[k]
      // @ts-ignore
      const conversion = t.fromDTOCyclic(ak, appendPath(path, k, t.name, ak), context)
      ObjectTypeC.addProperty(output, k, conversion)
    }
    return output
  }

  validateLinks(traversed: Map<any, any>): Result<boolean> {
    traversed.set(this, this)
    let errors = []
    let [keys, types, len] = this.getPropsInfo()
    for (let i = 0; i < len; i++) {
      const t = types[i]
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

  protected isObjRef(input: any): input is DtoObjectType<P> {
    if (input.ref && input.object) {
      return true
    }
    return false
  }

  protected traverseChildren<R>(
    value: ObjectType<P>,
    f: <R>(type: Any, value: any, c: TraversalContext) => R,
    context: TraversalContext
  ): void {
    let [keys, types, len] = this.getPropsInfo()
    for (let i = 0; i < len; i++) {
      const t = types[i]
      const k = keys[i]
      if (!Object.prototype.hasOwnProperty.call(value, k) && !(t instanceof OptionalTypeC)) {
        continue
      }
      const ak = value[k]
      f(this, ak, context)
      if (t instanceof SimpleTypeC && context.skipSimpleTypes) {
        continue
      } else {
        t.traverseCyclic(ak, f, context)
      }
    }
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

function findBaseType(fp: Any, type: ObjectTypeC<any, any>, prop: string): ObjectTypeC<any, any> {
  // handle link types
  if (fp instanceof LinkC) {
    let linkedType = fp.resolveType()
    if (linkedType === undefined) {
      throw new Error(`Property '${prop}' on type '${type.name}' is not a valid link.`)
    } else {
      return findBaseType(linkedType, type, prop)
    }
  }
  // handle optional types
  if (fp instanceof OptionalTypeC) {
    return findBaseType(fp.base, type, prop)
  }

  // handle collections
  if (fp instanceof ArrayTypeC || fp instanceof MapTypeC) {
    fp = fp.baseType
    return findBaseType(fp, type, prop)
  }

  // check that props are object types
  if (!(fp instanceof ObjectTypeC)) {
    throw new Error(`Property '${prop}' on type '${type.name}' not object or entity type.`)
  }
  return fp
}

/**
 *
 * @param firstType
 * @param firstProp
 * @param secondType
 * @param secondProp
 */
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
    let fp = firstType.baseType[firstProp] as TypeC<any>
    if (!fp) {
      throw new Error(`Property '${firstProp}' on type '${firstType.name}' does not extist.`)
    }
    let sp = secondType.baseType[secondProp] as TypeC<any>
    if (!sp) {
      throw new Error(`Property '${secondProp}' on type '${secondType.name}' does not extist.`)
    }

    fp = findBaseType(fp, firstType, firstProp)
    sp = findBaseType(sp, secondType, secondProp)
    // check that props are correct inverse
    if (fp !== secondType) {
      throw new Error(
        `Property '${firstProp}' on type '${firstType.name}' is not referencing '${secondType.name}' type.`
      )
      return
    }
    if (sp !== firstType) {
      throw new Error(
        `Property '${secondProp}' on type '${secondType.name}' is not referencing '${firstType.name}' type.`
      )
      return
    }
    // check that prop already exist as an inverse
    for (let e of firstType.inverseCollection.values()) {
      if (e.prop === secondProp && e.type === secondType) {
        throw new Error(
          `Property '${secondProp}' of type '${secondType.name}' is already inverse in '${firstType.name}' type.`
        )
        return
      }
    }
    for (let e of secondType.inverseCollection.values()) {
      if (e.prop === firstProp && e.type === firstType) {
        throw new Error(
          `Property '${firstProp}' of type '${firstType.name}' is already inverse in '${secondType.name}' type.`
        )
        return
      }
    }
    firstType.inverseCollection.set(firstProp, { prop: secondProp, type: secondType })
    secondType.inverseCollection.set(secondProp, { prop: firstProp, type: firstType })
  }
}
