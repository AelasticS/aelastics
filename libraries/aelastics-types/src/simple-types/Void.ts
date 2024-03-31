/*
 * Copyright (c) AelasticS 2020.
 */

import { SimpleType } from './SimpleType'
import { TypeCategory } from '../type/TypeDefinisions'
import { System, TypeSchema } from '../type/TypeSchema'
import { Node } from '../common/Node'
/**
 *  Void type
 */
export class VoidType extends SimpleType<void, void, void> {
  constructor(name: string, typeCategory: TypeCategory, schema: TypeSchema) {
    super('Void', 'Void', System, {
      message: (value: any, label: string) => `${label}:'${value}' is not void.`,
      predicate: (value: any) => typeof value === 'undefined' || value === null
    })
  }

  init(n: Node): void {
  }
}
