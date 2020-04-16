/*
 * Copyright (c) AelasticS 2019.
 */

import { SimpleTypeC } from './SimpleType'
import { number } from './Number'

export class BooleanTypeC extends SimpleTypeC<boolean> {
  public readonly _tag: 'Boolean' = 'Boolean'

  constructor(name: string) {
    super(name)
  }

  defaultValue(): boolean {
    return true
  }
}

/**
 *  Boolean type
 */
// tslint:disable-next-line:variable-name
export const boolean: BooleanTypeC = new BooleanTypeC('boolean')

boolean.addValidator({
  message: (value: any, label: string) => `Value ${label}="${value}" is not of type "${label}`,
  predicate: (value: any) => typeof value === 'boolean'
})
boolean.systemType = true
