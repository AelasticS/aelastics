/*
 * Copyright (c) AelasticS 2019.
 *
 */

import { Any, ConversionContext, DtoTypeOf, TypeOf } from '../common/Type'
import { ComplexTypeC, InstanceReference } from './ComplexType'
import { Error, failures, isFailure, Path, Result, success } from 'aelastics-result'
import { TypeInstancePair, VisitedNodes } from '../common/VisitedNodes'

type UnionToIntersection<U> = (U extends any
? (k: U) => void
: never) extends (k: infer I) => void
  ? I
  : never

type DtoIntersectionType<P extends Array<Any>> = {
  ref: InstanceReference
  intersection: UnionToIntersection<DtoTypeOf<P[number]>>
}

export class IntersectionTypeC<P extends Array<Any>> extends ComplexTypeC<
  P,
  UnionToIntersection<TypeOf<P[number]>>,
  DtoIntersectionType<P>,
  UnionToIntersection<DtoTypeOf<P[number]>>
> {
  public readonly _tag: 'Intersection' = 'Intersection'

  validateCyclic(
    value: UnionToIntersection<TypeOf<P[number]>>,
    path: Path = [],
    traversed: VisitedNodes
  ): Result<boolean> {
    let pair: TypeInstancePair = [this, value]

    if (traversed.has(pair)) {
      return success(true)
    }

    traversed.set(pair)

    const err: Error[] = []
    for (const t of this.baseType) {
      const res = t.validateCyclic(value, path, traversed)
      if (isFailure(res)) {
        err.push(...res.errors)
      }
    }

    const res = super.validateCyclic(value, path, traversed)
    if (isFailure(res)) {
      err.push(...res.errors)
    }

    if (err.length > 0) {
      return failures(err)
    } else {
      return success(true)
    }
  }

  makeInstanceFromDTO(
    input: DtoIntersectionType<P>,
    path: Path,
    context: ConversionContext
  ): UnionToIntersection<TypeOf<P[number]>> {
    const output = {} as UnionToIntersection<TypeOf<P[number]>>
    for (const t of this.baseType) {
      const res = t.fromDTOCyclic(input, path, context)
      Object.assign(output, res)
    }
    return output
  }

  makeDTOInstance(
    input: UnionToIntersection<TypeOf<P[number]>>,
    path: Path,
    context: ConversionContext
  ): DtoIntersectionType<P> {
    const output: DtoIntersectionType<P> = {
      ref: this.makeReference(input, context),
      intersection: {} as UnionToIntersection<DtoTypeOf<P[number]>>
    }
    for (const t of this.baseType) {
      const res = t.toDTOCyclic(input, path, context)
      Object.assign(output.intersection, res)
    }
    return output
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
