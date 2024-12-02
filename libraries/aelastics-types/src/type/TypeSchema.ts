/*
 * Copyright (c) AelasticS 2020.
 */

import { Any, string } from '../common/DefinitionAPI'
import { failure, failures, ServiceError, ServiceResult, success } from 'aelastics-result'
import { LinkType } from '../special-types/LinkType'

export enum ValidateStatusEnum {
  invalid,
  inValidatation,
  valid,
}
/**
 *  Schema is a a container of types and other (sub)schemas
 *  Types and subschemas can be shared among schemas!
 */
export class TypeSchema {
  public readonly name: string
  public _types: Map<string, Any> = new Map()
  public _subSchemas: Map<string, TypeSchema> = new Map()
  public _superSchema: TypeSchema | undefined
  private _validateStatus: ValidateStatusEnum = ValidateStatusEnum.invalid
  private _counter: number = 0
  // ToDo add links here
  private _links: any[] = []

  constructor(name: string, superSchema?: TypeSchema) {
    this.name = name
    if (superSchema) {
      superSchema._subSchemas.set(name, this)
      this._superSchema = superSchema
    }
  }

  generateName(base: string): string {
    return `${base}_${++this._counter}`
  }

  public addLink(l: LinkType) {
    this._links.push(l)
  }

  public get path(): string {
    let sup = this._superSchema
    let segments: string[] = []
    if (sup === undefined) return '' // System path is empty
    if (sup === System) return '' // top level is empty
    while (sup !== System) {
      segments.unshift(sup!.name)
      sup = sup!._superSchema
    }
    if (segments.length === 0) return '' // top level is empty
    return `/${segments.join('/')}`
  }

  public get absolutePathName(): string {
    return `${this.path}/${this.name}`
  }

  public get isValid(): boolean {
    return this._validateStatus !== ValidateStatusEnum.invalid
  }

  public get validateStatus(): ValidateStatusEnum {
    return this._validateStatus
  }

  public addType(t: Any) {
    if (this.isValid) {
      throw new ServiceError(
        'OperationNotAllowed',
        `Schema ${this.name} is validated and sealed. It is not allowed to add new types!`
      )
    }
    if (t.isSystemType) {
      throw new ServiceError(
        'OperationNotAllowed',
        `System type ${t.name} is not allowed to be moved out of System schema!`
      )
    }
    if (t.ownerSchema !== this) {
      throw new ServiceError(
        'OperationNotAllowed',
        `Types are not allowed to be moved from one to another schema!`
      )
    }
    // enforce uniqueness of name
    if (this._types.has(t.name)) {
      throw new ServiceError(
        'OperationNotAllowed',
        `Type '${t.name}' is is already existing in schema '${this.name}'!`
      )
    }
    this._types.set(t.name, t) // add to this schema
  }

  public getType(path: string): Any | undefined {
    if(path === undefined)
      return undefined
    let schema: TypeSchema | undefined
    let typeName: string | undefined = ''
    let startSchema: TypeSchema = this
    const segments = path.split('/')

    if (segments[0] !== undefined && segments[0] === '') {
      startSchema = System
      segments.shift()
    }

    if (segments.length >= 1) {
      typeName = segments.pop()
      schema = segments.reduce((schema: any, typeName: any) => {
        return typeof schema === 'undefined' ? schema : schema._subSchemas.get(typeName)
      }, startSchema)
    }

    if (!schema || !typeName) {
      return undefined
    }

    return schema._types.get(typeName)
  }

  public validate(): ServiceResult<boolean> {
    let errors: ServiceError[] = []
    this._links.forEach((link: LinkType) => {
      let t = link.resolveType()
      if (t === undefined) {
        let err = new ServiceError(
          'ValidationError',
          `Type '${link.path}' does not exist in schema '${link.LinkSchema.absolutePathName}'`
        )
        errors.push(err)
      }
    })

    if (errors.length > 0) {
      this._validateStatus = ValidateStatusEnum.valid
      return success(true)
    } else {
      this._validateStatus = ValidateStatusEnum.invalid
      return failures(errors)
    }
  }
}

// top level schema in the system
export const System = new TypeSchema('System')
// top level schema in the system
export let DefaultSchema = new TypeSchema('DefaultSchema', System)
// change default schema
export function setDefaultSchema(schema: TypeSchema) {
  DefaultSchema = schema
}

// create a new schema, if not provided, its super schema is the System schema
export const schema = (name: string, superSchema: TypeSchema = DefaultSchema) => {
  return new TypeSchema(name, superSchema)
}
