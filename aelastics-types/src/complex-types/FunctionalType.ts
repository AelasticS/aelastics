/*
 * Copyright (c) AelasticS 2019.
 *
 */

import {
  Any,
  DtoTreeTypeOf,
  DtoTypeOf,
  FromDtoContext,
  InstanceReference,
  ToDtoContext,
  TypeC,
  TypeOf
} from '../common/Type'
import { DtoObjectType, DtoProps, ObjectType, Props } from './ObjectType'
import { failures, isFailure, Path, Result, success } from 'aelastics-result'
import { ComplexTypeC } from './ComplexType'
import { ExtraInfo, RoleType } from '../common/TraversalContext'

export type FunDecl<A, R> = {
  args: A
  returns: R
}

export class FunctionalTypeC<P extends Props, R extends Any> extends ComplexTypeC<
  R,
  FunDecl<ObjectType<P>, TypeOf<R>>,
  FunDecl<DtoObjectType<P>, DtoTypeOf<R>>,
  FunDecl<DtoProps<P>, DtoTreeTypeOf<R>>
> {
  public readonly _tag: 'Function' = 'Function'

  constructor(name: string, readonly args: P, readonly returns: R) {
    super(name, returns)
  }

  toDTOCyclic(
    input: FunDecl<ObjectType<P>, TypeOf<R>>,
    path: Path,
    context: ToDtoContext
  ): FunDecl<DtoProps<P>, DtoTreeTypeOf<R>> | FunDecl<DtoObjectType<P>, DtoTypeOf<R>> {
    return undefined as any
  }

  fromDTOCyclic(
    value: FunDecl<DtoProps<P>, DtoTreeTypeOf<R>> | FunDecl<DtoObjectType<P>, DtoTypeOf<R>>,
    path: Path,
    context: FromDtoContext
  ): FunDecl<ObjectType<P>, TypeOf<R>> {
    return undefined as any
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

  defaultValue(): any {
    return () => {
      return this.returns.defaultValue()
    }
  }

  protected *children(instance: any): Generator<[Any, any, RoleType, ExtraInfo]> {
    return []
    for (let [key, value] of Object.entries(this.args)) {
      yield [value, instance, 'asFuncArgument', { propName: key }]
    }
    yield [this.returns, instance, 'asFuncArgument', {}]
  }

  makeDTOInstance(
    input: FunDecl<ObjectType<P>, TypeOf<R>>,
    ref: InstanceReference,
    path: Path,
    context: ToDtoContext
  ): FunDecl<DtoProps<P>, DtoTreeTypeOf<R>> {
    return undefined as any
  }

  makeEmptyInstance(
    value: FunDecl<DtoProps<P>, DtoTreeTypeOf<R>> | FunDecl<DtoObjectType<P>, DtoTypeOf<R>>,
    path: Path,
    context: FromDtoContext
  ): FunDecl<ObjectType<P>, TypeOf<R>> {
    return undefined as any
  }

  makeInstanceFromDTO(
    input: FunDecl<DtoProps<P>, DtoTreeTypeOf<R>>,
    empty: FunDecl<ObjectType<P>, TypeOf<R>>,
    path: Path,
    context: FromDtoContext
  ): void {
    return
  }
}

export const fun = <P extends Props, R extends Any>(
  name: string,
  args: P,
  returns: R
): FunctionalTypeC<P, R> => new FunctionalTypeC<P, R>(name, args, returns)
export const returnType = <P extends Props, R extends Any>(f: FunctionalTypeC<P, R>) => f.returns
export const argsType = <P extends Props, R extends Any>(f: FunctionalTypeC<P, R>) => f.args
