/*
 * Copyright (c) AelasticS 2019.
 *
 */

import { ComplexTypeC } from './ComplexType'
import { Any, DtoTypeOf, TypeOf } from '../common/Type'
import {
  Error,
  failure,
  failures,
  failureValidation,
  isFailure,
  isSuccess,
  Path,
  Result,
  success
} from 'aelastics-result'

export class UnionTypeC<P extends Array<Any>> extends ComplexTypeC<
  P,
  TypeOf<P[number]>,
  DtoTypeOf<P[number]>
> {
  public readonly _tag: 'Union' = 'Union'

  constructor(name: string, baseType: P) {
    super(name, baseType)
  }

  public validate(
    value: TypeOf<P[number]>,
    path: Path = [],
    traversed?: Map<Any, Any>
  ): Result<boolean> {
    if (traversed === undefined) {
      traversed = new Map<Any, Any>()
    }

    traversed.set(this, this)

    for (let i = 0; i < this.baseType.length; i++) {
      const type = this.baseType[i]
      if (traversed.has(type)) {
        continue
      }
      let res = type.validate(value, path)
      if (isSuccess(res)) {
        return res
      }
    }

    return failure(new Error(`Value ${path}: '${value}' is not union: '${this.name}'`))
  }

  public fromDTO(input: DtoTypeOf<P[number]>, path: Path = []): Result<TypeOf<P[number]>> {
    for (let i = 0; i < this.baseType.length; i++) {
      const type = this.baseType[i]
      let res = type.fromDTO(input, path)
      if (isSuccess(res)) {
        return res
      }
    }
    return failureValidation(
      `Value ${path}: '${input}' is not union: '${this.name}'`,
      path,
      this.name,
      input
    )
  }
  // always validates besause otherwise input would serialize as first type in P[number]
  public toDTO(input: TypeOf<P[number]>, path: Path = []): Result<DtoTypeOf<P[number]>> {
    for (let i = 0; i < this.baseType.length; i++) {
      const type = this.baseType[i]
      let res = type.toDTO(input, path)
      if (isSuccess(res)) {
        return res
      }
    }
    return failureValidation(
      `Value ${path}: '${input}' is not union: '${this.name}'`,
      path,
      this.name,
      input
    )
  }

  public getTypeFromValue(value: TypeOf<P[number]>): Result<Any> {
    for (let i = 0; i < this.baseType.length; i++) {
      const type = this.baseType[i]
      let res = type.validate(value)
      if (isSuccess(res)) {
        return success(type)
      }
    }
    return failure(
      new Error(`Value '${JSON.stringify(value)}' is not member of union '${this.name}'`)
    )
  }

  validateLinks(traversed: Map<Any, Any>): Result<boolean> {
    traversed.set(this, this)
    let errors = []

    for (let i = 0; i < this.baseType.length; i++) {
      const t = this.baseType[i]

      if (traversed.has(t)) {
        continue
      }
      let res = t.validateLinks(traversed)
      if (isFailure(res)) {
        errors.push(...res.errors)
      }
    }
    return errors.length ? failures(errors) : success(true)
  }
}

const getUnionName = <U extends Array<Any>>(elements: U): string => {
  return `(${elements.map(baseType => baseType.name).join(' | ')})`
}

export const unionOf = <P extends Array<Any>>(
  elements: P,
  name: string = getUnionName(elements)
) => {
  return new UnionTypeC(name, elements)
}
