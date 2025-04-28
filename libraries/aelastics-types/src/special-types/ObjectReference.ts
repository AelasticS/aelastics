/*
 * Copyright (c) AelasticS 2020.
 *
 */

import { ComplexType } from "../complex-types/ComplexType"
import { ObjectType } from "../complex-types/ObjectType"
import { InstanceReference } from "../type/TypeDefinisions"
import { Any } from "../common/DefinitionAPI"
import { ExtraInfo } from "../type/Type"
import { TypeSchema } from "../type/TypeSchema"
import { Node } from "../common/Node"

// You can use const assertion (added in typescript 3.4)
// https://stackoverflow.com/questions/55570729/how-to-limit-the-keys-of-an-object-to-the-strings-of-an-array-in-typescript
// https://www.typescriptlang.org/docs/handbook/utility-types.html

export type TypeOfKey<C extends ObjectType<any, readonly string[]>> = C["ID"]
export type DtoTypeOfKey<C extends ObjectType<any, readonly string[]>> = C["ID_DTO"]

export type DtoObjectReference<T extends ObjectType<any, readonly string[]>> = {
  ref: InstanceReference
  reference: DtoTypeOfKey<T>
}

export class ObjectReference<T extends ObjectType<any, readonly string[]>> extends ComplexType<
  TypeOfKey<T>,
  DtoObjectReference<T>,
  DtoTypeOfKey<T>
> {
  public readonly referencedType: T
  public readonly _tag: "Reference" = "Reference"

  constructor(name: string, obj: T, schema: TypeSchema) {
    super(name, "Reference", schema)
    this.referencedType = obj
  }

  addChild(parent: any, child: any, n: Node): void {
    if (n.extra.propName !== undefined && parent) parent[n.extra.propName] = child
  }

  * children(value: TypeOfKey<T>, n: Node): Generator<[TypeOfKey<T>, Any, ExtraInfo]> {
    // TODO: Fix EntityReference identifier
    const identifier = this.referencedType.identifier
    for (let i = 0; i < identifier.length; i++) {
      const k = identifier[i]
      const ak = value[k]
      const t = this.referencedType.interfaceDecl[k] as Any
      yield [ak, t, { role: "asIdentifierPart", propName: k }]
    }
  }

  init(n: Node): TypeOfKey<T> {
    return {} as any
  }


}


