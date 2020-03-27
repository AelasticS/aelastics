import { Error, failure, Path, Result, validationError } from 'aelastics-result'
import { SimpleTypeC } from './SimpleType'

export class NeverTypeC extends SimpleTypeC<boolean> {
  public readonly _tag: 'Never' = 'Never'
  constructor() {
    super('Never')
  }

  public validate(value: any, path: Path = []): Result<boolean> {
    return failure(validationError('Never can never occures', path, this.name))
  }
}

/**
 *  Never type
 */
export const never: NeverTypeC = new NeverTypeC()
