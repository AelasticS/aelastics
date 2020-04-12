/*
 * Copyright (c) AelasticS 2019.
 *
 */

import { DtoObjectType, isObject, ObjectType, ObjectTypeC, Props } from './ObjectType'
import { Any, ConversionContext, TypeC } from '../common/Type'
import { TypeSchema } from '../common/TypeSchema'
import {
  appendPath,
  Errors,
  Failure,
  failures,
  failureValidation,
  isFailure,
  Path,
  Result,
  Success,
  success,
  validationError
} from 'aelastics-result'
import { OptionalTypeC } from '../common/Optional'
import { TypeInstancePair, VisitedNodes } from '../common/VisitedNodes'

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
