/*
 * Copyright (c) AelasticS 2019.
 */

import { SimpleTypeC } from './SimpleType'
import { Error, failure, Path, Result } from 'aelastics-result'

export class NullTypeC extends SimpleTypeC<boolean> {
  public readonly _tag: 'Null' = 'Null'
  constructor() {
    super('Null')
  }

  public validate(value: any, path: Path = []): Result<boolean> {
    if (value === null) {
      return this.checkValidators(value, path)
    } else {
      return failure(new Error(`Value ${path}: '${value}' must be null`))
      //  change the Error message
    }
  }
}

/**
 *  Null type
 */

export const nullType: NullTypeC = new NullTypeC()

/*
nullType.addValidator({
  message: (value:any, label:string) => `Value ${label}="${value}" is not of type "${label}`,
  predicate: (value:any) => typeof value === 'null'
})
*/

// export interface test {
//     da1:number;
//     a2:null
// }
//
//
//  let a:test = {da1:5, a2:null}
