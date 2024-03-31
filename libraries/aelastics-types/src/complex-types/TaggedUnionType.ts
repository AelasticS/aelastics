/*
 * Copyright (c) AelasticS 2019.
 *
 */

// export type TaggedProps<Tag extends string> = { [K in Tag]: LiteralTypeC<Tag> }

import { InterfaceDecl , ObjectType } from './ObjectType'
import { Any , DtoGraphTypeOf , DtoTreeTypeOf , TypeOf } from '../common/DefinitionAPI'
import { InstanceReference } from '../type/TypeDefinisions'
import { ComplexType } from './ComplexType'
import { ExtraInfo , RoleType } from '../type/Type'
import { DefaultSchema , TypeSchema } from '../type/TypeSchema'
import { ServiceError } from 'aelastics-result'
import { Node } from '../common/Node'

const findTypeFromDiscriminator = (d: string, t: InterfaceDecl): Any | undefined => {
  for (const key in t) {
    if (key === d) {
      return t[key]
    }
  }
  return undefined
}

type DtoTaggedUnionType<P extends InterfaceDecl> = {
  ref: InstanceReference
  taggedUnion?: DtoGraphTypeOf<P[keyof P]>
}

export class TaggedUnionType<P extends InterfaceDecl> extends ComplexType<
  TypeOf<P[keyof P]>,
  DtoTaggedUnionType<P>,
  DtoTreeTypeOf<P[keyof P]>
> {
  public readonly _tag: 'TaggedUnion' = 'TaggedUnion'
  public readonly keys = Object.keys(this.elements)

  constructor(name: string, readonly discriminator: string , readonly elements: P, schema:TypeSchema) {
    super(name , 'TaggedUnion', schema)
  }

  addChild(parent: any , child: any , n: Node): void {
  }

  *children(value: TypeOf<P[keyof P]> , n: Node): Generator<[TypeOf<P[keyof P]> , Any , ExtraInfo]> {
    const discrValue = value[this.discriminator]
    if (!discrValue) {
      throw new ServiceError(
        'ValidationError' ,
        `Value: '${value}' is not a proper union, no discriminator property: '${this.discriminator}'`
      )
    } else {
      const type = findTypeFromDiscriminator(discrValue , this.elements)
      if (!type) {
        throw new ServiceError(
          'ValidationError' ,
          `Value '${value}' - there is no type in tagged union named: '${discrValue}'`
        )
      } else {
        // ToDo consider what extra info is needed
        yield [value, type , { role: 'asElementOfTaggedUnion' /* , propName: */ }]
      }
    }
  }

  init(n: Node): TypeOf<P[keyof P]> {
    return { } as any;
  }

}





