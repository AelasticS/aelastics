import { Error, failure, Path, Result, validationError } from 'aelastics-result'
import { SimpleTypeC } from './SimpleType'

export class NeverTypeC extends SimpleTypeC<boolean> {
  public readonly _tag: 'Never' = 'Never'
  constructor() {
    super('Never')
  }

  validateCyclic(value: any, path: Path = [], traversed: Map<any, any>): Result<boolean> {
    return this.validate(value, path)
  }

  public validate(value: any, path: Path = []): Result<boolean> {
    return failure(validationError('Never can never occurs', path, this.name))
  }
}

/**
 *  Never type
 */
export const never: NeverTypeC = new NeverTypeC()
