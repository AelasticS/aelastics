/*
 * Copyright (c) AelasticS 2019.
 *
 */

import {
  Any,
  ToDtoContext,
  DtoTypeOf,
  InstanceReference,
  TypeOf,
  FromDtoContext,
  DtoTreeTypeOf
} from '../common/Type'
import { ComplexTypeC } from './ComplexType'
import { Error, failures, isFailure, Path, Result, success } from 'aelastics-result'
import { TypeInstancePair, VisitedNodes } from '../common/VisitedNodes'

type UnionToIntersection<U> = (U extends any
? (k: U) => void
: never) extends (k: infer I) => void
  ? I
  : never

/*
type DtoIntersectionType_old<P extends Array<Any>> = {
  ref: InstanceReference
  intersection: UnionToIntersection<DtoTypeOf<P[number]>>
}


// to change Intersection definition form Array to Props
export type DtoIntersectionType0<P extends Array<Any>> = {
  ref: InstanceReference
  intersection: {[K in keyof P[number]]:DtoTypeOf<P[number]>} //
}
*/

export type DtoIntersectionType<P extends Array<Any>> = {
  ref: InstanceReference
  intersection: { [key: string]: DtoTypeOf<P[number]> } // [K in keyof P[number]]
}

export type DtoIntersectionType2<P extends Array<Any>> = {
  ref: InstanceReference
  intersection?: Array<DtoTypeOf<P[number]>> // [K in keyof P[number]]
}

export class IntersectionTypeC<P extends Array<Any>> extends ComplexTypeC<
  P,
  UnionToIntersection<TypeOf<P[number]>>,
  DtoIntersectionType<P>,
  { [key: string]: DtoTreeTypeOf<P[number]> } // UnionToIntersection<DtoTypeOf<P[number]>>
> {
  public readonly _tag: 'Intersection' = 'Intersection'

  validateCyclic(
    value: UnionToIntersection<TypeOf<P[number]>>,
    path: Path = [],
    traversed: VisitedNodes<Any, any, any>
  ): Result<boolean> {
    let pair: TypeInstancePair<Any, any> = [this, value]

    if (traversed.has(pair)) {
      return success(true)
    }

    traversed.set(pair, undefined)

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
    input: { [p: string]: DtoTreeTypeOf<P[number]> },
    output: UnionToIntersection<TypeOf<P[number]>>,
    path: Path,
    context: FromDtoContext
  ) {
    for (const t of this.baseType) {
      const res = t.fromDTOCyclic(input[t.shortName], path, context)
      Object.assign(output, res)
    }
  }

  makeDTOInstance(
    input: UnionToIntersection<TypeOf<P[number]>>,
    ref: InstanceReference,
    path: Path,
    context: ToDtoContext
  ): { [p: string]: DtoTypeOf<P[number]> } {
    let output: { [p: string]: DtoTypeOf<P[number]> } = {}
    for (const t of this.baseType) {
      output[t.shortName] = t.toDTOCyclic(input, path, context)
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

  protected isIntersectionRef(input: any): input is DtoIntersectionType<P> {
    if (input.ref && input.intersection) {
      return true
    }
    return false
  }

  defaultValue(): any {
    let value = {}
    for (const t of this.baseType) {
      Object.assign(value, t.defaultValue())
    }
    return value
  }

  makeEmptyInstance(
    value: { [p: string]: DtoTypeOf<P[number]> } | DtoIntersectionType<P>,
    path: Path,
    context: FromDtoContext
  ): UnionToIntersection<TypeOf<P[number]>> {
    return {} as any
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
