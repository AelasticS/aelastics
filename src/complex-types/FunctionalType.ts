/*
 * Copyright (c) AelasticS 2019.
 *
 */

import { Any, DtoTypeOf, TypeC, TypeOf } from '../Type'
import { DtoObjectType, ObjectType, Props } from './ObjectType'
import { failures, isFailure, Result, success } from 'aelastics-result'

export type FunDecl<A, R> = {
  args: A
  returns: R
}

export class FunctionalTypeC<P extends Props, R extends Any> extends TypeC<
  FunDecl<ObjectType<P>, TypeOf<R>>,
  FunDecl<DtoObjectType<P>, DtoTypeOf<R>>
> {
  constructor(name: string, readonly args: P, readonly returns: R) {
    super(name)
  }

  validateLinks(traversed: Map<Any, Any>): Result<boolean> {
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
      errors.push(
        new Error(
          `Return type '${this.returns.name}' of function '${this.name}' has no valid link. `
        )
      )
    }

    return errors.length ? failures(errors) : success(true)
  }
}

export const fun = <P extends Props, R extends Any>(
  name: string,
  args: P,
  returns: R
): FunctionalTypeC<P, R> => new FunctionalTypeC<P, R>(name, args, returns)
export const returnType = <P extends Props, R extends Any>(f: FunctionalTypeC<P, R>) => f.returns
export const argsType = <P extends Props, R extends Any>(f: FunctionalTypeC<P, R>) => f.args
