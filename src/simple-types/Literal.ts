/*
 * Copyright (c) AelasticS 2019.
 */

import { SimpleTypeC } from './SimpleType'
import { Error, failure, success, Path, Result, pathToString } from 'aelastics-result'
import { VisitedNodes } from '../common/VisitedNodes'

export type LiteralValue = string | number | boolean

/**
 *  Literal TypeC
 */
export class LiteralTypeC<V extends LiteralValue> extends SimpleTypeC<V, any, any> {
  public readonly _tag: 'Literal' = 'Literal'

  //   readonly _tag: 'LiteralTypeC' = 'LiteralTypeC';
  constructor(readonly value: V, name: string) {
    super(name)

    // this.addValidator({
    //     message: (value, label) => `Value ${label}="${value}" is not of type "${name}`,
    //     predicate: (value) => (JSON.stringify(value) === name)
    // });
  }

  validateCyclic(input: any, path: Path = [], traversed: VisitedNodes): Result<boolean> {
    if (input === this.value) {
      return success(true)
    }
    return failure(
      new Error(`Value '${input}' at path:'${pathToString(path)}' is not valid Literal type`)
    )
  }

  public validate(input: any): Result<boolean> {
    if (input === this.value) {
      return success(true)
    }
    return failure(new Error(`Value ${input}' is not valid Literal type`))
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
