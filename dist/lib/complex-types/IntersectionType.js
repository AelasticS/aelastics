/*
 * Copyright (c) AelasticS 2019.
 *
 */
import { ComplexTypeC } from './ComplexType'
import { failures, isFailure, success } from 'aelastics-result'

export class IntersectionTypeC extends ComplexTypeC {
  constructor() {
    super(...arguments)
    this._tag = 'Intersection'
  }

  validate(value, path = []) {
    const err = []
    for (const t of this.baseType) {
      const res = t.validate(value, path)
      if (isFailure(res)) {
        err.push(...res.errors)
      }
    }
    const res = super.validate(value, path)
    if (isFailure(res)) {
      err.push(...res.errors)
    }
    if (err.length > 0) {
      return failures(err)
    } else {
      return success(true)
    }
  }

  fromDTO(value, path = []) {
    const res = this.validate(value, path)
    if (isFailure(res))
      return res
    const val = {}
    for (const t of this.baseType) {
      const res = t.fromDTO(value, path)
      if (isFailure(res)) {
        return res
      } else {
        Object.assign(val, res.value)
      }
    }
    return success(val)
  }

  toDTO(value, path = [], validate = true) {
    if (validate) {
      const res = this.validate(value, path)
      if (isFailure(res))
        return res
    }
    const val = {}
    for (const t of this.baseType) {
      const res = t.toDTO(value, path)
      if (isFailure(res)) {
        return res
      } else {
        Object.assign(val, res.value)
      }
    }
    return success(val)
  }

  validateLinks(traversed) {
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
}

const getIntersectionName = (elements) => {
  return `(${elements.map(baseType => baseType.name).join(' | ')})`
}
export const intersectionOf = (elements, name = getIntersectionName(elements)) => {
  return new IntersectionTypeC(name, elements)
}
//# sourceMappingURL=IntersectionType.js.map
