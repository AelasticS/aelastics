/*
 * Copyright (c) AelasticS 2019.
 *
 */

import { ComplexTypeC } from './ComplexType'
import { Any, ToDtoContext, DtoTypeOf, InstanceReference, TypeOf } from '../common/Type'
import {
  Error,
  failure,
  failures,
  isFailure,
  isSuccess,
  Path,
  Result,
  success,
  ValidationError,
  validationError
} from 'aelastics-result'
import { TypeInstancePair, VisitedNodes } from '../common/VisitedNodes'
import { UnionType } from 'typedoc/dist/lib/models'
import { types } from '../aelastics-types'
import isUnionType = types.isUnionType
import { DtoObjectType } from './ObjectType'

type DtoUnionType<P extends Array<Any>> = {
  ref: InstanceReference
  union?: DtoTypeOf<P[number]>
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
    traversed: VisitedNodes<Any, any, any>
  ): Result<boolean> {
    let pair: TypeInstancePair<Any, any> = [this, value]

    if (traversed.has(pair)) {
      return success(true)
    }

    traversed.set(pair, undefined)

    for (let i = 0; i < this.baseType.length; i++) {
      const type = this.baseType[i]

      let res = type.validateCyclic(value, path, traversed)
      if (isSuccess(res)) {
        return res
      }
    }

    return failure(new Error(`Value ${path}: '${value}' is not union: '${this.name}'`))
  }

  protected isUnionRef(input: any): input is DtoUnionType<P> {
    if (input.ref && input.ref.specificTypeName && input.union) {
      return true
    }
    return false
  }

  makeInstanceFromDTO(
    input: DtoTypeOf<P[number]> | DtoUnionType<P>,
    path: Path,
    context: ToDtoContext
  ): TypeOf<P[number]> {
    if (this.isUnionRef(input)) {
      let type = this.baseType.find(t => t.name === input.ref.specificTypeName)
      if (!type) {
        context.errors.push(
          validationError(
            `Not existing type '${input.ref.specificTypeName}' in union '${path}': '${input}''`,
            path,
            this.name,
            input
          )
        )
        return undefined
      } else {
        return type.fromDTOCyclic(input.union, path, context)
      }
    } else {
      let result = this.getTypeFromValue(input)
      if (isSuccess(result)) {
        return result.value.fromDTOCyclic(input, path, context)
      } else {
        context.errors.push(...(result.errors as ValidationError[]))
      }
    }

    return undefined
  }

  makeDTOInstance(
    input: TypeOf<P[number]>,
    path: Path,
    context: ToDtoContext
  ): DtoTypeOf<P[number]> | DtoUnionType<P> {
    let output: DtoTypeOf<P[number]> | DtoUnionType<P>
    let outputUnion: DtoTypeOf<P[number]> = {} as DtoTypeOf<P[number]>
    let typeInUnion
    for (let i = 0; i < this.baseType.length; i++) {
      const type = this.baseType[i]
      let resVal = type.validate(input)
      if (isSuccess(resVal)) {
        typeInUnion = type.name
        outputUnion = type.toDTOCyclic(input, path, context)
        break
      }
    }
    if (context.options.isTreeDTO) {
      output = outputUnion
    } else {
      output = {
        ref: {
          ...this.retrieveRefFromVisited(input, context),
          ...{ specificTypeName: typeInUnion }
        },
        union: outputUnion
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

  defaultValue(): any {
    return undefined
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
