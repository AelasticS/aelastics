/*
 * Copyright (c) AelasticS 2019.
 */

import { SimpleTypeC } from './SimpleType'
import { Error, failure, success, Path, Result } from 'aelastics-result'

export type LiteralValue = string | number | boolean

/**
 *  Literal TypeC
 */
export class LiteralTypeC<V extends LiteralValue> extends SimpleTypeC<V> {
  public readonly _tag: 'Literal' = 'Literal'
  //   readonly _tag: 'LiteralTypeC' = 'LiteralTypeC';
  constructor(readonly value: V, name: string) {
    super(name)

    // this.addValidator({
    //     message: (value, label) => `Value ${label}="${value}" is not of type "${name}`,
    //     predicate: (value) => (JSON.stringify(value) === name)
    // });
  }

  validateCyclic(value: V, path: Path = [], traversed: Map<any, any>): Result<boolean> {
    return this.validate(value, path)
  }

  public validate(input: LiteralValue, path?: Path): Result<boolean> {
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
export const literal = <V extends LiteralValue>(value: V): LiteralTypeC<V> => {
  const name: string = JSON.stringify(value)
  return new LiteralTypeC(value, name)
}
