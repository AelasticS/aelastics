/*
 * Copyright (c) AelasticS 2019.
 */
import { SimpleTypeC } from './SimpleType'

export class BooleanTypeC extends SimpleTypeC {
  constructor(name) {
    super(name)
    this._tag = 'Boolean'
  }
}

/**
 *  Boolean type
 */
// tslint:disable-next-line:variable-name
export const boolean = new BooleanTypeC('boolean')
boolean.addValidator({
  message: (value, label) => `Value ${label}="${value}" is not of type "${label}`,
  predicate: (value) => typeof value === 'boolean'
})
//# sourceMappingURL=Boolean.js.map
