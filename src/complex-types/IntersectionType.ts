/*
 * Copyright (c) AelasticS 2019.
 *
 */

import { Any, DtoTypeOf, TypeOf } from '../common/Type'
import { ComplexTypeC } from './ComplexType'
import { Error, failures, isFailure, Path, Result, success } from 'aelastics-result'

type UnionToIntersection<U> = (U extends any
? (k: U) => void
: never) extends (k: infer I) => void
  ? I
  : never

export class IntersectionTypeC<P extends Array<Any>> extends ComplexTypeC<
  P,
  UnionToIntersection<TypeOf<P[number]>>,
  UnionToIntersection<DtoTypeOf<P[number]>>
> {
  public readonly _tag: 'Intersection' = 'Intersection'

  validate(
    value: UnionToIntersection<TypeOf<P[number]>>,
    path: Path = [],
    traversed?: Map<Any, Any>
  ): Result<boolean> {
    if (traversed === undefined) {
      traversed = new Map<Any, Any>()
    }

    traversed.set(this, this)

    const err: Error[] = []
    for (const t of this.baseType) {
      if (traversed.has(t)) {
        continue
      }
      const res = t.validate(value, path)
      if (isFailure(res)) {
        err.push(...res.errors)
      }
    }

    const res = super.validate(value, path)
    if (isFailure(res)) {
      err.push(...res.errors)
    }

    if (err.length > 0) {
      return failures(err)
    } else {
      return success(true)
    }
  }

  fromDTO(
    value: UnionToIntersection<DtoTypeOf<P[number]>>,
    path: Path = []
  ): Result<UnionToIntersection<TypeOf<P[number]>>> {
    const res = this.validate(value, path)
    if (isFailure(res)) return res
    const val = {} as UnionToIntersection<TypeOf<P[number]>>
    for (const t of this.baseType) {
      const res = t.fromDTO(value, path)
      if (isFailure(res)) {
        return res
      } else {
        Object.assign(val, res.value)
      }
    }

    return success(val)
  }

  toDTO(
    value: UnionToIntersection<TypeOf<P[number]>>,
    path: Path = [],
    validate: boolean = true
  ): Result<UnionToIntersection<DtoTypeOf<P[number]>>> {
    if (validate) {
      const res = this.validate(value, path)
      if (isFailure(res)) return res
    }
    const val = {} as UnionToIntersection<DtoTypeOf<P[number]>>
    for (const t of this.baseType) {
      const res = t.toDTO(value, path)
      if (isFailure(res)) {
        return res
      } else {
        Object.assign(val, res.value)
      }
    }
    return success(val)
  }

  validateLinks(traversed: Map<Any, Any>): Result<boolean> {
    traversed.set(this, this)

    const errors = []
    for (const t of this.baseType) {
      if (traversed.has(t)) {
        continue
      }
      const res = t.validateLinks(traversed)
      if (isFailure(res)) {
        errors.push(...res.errors)
      }
    }

    return errors.length ? failures(errors) : success(true)
  }
}
const getIntersectionName = <U extends Array<Any>>(elements: U): string => {
  return `(${elements.map(baseType => baseType.name).join(' | ')})`
}

export const intersectionOf = <P extends Array<Any>>(
  elements: P,
  name: string = getIntersectionName(elements)
) => {
  return new IntersectionTypeC(name, elements)
}
