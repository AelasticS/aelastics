/*
 * Copyright (c) AelasticS 2019.
 *
 */

import { Any, TypeC } from './Type'
import { failures, isFailure, Result, success } from 'aelastics-result'

export enum ValidateStatusEnum {
  invalid,
  inValidatation,
  valid
}
/**
 *  Schema is a a container of types and other (sub)schemas
 *  Types and subschemas can be shared among schemas!
 */
export class TypeSchema {
  public readonly name: string
  private _types: Map<string, TypeC<any>> = new Map()
  private _subSchemas: Map<string, TypeSchema> = new Map()
  private _superSchema: TypeSchema | undefined
  private _validateStatus: ValidateStatusEnum = ValidateStatusEnum.invalid

  constructor(name: string, superSchema?: TypeSchema) {
    this.name = name
    if (superSchema) {
      superSchema._subSchemas.set(name, this)
      this._superSchema = superSchema
    }
  }
  public get isValid(): boolean {
    return this._validateStatus !== ValidateStatusEnum.invalid
  }

  public get validateStatus(): ValidateStatusEnum {
    return this._validateStatus
  }

  public addType(t: TypeC<any>) {
    this.invalidate()
    this._types.set(t.name, t)
  }

  public removeType(t: TypeC<any>) {
    this.invalidate()
    this._types.delete(t.name)
  }

  /**
   * Return a type by its name
   */
  public getType(path: string): Any | undefined {
    /*  from version 0.6.2 it is  possible to get from schema a type via a path, even if schema is not validated
        if (!this.isValid) {
          throw Error(`Type schema '${this.name}' is not validated!`)
        }
    */
    let schema: TypeSchema | undefined
    let typeName: string | undefined = ''
    const segments = path.split('/')
    if (segments.length >= 1) {
      typeName = segments.pop()
      schema = segments.reduce((schema: any, typeName: any) => {
        return typeof schema === 'undefined' ? schema : schema._subSchemas.get(typeName)
      }, this)
    }
    if (!schema || !typeName) {
      return undefined
    }
    return schema._types.get(typeName)
  }

  public get types(): Array<TypeC<any>> {
    return Array.from(this._types.values())
  }

  public get subSchemas(): Array<TypeSchema> {
    return Array.from(this._subSchemas.values())
  }

  invalidate(): void {
    this._validateStatus = ValidateStatusEnum.invalid
    if (this._superSchema) {
      this._superSchema.invalidate()
    }
  }
  /**
   *  ToDo:  Nikola: validation assumes that external references are resolved
   */
  public validate(traversed?: Map<Any, Any>): Result<boolean> {
    this._validateStatus = ValidateStatusEnum.inValidatation
    if (traversed === undefined) {
      traversed = new Map<Any, Any>()
    }

    let arrayOfTypes = Array.from(this._types.values())
    let errors = []

    for (let i = 0; i < arrayOfTypes.length; i++) {
      if (traversed.has(arrayOfTypes[i])) {
        continue
      }

      let res = arrayOfTypes[i].validateLinks(traversed)

      if (isFailure(res)) {
        errors.push(...res.errors)
      }
    }

    let arrayOfSchemas = Array.from(this._subSchemas.values())

    for (let i = 0; i < arrayOfSchemas.length; i++) {
      let res = arrayOfSchemas[i].validate(traversed)
      if (isFailure(res)) {
        errors.push(...res.errors)
      }
    }

    if (errors.length !== 0) {
      this._validateStatus = ValidateStatusEnum.invalid
      return failures(errors)
    }
    this._validateStatus = ValidateStatusEnum.valid
    return success(this.isValid)
  }
}

export const schema = (name: string, superSchema?: TypeSchema) => new TypeSchema(name, superSchema)
