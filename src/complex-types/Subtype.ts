/*
 * Copyright (c) AelasticS 2019.
 *
 */

import { ObjectTypeC, Props } from './ObjectType'
import { TypeC } from '../common/Type'
import { TypeSchema } from '../common/TypeSchema'

export class SubtypeC<
  P extends Props,
  SP extends Props,
  S extends ObjectTypeC<Props, any>
> extends ObjectTypeC<P & SP, S['identifier']> {
  //    public readonly _tag: 'Subtype' = 'Subtype';
  public readonly superType: ObjectTypeC<Props, S['identifier']>
  //    public readonly  extraProps:P;
  //    public readonly  superProps:SP;
  //    protected readonly superInstance: ObjectTypeC<P & SP>;

  constructor(name: string, baseType: P, superType: ObjectTypeC<Props, S['identifier']>) {
    super(name, baseType as P & SP, [])
    this.superType = superType
  }

  // get all properties from class hierarchy - overridden properties are not included!
  get allProperties(): Map<string, TypeC<any>> {
    let mp = this.superType.allProperties
    this._keys.forEach(key => {
      mp.set(key, this.baseType[key] as TypeC<any>)
    })
    return mp
  }

  public getPropsInfo(): [string[], TypeC<any, any, any>[], number] {
    let mapOfAllProperties = this.allProperties
    let keys = Array.from(mapOfAllProperties.keys())
    let types = Array.from(mapOfAllProperties.values())
    return [keys, types, keys.length]
  }

  /*  public defaultValue(): any {
      return Object.assign(this.superType.defaultValue(), super.defaultValue())
    }*/
  /*
    public validate(input: ObjectType<P & SP>, path: Path = []): Result<boolean> {
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
          const validation = t.validate(ak, appendPath(path, k, t.name, ak))
          if (isFailure(validation)) {
            errors.push(...validation.errors)
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
      const res = this.checkValidators(input, path)
      if (isFailure(res)) {
        errors.push(...res.errors)
      }
      return errors.length ? failures(errors) : success(true)
    }*/

  /*
  toDTOCyclic(
    input: ObjectType<P & SP>,
    path: Path,
    visitedNodes: Map<any, any>,
    errors: Error[],
    context: ConversionContext
  ): DtoObjectType<P & SP> {
    let ref = this.serialize(input, path, visitedNodes, errors, context)
    if (ref) {
      return ref
    }
    let res = super.toDTOCyclic(input, path, visitedNodes, errors, context)
    let resSuper = this.superType.toDTOCyclic(input, path, visitedNodes, errors, context)
    Object.assign(res, resSuper)
    return res as DtoObjectType<P & SP>
  }
*/

  /*  validateLinks(traversed: Map<Any, Any>): Result<boolean> {
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
    }*/
}

const getSubtypeName = <U extends ObjectTypeC<any, any>>(superType: U): string => {
  return `subtype of ${superType.name})`
}

// @ts-ignore
export const subtype = <P extends Props, S extends Props, I extends readonly string[]>(
  superType: ObjectTypeC<S, I>,
  extraProps: P,
  name: string = getSubtypeName(superType),
  schema?: TypeSchema,
  superProps: S = superType['baseType']
): SubtypeC<P, S, ObjectTypeC<Props, I>> => {
  const obj: SubtypeC<P, S, ObjectTypeC<Props, I>> = new SubtypeC(
    name,
    extraProps,
    superType as ObjectTypeC<Props, I>
  ) // new ObjectTypeC<P>(name, props, identifier)
  if (schema) {
    schema.addType(obj)
  }
  return obj
}
