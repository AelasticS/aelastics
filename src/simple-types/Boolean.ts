/*
 * Copyright (c) AelasticS 2019.
 */

import { SimpleTypeC } from './SimpleType'

export class BooleanTypeC extends SimpleTypeC<boolean> {
  public readonly _tag: 'Boolean' = 'Boolean'
  constructor(name: string) {
    super(name)
  }
}

/**
 *  Boolean type
 */
// tslint:disable-next-line:variable-name
export const boolean: BooleanTypeC = new BooleanTypeC('boolean')

boolean.addValidator({
  message: (value:any, label:string) => `Value ${label}="${value}" is not of type "${name}`,
  predicate: (value:any) => typeof value === 'boolean'
})
