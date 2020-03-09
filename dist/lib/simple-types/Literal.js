/*
 * Copyright (c) AelasticS 2019.
 */
import { SimpleTypeC } from './SimpleType'
import { Error, failure, success } from 'aelastics-result'

/**
 *  Literal TypeC
 */
export class LiteralTypeC extends SimpleTypeC {
  //   readonly _tag: 'LiteralTypeC' = 'LiteralTypeC';
  constructor(value, name) {
    super(name)
    this.value = value
    this._tag = 'Literal'
    // this.addValidator({
    //     message: (value, label) => `Value ${label}="${value}" is not of type "${name}`,
    //     predicate: (value) => (JSON.stringify(value) === name)
    // });
  }

  validate(input, path) {
    if (input === this.value) {
      return success(true)
    }
    return failure(new Error(`Value ${path}: '${input}' is not valid Literal type`))
  }
}

/**
 * Literal type
 * @param value
 */
export const literal = (value) => {
  const name = JSON.stringify(value)
  return new LiteralTypeC(value, name)
}
//# sourceMappingURL=Literal.js.map
