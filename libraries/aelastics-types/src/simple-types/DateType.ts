/*
 * Copyright (c) AelasticS 2019.
 */

import { SimpleType } from './SimpleType'
import { TypeCategory } from '../type/TypeDefinisions'
import { TypeSchema } from '../type/TypeSchema'
import { Node } from '../common/Node'

export class DateType extends SimpleType<Date, string, string> {
  public readonly _tag: 'Date' = 'Date'

  constructor(name: string, typeCategory: TypeCategory, schema: TypeSchema) {

    super(name, "Date",schema, {
      message: (value: any, label: string) => `${label}: "${value}" is not valid date type.`,
      predicate: (value: any) => value instanceof Date && !isNaN(value.getTime()),
    })
  }

  init(n: Node): Date {
    return new Date();
  }

}

