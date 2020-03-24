/*
 * Copyright (c) AelasticS 2020.
 */

import { SimpleTypeC } from './SimpleType'
import { Error, failure, Path, Result, success } from 'aelastics-result'

export class VoidTypeC extends SimpleTypeC<boolean> {
  public readonly _tag: 'Void' = 'Void'
  constructor() {
    super('Void')
  }

  public validate(value: any | undefined, path: Path = []): Result<boolean> {
    if (typeof value === 'undefined') {
      return this.checkValidators(value, path)
    } else {
      return failure(new Error(`Value ${path}: '${value}' is not void`))
      //  change the Error message
    }
  }
}

/**
 *  Void type
 */
export const voidType: VoidTypeC = new VoidTypeC()

// ??
voidType.addValidator({
  // change any to T?
  message: (value: any, label: string) => `Value ${label}="${value}" is not of type "${label}`,
  predicate: (value: any) => typeof value === 'undefined'
})

/*
export interface test {
    da1:number;
    a2:void
}
*/

// let a:test = {da1:5, a2:undefined}
