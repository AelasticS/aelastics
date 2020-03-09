/*
 * Copyright (c) AelasticS 2019.
 */
import { success, failures, isFailure } from 'aelastics-result'
import { TypeC } from '../Type'

const getOptionalName = (base) => `optional ${base.name}`

export class OptionalTypeC extends TypeC {
  constructor(base, name = getOptionalName(base)) {
    super(name)
    this._tag = 'Optional'
    this.base = base
  }

  validate(value, path = []) {
    if (typeof value === 'undefined') {
      return success(true)
    } else {
      return this.base.validate(value, path)
    }
  }

  fromDTO(value, path = []) {
    if (typeof value === 'undefined') {
      return success(undefined)
    } else {
      return this.base.fromDTO(value, path)
    }
  }

  /**
   * toDTO
   */
  toDTO(value, path = [], validate = true) {
    if (validate) {
      const res = this.validate(value, path)
      if (isFailure(res)) {
        return failures(res.errors)
      }
    }
    if (typeof value === 'undefined') {
      return success(undefined)
    } else {
      return this.base.toDTO(value, path, validate)
    }
  }

  validateLinks(traversed) {
    traversed.set(this, this)
    if (traversed.has(this.base))
      return success(true)
    else
      return this.base.validateLinks(traversed)
  }
}

export function optional(type, name) {
  return new OptionalTypeC(type, name)
}

//# sourceMappingURL=Optional.js.map
