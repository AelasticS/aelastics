/*
 * Copyright (c) AelasticS 2019.
 *
 */
import { failures, isFailure, success } from 'aelastics-result'

export var ValidateStatusEnum;
(function(ValidateStatusEnum) {
  ValidateStatusEnum[ValidateStatusEnum['invalid'] = 0] = 'invalid'
  ValidateStatusEnum[ValidateStatusEnum['inValidatation'] = 1] = 'inValidatation'
  ValidateStatusEnum[ValidateStatusEnum['valid'] = 2] = 'valid'
})(ValidateStatusEnum || (ValidateStatusEnum = {}))

/**
 *  Schema is a a container of types and other (sub)schemas
 *  Types and subschemas can be shared among schemas!
 */
export class TypeSchema {
  constructor(name, superSchema) {
    this._types = new Map()
    this._subSchemas = new Map()
    this._validateStatus = ValidateStatusEnum.invalid
    this.name = name
    if (superSchema) {
      superSchema._subSchemas.set(name, this)
      this._superSchema = superSchema
    }
  }

  get isValid() {
    return this._validateStatus !== ValidateStatusEnum.invalid
  }

  get validateStatus() {
    return this._validateStatus
  }

  addType(t) {
    this.invalidate()
    this._types.set(t.name, t)
  }

  removeType(t) {
    this.invalidate()
    this._types.delete(t.name)
  }

  /**
   * Return a type by its name
   */
  getType(path) {
    if (!this.isValid) {
      throw Error(`Type schema '${this.name}' is not validated!`)
    }
    let schema
    let typeName = ''
    const segments = path.split('/')
    if (segments.length >= 1) {
      typeName = segments.pop()
      schema = segments.reduce((schema, typeName) => {
        return typeof schema === 'undefined' ? schema : schema._subSchemas.get(typeName)
      }, this)
    }
    if (!schema || !typeName) {
      return undefined
    }
    return schema._types.get(typeName)
  }

  get types() {
    return Array.from(this._types.values())
  }

  get subSchemas() {
    return Array.from(this._subSchemas.values())
  }

  invalidate() {
    this._validateStatus = ValidateStatusEnum.invalid
    if (this._superSchema) {
      this._superSchema.invalidate()
    }
  }

  /**
   *  ToDo:  Nikola: validation assumes that external references are resolved
   */
  validate(traversed) {
    this._validateStatus = ValidateStatusEnum.inValidatation
    if (traversed === undefined) {
      traversed = new Map()
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

export const schema = (name, superSchema) => new TypeSchema(name, superSchema)
//# sourceMappingURL=TypeSchema.js.map
