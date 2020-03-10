/*
 * Copyright (c) AelasticS 2019.
 *
 */

import {
  appendPath,
  Error,
  Errors,
  failure,
  failures,
  isFailure,
  Path,
  success,
  Result
} from 'aelastics-result'
import { ObjectType, Props, ObjectTypeC } from './ObjectType'
import { Any, DtoTypeOf, TypeOf } from '../common/Type'
import { ComplexTypeC } from './ComplexType'
import { LiteralTypeC } from '../simple-types/Literal'

// export type TaggedProps<Tag extends string> = { [K in Tag]: LiteralTypeC<Tag> }

const findTypeFromDiscriminator = (d: string, t: Props): Any | undefined => {
  for (const key in t) {
    if (key === d) {
      return t[key]
    }
  }
  return undefined
}

export class TaggedUnionTypeC<Tag extends string, P extends Props> extends ComplexTypeC<
  P,
  TypeOf<P[keyof P]>,
  DtoTypeOf<P[keyof P]>
> {
  public readonly _tag: 'TaggedUnion' = 'TaggedUnion'
  public readonly keys = Object.keys(this.baseType)

  constructor(name: string, readonly discriminator: string, elements: P) {
    super(name, elements)
  }

  public validate(value: TypeOf<this>, path: Path = []): Result<boolean> {
    const instance = value[this.discriminator]
    if (!instance) {
      return failure(
        new Error(
          `Value ${path}: '${value}' is not a proper union, no discriminator property: '${this.discriminator}'`
        )
      )
    } else {
      const type = findTypeFromDiscriminator(instance, this.baseType)
      if (!type) {
        return failure(
          new Error(
            `Value ${path}: '${value}' - there is no type in tagged union named: '${instance}'`
          )
        )
      } else {
        const errors: Errors = []
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

  public fromDTO(input: DtoTypeOf<P[keyof P]>, path: Path = []): Result<P[keyof P]> {
    const errors: Errors = []

    const instance = input[this.discriminator]
    if (!instance) {
      return failure(
        new Error(
          `Value ${path}: '${input}' is not a proper union, no discriminator property: '${this.discriminator}'`
        )
      )
    } else {
      const type = findTypeFromDiscriminator(instance, this.baseType)
      if (!type) {
        return failure(
          new Error(
            `Value ${path}: '${input}' - there is no type in tagged union named: '${instance}'`
          )
        )
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

  public toDTO(
    input: TypeOf<this>,
    path: Path = [],
    validate: boolean = true
  ): Result<DtoTypeOf<P[keyof P]>> {
    // const errors: Errors = [];
    if (validate) {
      const res = this.validate(input, path)
      if (isFailure(res)) {
        return failures(res.errors)
      }
    }

    const instance = input[this.discriminator]
    if (!instance) {
      return failure(
        new Error(
          `Value ${path}: '${input}' is not a proper union, no discriminator property: '${this.discriminator}'`
        )
      )
    } else {
      const type = findTypeFromDiscriminator(instance, this.baseType)
      if (!type) {
        return failure(
          new Error(
            `Value ${path}: '${input}' - there is no type in tagged union named: '${instance}'`
          )
        )
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

  validateLinks(traversed: Map<Any, Any>): Result<boolean> {
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

const getUnionName = <U extends Props>(elements: U): string => {
  return (
    '(' +
    Object.keys(elements)
      .map(baseType => elements[baseType].name)
      .join(' | ') +
    ')'
  )
}

export const taggedUnion = <P extends Props>(
  elements: P,
  discr: string,
  name: string = getUnionName(elements)
): TaggedUnionTypeC<string, P> => {
  for (let key in elements) {
    if (elements[key] instanceof ObjectTypeC) {
      if (!((elements[key] as unknown) as ObjectTypeC<Props>).keys.includes(discr)) {
        throw new Error('Invalid value of discriminator')
      }
    }
  }

  return new TaggedUnionTypeC(name, discr, elements)
}

export type TaggedProps<Tag extends string> = { [K in Tag]: LiteralTypeC<any> }

export type Tagged<Tag extends string> = ObjectType<TaggedProps<Tag>>
