/*
 * Copyright (c) AelasticS 2019.
 */
import { TypeC } from '../Type'

/**
 *  Complex type: a structure which is derived from some type P
 */
export class ComplexTypeC extends TypeC {
  constructor(name, baseType) {
    super(name)
    this.baseType = baseType
  }
}

//# sourceMappingURL=ComplexType.js.map
