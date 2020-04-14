/*
 * Copyright (c) AelasticS 2019.
 *
 */

import { Any, FromDtoContext, ToDtoContext, TypeC } from './Type'
import { TypeSchema, ValidateStatusEnum } from './TypeSchema'
import { failure, failures, Path, Result, success } from 'aelastics-result'
import { VisitedNodes } from './VisitedNodes'

export class LinkC extends TypeC<any> {
  public readonly schema: TypeSchema
  public readonly path: string
  private resolvedType: TypeC<any> | undefined = undefined

  constructor(name: string, schema: TypeSchema, path: string) {
    super(name)
    this.schema = schema
    this.path = path
  }

  defaultValue(): any {
    return undefined
  }

  validateCyclic(
    value: any,
    path: Path = [],
    traversed: VisitedNodes<Any, any, any>
  ): Result<boolean> {
    if (this.resolvedType) {
      return this.resolvedType.validateCyclic(value, path, traversed)
    }
    throw new Error(`Link to type:'${this.path}' is undefined`)
  }

  toDTOCyclic(input: any, path: Path, context: ToDtoContext): any {
    if (this.resolvedType) {
      return this.resolvedType.toDTOCyclic(input, path, context)
    }
    throw new Error(`Link to type:'${this.path}' is undefined`)
  }

  fromDTOCyclic(value: any, path: Path, context: FromDtoContext): any | undefined {
    if (this.resolvedType) {
      return this.resolvedType.fromDTOCyclic(value, path, context)
    }
    throw new Error(`Link to type:'${this.path}' is undefined`)
  }

  public isResolved() {
    return this.resolvedType
  }

  public resolveType(): TypeC<any> | undefined {
    this.resolvedType = this.schema.getType(this.path)
    return this.resolvedType
  }

  /**
   *  ToDo:  Nikola: validation assumes that external references are resolved
   */

  //

  validateLinks(traversed: Map<Any, Any>): Result<boolean> {
    if (this.schema.validateStatus === ValidateStatusEnum.invalid) {
      this.schema.validate(traversed)
    }

    if (this.resolveType() === undefined) {
      return failure(new Error(`Type '${this.path}' does not exist in schema '${this.schema}'`))
    }
    return success(true)
  }
}

export const link = (schema: TypeSchema, path: string, name: string = `Link^${path}`) =>
  new LinkC(name, schema, path)
