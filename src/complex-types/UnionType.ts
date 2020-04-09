/*
 * Copyright (c) AelasticS 2019.
 *
 */

import { ComplexTypeC, InstanceReference } from './ComplexType'
import { Any, ConversionContext, DtoTypeOf, TypeOf } from '../common/Type'
import {
  Error,
  failure,
  failures,
  isFailure,
  isSuccess,
  Path,
  Result,
  success,
  validationError
} from 'aelastics-result'
import { TypeInstancePair, VisitedNodes } from '../common/VisitedNodes'

type DtoUnionType<P extends Array<Any>> = {
  ref: InstanceReference
  typeInUnion: string
  union: DtoTypeOf<P[number]>
}

export class UnionTypeC<P extends Array<Any>> extends ComplexTypeC<
  P,
  TypeOf<P[number]>,
  DtoUnionType<P>,
  DtoTypeOf<P[number]>
> {
  public readonly _tag: 'Union' = 'Union'

  constructor(name: string, baseType: P) {
    super(name, baseType)
  }

  validateCyclic(
    value: TypeOf<P[number]>,
    path: Path = [],
    traversed: VisitedNodes
  ): Result<boolean> {
    let pair: TypeInstancePair = [this, value]

    if (traversed.has(pair)) {
      return success(true)
    }

    traversed.set(pair)

    for (let i = 0; i < this.baseType.length; i++) {
      const type = this.baseType[i]

      let res = type.validateCyclic(value, path, traversed)
      if (isSuccess(res)) {
        return res
      }
    }

    return failure(new Error(`Value ${path}: '${value}' is not union: '${this.name}'`))
  }

  makeInstanceFromDTO(
    input: DtoUnionType<P>,
    path: Path,
    context: ConversionContext
  ): TypeOf<P[number]> {
    let type = this.baseType.find(t => t.name === input.typeInUnion)
    if (!type) {
      context.errors.push(
        validationError(
          `Not existing type '${input.typeInUnion}' in union '${path}': '${input}''`,
          path,
          this.name,
          input
        )
      )
      return undefined
    } else {
      return type.fromDTOCyclic(input.union, path, context)
    }
  }

  makeDTOInstance(
    input: TypeOf<P[number]>,
    path: Path,
    context: ConversionContext
  ): DtoUnionType<P> {
    const output: DtoUnionType<P> = {
      ref: this.makeReference(input, context),
      typeInUnion: 'unknown',
      union: undefined
    }
    for (let i = 0; i < this.baseType.length; i++) {
      // find which type is in union, the first one which is validated
      const type = this.baseType[i]
      let resVal = type.validate(input)
      if (isSuccess(resVal)) {
        output.typeInUnion = type.name
        output.union = type.toDTOCyclic(input, path, context)
        return output
      }
    }
    return output
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
