/*
 * Copyright (c) AelasticS 2019.
 *
 */

import { ComplexTypeC } from './ComplexType'
import {
  Any,
  ToDtoContext,
  DtoTypeOf,
  InstanceReference,
  TypeOf,
  FromDtoContext
} from '../common/Type'
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
import { DtoObjectType, isObject } from './ObjectType'
import { SimpleTypeC } from '../simple-types/SimpleType'
import { TraversalContext } from '../common/TraversalContext'

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

  protected traverseChildren<R>(
    value: TypeOf<P[number]>,
    f: <R>(type: Any, value: any, c: TraversalContext) => R,
    context: TraversalContext
  ): void {
    const typeRes = this.getTypeFromValue(value)
    if (isFailure(typeRes)) {
      throw new Error(`Value: '${value}' is not union: '${this.name}'`)
    } else {
      if (!(typeRes.value instanceof SimpleTypeC && context.skipSimpleTypes)) {
        typeRes.value.traverseCyclic(value, f, context)
      }
    }
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

  fromDTOCyclic(
    input: DtoTypeOf<P[number]> | DtoUnionType<P>,
    path: Path,
    context: FromDtoContext
  ): TypeOf<P[number]> {
    // test if it is graph or tree!
    if (context.options.isTreeDTO === false) {
      // graph!
      let value: DtoUnionType<P> = input

      let ref = this.getRefFromNode(value)
      let output = context.visitedNodes?.get([this, ref.id])
      if (output) {
        // already in cache
        return output
      } else {
        // put output in cache
        let specificType = this.getTypeFromName(value.ref.specificTypeName)
        if (specificType) {
          if (specificType instanceof SimpleTypeC) {
            output = value.union
            return (specificType as SimpleTypeC<any>).fromDTOCyclic(value.union, path, context)
          } else {
            let ct = specificType as ComplexTypeC<any, any>
            output = ct.makeEmptyInstance(value.union, path, context)
            // @ts-ignore
            let ref = this.getRefFromNode(value)
            context.visitedNodes?.set([this, ref.id], output)
            ct.makeInstanceFromDTO(value.union![ct.categoryCamelCase], output, path, context)
            return output
          }
        } else {
          context.errors.push(
            new ValidationError(
              `Value '${JSON.stringify(value.union)}' is not of type '${
                value.ref.specificTypeName
              }'`,
              path,
              value.ref.specificTypeName!,
              value.union
            )
          )
        }
      }
    } else {
      // tree!
      let type = this.getTypeFromValue(input)
      if (isSuccess(type)) {
        return type.value.fromDTOCyclic(input, path, context)
      } else {
        context.errors.push(...(type.errors as ValidationError[]))
      }
    }
  }

  makeInstanceFromDTO(
    input: DtoTypeOf<P[number]>,
    empty: TypeOf<P[number]>,
    path: Path,
    context: FromDtoContext
  ) {
    return undefined
  }

  makeDTOInstance(
    input: TypeOf<P[number]>,
    ref: InstanceReference,
    path: Path,
    context: ToDtoContext
  ): DtoTypeOf<P[number]> {
    let output: DtoTypeOf<P[number]> = {} as DtoTypeOf<P[number]>
    let typeInUnion
    for (let i = 0; i < this.baseType.length; i++) {
      const type = this.baseType[i]
      let resVal = type.validate(input)
      if (isSuccess(resVal)) {
        ref.specificTypeName = type.name
        output = type.toDTOCyclic(input, path, context)
        break
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

  public getTypeFromName(name?: string): Any | undefined {
    for (let i = 0; i < this.baseType.length; i++) {
      const type = this.baseType[i]
      if (name === type.name) {
        return type
      }
    }
    return undefined
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

  makeEmptyInstance(
    input: DtoTypeOf<P[number]> | DtoUnionType<P>,
    path: Path,
    context: FromDtoContext
  ): TypeOf<P[number]> {
    let res = input
    if (context.options.isTreeDTO) {
      // @ts-ignore
      res = input.union
    }
    if (isObject(res)) {
      return {}
    } else if (Array.isArray(res)) {
      return []
    } else return input
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
