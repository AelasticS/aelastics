/*
 * Copyright (c) AelasticS 2019.
 *
 */

import { Any, TypeOf } from '../common/DefinitionAPI'
import { TypeSchema } from '../type/TypeSchema'
import { ServiceError } from 'aelastics-result'
import { ExtraInfo, Type } from '../type/Type'
import { Node } from '../common/Node'
import { ITransformer , WhatToDo } from '../transducers/Transformer'

export class LinkType extends Type<any, any, any> {
  public readonly LinkSchema: TypeSchema
  public readonly path: string
  private _resolvedType: Any | undefined = undefined

  constructor(name: string, LinkSchema: TypeSchema, path: string, ownerSchema:TypeSchema) {
    super(name, 'Link', ownerSchema)
    this.LinkSchema = LinkSchema
    this.path = path
    LinkSchema.addLink(this)
  }

  isSimple(): boolean {
    return this.getResolvedTypeOrThrowError().isSimple()
  }

  public isResolved(): boolean {
    return this._resolvedType !== undefined
  }

  public resolveType(): Any | undefined {
    this._resolvedType = this.LinkSchema.getType(this.path)
    return this._resolvedType
  }

  public getResolvedTypeOrThrowError(): Any {
    if (this._resolvedType === undefined) {
      this._resolvedType = this.LinkSchema.getType(this.path)
      if (this._resolvedType === undefined) {
        throw new ServiceError(
          'ValidationError',
          `Link '${this.fullPathName}' is not resolved. Validate schema ${this.ownerSchema.absolutePathName} first.'`
        )
      }
    }
    return this._resolvedType
  }

  *children(i: any, n: Node): Generator<[any, Any, ExtraInfo]> {
    return this.getResolvedTypeOrThrowError().children(i, n)
  }

  init(n: Node): any {
    return this.getResolvedTypeOrThrowError().init(n)
  }

  addChild(parent: any, child: any, n: Node): void {
    return this.getResolvedTypeOrThrowError().addChild(parent, child, n)
  }

  doTransformation<A>(
    t: ITransformer,
    input: Node | any,
    initObj: A | undefined,
    resetAcc: boolean | undefined
  ): [A, WhatToDo] {
    const type = this.getResolvedTypeOrThrowError()
    const n = Node.makeNode(input, this, initObj)
    n.type = type // bypass link
    return type.doTransformation(t, n, initObj, resetAcc)
  }
}
