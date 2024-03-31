/*
 * Copyright (c) AelasticS 2019.
 */

import { SimpleType } from './SimpleType'
import {  TypeSchema } from '../type/TypeSchema'
import { TypeCategory } from '../type/TypeDefinisions'
import { Node } from '../common/Node'
export type LiteralValue = string | number | boolean

/**
 *  Literal TypeC
 */
export class LiteralType<V extends LiteralValue> extends SimpleType<V, any, any> {
  constructor(name: string, typeCategory: TypeCategory, schema: TypeSchema, readonly value: V) {
    super(name, 'Literal', schema, {
      message: (value, label) => `Value ${label}="${value}" is not of type "${name}`,
      predicate: (value) => value === this.value
    })
  }

  init(n: Node): V {
    return this.value;
  }

}


