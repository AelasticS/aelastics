/*
 * Copyright (c) AelasticS 2019.
 *
 */

import { ObjectType, InterfaceDecl } from './ObjectType'
import { TypeSchema } from '../type/TypeSchema'
import { Any } from '../common/DefinitionAPI'
import { TypeCategory } from '../type/TypeDefinisions'
import { Type } from '../type/Type'

export class Subtype<
  P extends InterfaceDecl,
  SP extends InterfaceDecl,
  S extends ObjectType<InterfaceDecl, any>
> extends ObjectType<P & SP, S['identifier']> {
  //    public readonly _tag: 'Subtype' = 'Subtype';
  public readonly superType: ObjectType<InterfaceDecl, S['identifier']>
      public readonly  extraProps!:P;
      public readonly  superProps!:SP;
  //    protected readonly superInstance: ObjectType<P & SP>;

  constructor(
    name: string,
    baseType: P,
    superType: ObjectType<InterfaceDecl, S['identifier']>,
    schema: TypeSchema
  ) {
    super(name, baseType as P & SP, [], schema)
    this.superType = superType
  }

  get identifier(): S['identifier'] {
    return this.superType.identifier
  }

  public isOfType(t: Type<any, any, any>): boolean {
      if (super.isOfType(t))
        return true
      else 
        return this.superType.isOfType(t)
  }
  // get all properties from class hierarchy - overridden properties are not included!
  get allProperties(): Map<string, Any> {
    let mp = this.superType.allProperties
    this.keys.forEach((key) => {
      mp.set(key, this.interfaceDecl[key] as Any)
    })
    return mp
  }

  public getPropsInfo(): [string[], Any[], number] {
    let mapOfAllProperties = this.allProperties
    let keys = Array.from(mapOfAllProperties.keys())
    let types = Array.from(mapOfAllProperties.values())
    return [keys, types, keys.length]
  }

  get allInverse(): Map<
    string,
    { propName: string; propType: TypeCategory; type: ObjectType<any, []> }
  > {
    let mp = this.superType.allInverse
    this.inverseCollection.forEach((value, key) => {
      mp.set(key, value)
    })
    return mp
  }
}
