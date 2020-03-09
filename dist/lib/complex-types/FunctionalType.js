/*
 * Copyright (c) AelasticS 2019.
 *
 */
import { TypeC } from '../Type'
import { failures, isFailure, success } from 'aelastics-result'

export class FunctionalTypeC extends TypeC {
  constructor(name, args, returns) {
    super(name)
    this.args = args
    this.returns = returns
  }

  validateLinks(traversed) {
    traversed.set(this, this)
    let errors = []
    for (let [key, value] of Object.entries(this.args)) {
      if (!traversed.has(value)) {
        let res = value.validateLinks(traversed)
        if (isFailure(res)) {
          errors.push(...res.errors)
          errors.push(new Error(`Argument '${key}' of function '${this.name}' has no valid link. `))
        }
      }
    }
    if (!traversed.has(this.returns)) {
      let res = this.returns.validateLinks(traversed)
      if (isFailure(res)) {
        errors.push(...res.errors)
      }
      errors.push(new Error(`Return type '${this.returns.name}' of function '${this.name}' has no valid link. `))
    }
    return errors.length ? failures(errors) : success(true)
  }
}

export const fun = (name, args, returns) => new FunctionalTypeC(name, args, returns)
export const returnType = (f) => f.returns
export const argsType = (f) => f.args
//# sourceMappingURL=FunctionalType.js.map
