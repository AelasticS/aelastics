/*
 * Copyright (c) AelasticS 2019.
 */

import { ExtraInfo , Type } from '../type/Type'
import { Any, DtoGraphTypeOf, TypeOf } from '../common/DefinitionAPI'
import { Node } from '../common/Node'
import { TypeSchema } from '../type/TypeSchema'
import { ITransformer , WhatToDo } from '../transducers/Transformer'

const getOptionalName = (base: Any): string => `optional ${base.name}`

export class OptionalType<T extends Any> extends Type<
  TypeOf<T> | undefined,
  DtoGraphTypeOf<T> | undefined,
  TypeOf<T>
> {
  public readonly _tag: 'Optional' = 'Optional'
  public readonly base: T

  public constructor(base: T, name: string = getOptionalName(base), ownerSchema:TypeSchema) {
    super(name, 'Optional', ownerSchema)
    this.base = base
  }

  isSimple(): boolean {
    return this.base.isSimple()
  }

  init(n: Node): TypeOf<T> | undefined {
    if (n.instance === undefined) return undefined
    else {
      let childNode = new Node(n.instance, this, n.acc, n.extra, n)
      return this.base.init(childNode)
    }
  }

  addChild(parent: any, child: any, n: Node): void {
    if (n.instance !== undefined) {
      n.extra.optional = true
      n.type.addChild(parent, child, n)
    }
  }

  *children(
    input: TypeOf<T> | undefined,
    n: Node
  ): Generator<[TypeOf<T> | undefined, Any, ExtraInfo]> {
    return this.base.children(input, n)
  }

  doTransformation<A>(
    t: ITransformer,
    input: Node | TypeOf<T> | undefined,
    initObj: A | undefined,
    resetAcc: boolean | undefined,
    typeLevel:boolean = false
  ): [A, WhatToDo] {
    let n = Node.makeNode(input, this, initObj)
    if (n.instance !== undefined) {
      n.type = this.base // bypass optional
      n.extra.optional = true
      return this.base.doTransformation(t, input, initObj, resetAcc, typeLevel)
    }
    if (resetAcc) return [undefined as any, "continue"]
    else return [initObj as any, 'continue']
  }
}
