/*
 * Copyright (c) AelasticS 2019.
 */



import { SimpleType } from './SimpleType'
import { System , TypeSchema } from '../type/TypeSchema'
import { TypeCategory } from '../type/TypeDefinisions'
import { Node } from '../common/Node'
export class NullType extends SimpleType<null, null, null> {

  constructor(name: string, typeCategory: TypeCategory, schema: TypeSchema) {
    super('Null', 'Null',System, {
      message: (value: any, label: string) => `${label}:'${value}' is not null.`,
      predicate: (value: any) => value === null
    })
  }

  init(n: Node): null {
    return null;
  }

}

