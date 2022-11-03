/*
 * Copyright (c) AelasticS 2020.
 */

import { SimpleType } from './SimpleType'
import { System } from '../type/TypeSchema'
import { Node } from '../common/Node'
export class UndefinedType extends SimpleType<undefined, undefined, undefined> {
  constructor() {
    super('Undefined', 'Undefined',System, {
      message: (value: any, label: string) => `${label}:'${value}' is not undefined.`,
      predicate: (value: any) => typeof value === 'undefined'
    })
  }

  init(n: Node): undefined {
    return undefined;
  }
}
