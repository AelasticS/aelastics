/*
 * Copyright (c) AelasticS 2020.
 */

import { SimpleTypeC } from './SimpleType'

export class VoidTypeC extends SimpleTypeC<boolean> {
  public readonly _tag: 'Void' = 'Void'
  constructor() {
    super('Void')
  }
}

/*
export interface test {
    da1:number;
    a2:void
}
*/

// let a:test = {da1:5, a2:undefined}
