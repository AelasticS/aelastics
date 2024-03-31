/*
 * Copyright (c) AelasticS 2020.
 */

import { SimpleType } from './SimpleType'
import {  TypeSchema } from '../type/TypeSchema'
import { TypeCategory } from '../type/TypeDefinisions'
import { Node } from '../common/Node'
export class BooleanType extends SimpleType<boolean, boolean, boolean> {
  constructor(name: string, typeCategory: TypeCategory, schema: TypeSchema) {
    super(name, 'Boolean', schema, {
      message: (value: any, label: string) => `${label}:"${value}" is not boolean.`,
      predicate: (value: any) => typeof value === 'boolean',
    })
  }


  init(n: Node): boolean {
    return true;
  }
}
