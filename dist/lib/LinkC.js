/*
 * Copyright (c) AelasticS 2019.
 *
 */
import { TypeC } from './Type'
import { ValidateStatusEnum } from './TypeSchema'
import { failure, success } from 'aelastics-result'

export class LinkC extends TypeC {
  constructor(name, schema, path) {
    super(name)
    this.resolvedType = undefined
    this.schema = schema
    this.path = path
  }

  isResolved() {
    return this.resolvedType
  }

  resolveType() {
    this.resolvedType = this.schema.getType(this.path)
    return this.resolvedType
  }

  /**
   *  ToDo:  Nikola: validation assumes that external references are resolved
   */
  //
  validateLinks(traversed) {
    if (this.schema.validateStatus === ValidateStatusEnum.invalid) {
      this.schema.validate(traversed)
    }
    if (this.resolveType() === undefined) {
      return failure(new Error(`Type '${this.path}' does not exist in schema '${this.schema}'`))
    }
    return success(true)
  }
}

export const link = (schema, path, name = `Link^${path}`) => new LinkC(name, schema, path)
//# sourceMappingURL=LinkC.js.map
