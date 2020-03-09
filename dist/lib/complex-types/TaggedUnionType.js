/*
 * Copyright (c) AelasticS 2019.
 *
 */
import { appendPath, Error, failure, failures, isFailure, success } from 'aelastics-result'
import { ObjectTypeC } from './ObjectType'
import { ComplexTypeC } from './ComplexType'
// export type TaggedProps<Tag extends string> = { [K in Tag]: LiteralTypeC<Tag> }
const findTypeFromDiscriminator = (d, t) => {
  for (const key in t) {
    if (key === d) {
      return t[key]
    }
  }
  return undefined
}

export class TaggedUnionTypeC extends ComplexTypeC {
  constructor(name, discriminator, elements) {
    super(name, elements)
    this.discriminator = discriminator
    this._tag = 'TaggedUnion'
    this.keys = Object.keys(this.baseType)
  }

  validate(value, path = []) {
    const instance = value[this.discriminator]
    if (!instance) {
      return failure(new Error(`Value ${path}: '${value}' is not a proper union, no discriminator property: '${this.discriminator}'`))
    } else {
      const type = findTypeFromDiscriminator(instance, this.baseType)
      if (!type) {
        return failure(new Error(`Value ${path}: '${value}' - there is no type in tagged union named: '${instance}'`))
      } else {
        const errors = []
        const typeValidation = type.validate(value, path)
        if (isFailure(typeValidation)) {
          errors.push(...typeValidation.errors)
        }
        const res = this.checkValidators(value, path)
        if (isFailure(res)) {
          errors.push(...res.errors)
        }
        return errors.length ? failures(errors) : success(true)
      }
    }
  }

  fromDTO(input, path = []) {
    const errors = []
    const instance = input[this.discriminator]
    if (!instance) {
      return failure(new Error(`Value ${path}: '${input}' is not a proper union, no discriminator property: '${this.discriminator}'`))
    } else {
      const type = findTypeFromDiscriminator(instance, this.baseType)
      if (!type) {
        return failure(new Error(`Value ${path}: '${input}' - there is no type in tagged union named: '${instance}'`))
      }
      const conversion = type.fromDTO(input, appendPath(path, instance, type.name, input))
      if (isFailure(conversion)) {
        return conversion
      }
      const res = this.checkValidators(conversion.value, path)
      if (isFailure(res)) {
        return res
      }
      return errors.length ? failures(errors) : success(conversion.value)
    }
  }

  toDTO(input, path = [], validate = true) {
    // const errors: Errors = [];
    if (validate) {
      const res = this.validate(input, path)
      if (isFailure(res)) {
        return failures(res.errors)
      }
    }
    const instance = input[this.discriminator]
    if (!instance) {
      return failure(new Error(`Value ${path}: '${input}' is not a proper union, no discriminator property: '${this.discriminator}'`))
    } else {
      const type = findTypeFromDiscriminator(instance, this.baseType)
      if (!type) {
        return failure(new Error(`Value ${path}: '${input}' - there is no type in tagged union named: '${instance}'`))
      }
      const conversion = type.toDTO(input, appendPath(path, instance, type.name, input), validate)
      if (isFailure(conversion)) {
        return conversion
      }
      /*
            const res = this.checkValidators(conversion.value, path);
            if (isFailure(res)) {
                return res;
            }
        */
      //            return errors.length ? failures(errors) : success(conversion.value);
      return success(conversion.value)
    }
  }

  validateLinks(traversed) {
    traversed.set(this, this)
    let errors = []
    for (let i = 0; i < this.keys.length; i++) {
      const k = this.keys[i]
      const t = this.baseType[k]
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

const getUnionName = (elements) => {
  return ('(' +
    Object.keys(elements)
      .map(baseType => elements[baseType].name)
      .join(' | ') +
    ')')
}
export const taggedUnion = (elements, discr, name = getUnionName(elements)) => {
  for (let key in elements) {
    if (elements[key] instanceof ObjectTypeC) {
      if (!elements[key].keys.includes(discr)) {
        throw new Error('Invalid value of discriminator')
      }
    }
  }
  return new TaggedUnionTypeC(name, discr, elements)
}
//# sourceMappingURL=TaggedUnionType.js.map
