/*
 * Copyright (c) AelasticS 2019.
 */
import { TypeC } from '../Type'
import { success } from 'aelastics-result'

export class SimpleTypeC extends TypeC {
  //    public readonly _tagSimple: 'Simple' = 'Simple';
  constructor(name) {
    super(name)
  }

  validateLinks(traversed) {
    return success(true)
  }
}

//# sourceMappingURL=SimpleType.js.map
