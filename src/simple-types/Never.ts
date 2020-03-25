import { Error, failure, Path, Result } from 'aelastics-result'
import { SimpleTypeC } from './SimpleType'

export class NeverTypeC extends SimpleTypeC<boolean> {
  public readonly _tag: 'Never' = 'Never'
  constructor() {
    super('Never')
  }

  public validate(value: any, path: Path = []): Result<boolean> {
    if (typeof value === 'function') {
      return this.checkValidators(value, path)
    } else {
      return failure(new Error(`Value ${path}: '${value}' must function that returns never`))
      //  change the Error message
    }
  }
}

/**
 *  Never type
 */
export const never: NeverTypeC = new NeverTypeC()

/*
nullType.addValidator({
  message: (value:any, label:string) => `Value ${label}="${value}" is not of type "${label}`,
  predicate: (value:any) => typeof value === 'null'
})
*/

/*
export interface test {
  da1:number;
  a2:never
}

let fun = function(){throw  new Error('some error')}

let a:test = {da1:5, a2:fun()}
*/
