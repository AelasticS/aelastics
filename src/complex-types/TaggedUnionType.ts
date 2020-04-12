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
  Result,
  success,
  ValidationError,
  validationError
} from 'aelastics-result'
import { ObjectTypeC, Props } from './ObjectType'
import { Any, ConversionContext, DtoTypeOf, TypeOf } from '../common/Type'
import { ComplexTypeC, InstanceReference } from './ComplexType'
import { TypeInstancePair, VisitedNodes } from '../common/VisitedNodes'

// export type TaggedProps<Tag extends string> = { [K in Tag]: LiteralTypeC<Tag> }

const findTypeFromDiscriminator = (d: string, t: Props): Any | undefined => {
  for (const key in t) {
    if (key === d) {
      return t[key]
    }
  }
  return undefined
}

type DtoTaggedUnionType<P extends Props> = {
  ref: InstanceReference
  taggedUnion: DtoTypeOf<P[keyof P]>
}

export class TaggedUnionTypeC<P extends Props> extends ComplexTypeC<
  P,
  TypeOf<P[keyof P]>,
  DtoTaggedUnionType<P>,
  DtoTypeOf<P[keyof P]>
> {
  public readonly _tag: 'TaggedUnion' = 'TaggedUnion'
  public readonly keys = Object.keys(this.baseType)

  constructor(name: string, readonly discriminator: string, elements: P) {
    super(name, elements)
  }
  validateCyclic(
    value: TypeOf<P[keyof P]>,
    path: Path = [],
    traversed: VisitedNodes
  ): Result<boolean> {
    let pair: TypeInstancePair = [this, value]

    if (traversed.has(pair)) {
      return success(true)
    }

    traversed.set(pair)

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
        const typeValidation = type.validateCyclic(value, path, traversed)
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

  makeInstanceFromDTO(
    input: DtoTypeOf<P[keyof P]> | DtoTaggedUnionType<P>,
    path: Path,
    context: ConversionContext
  ): TypeOf<P[keyof P]> {
    let inputObject
    let discrValue
    if (this.isTaggedUnionRef(input)) {
      inputObject = input.taggedUnion
      discrValue = inputObject.object[this.discriminator]
    } else {
      inputObject = input
      discrValue = inputObject[this.discriminator]
    }
    if (!discrValue) {
      context.errors.push(
        validationError(
          `Value ${path}: '${input}' is not a proper union, no discriminator property: '${this.discriminator}'`,
          path,
          this.name,
          input
        )
      )
      return undefined
    } else {
      const type = findTypeFromDiscriminator(discrValue, this.baseType)
      if (!type) {
        validationError(
          `Value ${path}: '${input}' - there is no type in tagged union named: '${discrValue}'`,
          path,
          this.name,
          input
        )
        return undefined
      }
      return type.fromDTOCyclic(
        inputObject,
        appendPath(path, discrValue, type.name, input),
        context
      )
    }
  }

  // makeInstanceFromDTO1(
  //   //   input: DtoTaggedUnionType<P>,
  //   //   path: Path,
  //   //   context: ConversionContext
  //   // ): TypeOf<P[keyof P]> {
  //   //   const instance = input.taggedUnion[this.discriminator]
  //   //   if (!instance) {
  //   //     context.errors.push(
  //   //       validationError(
  //   //         `Value ${path}: '${input}' is not a proper union, no discriminator property: '${this.discriminator}'`,
  //   //         path,
  //   //         this.name,
  //   //         input
  //   //       )
  //   //     )
  //   //     return undefined
  //   //   } else {
  //   //     const type = findTypeFromDiscriminator(instance, this.baseType)
  //   //     if (!type) {
  //   //       validationError(
  //   //         `Value ${path}: '${input}' - there is no type in tagged union named: '${instance}'`,
  //   //         path,
  //   //         this.name,
  //   //         input
  //   //       )
  //   //       return undefined
  //   //     }
  //   //     return type.fromDTOCyclic(input, appendPath(path, instance, type.name, input), context)
  //   //   }
  //   // }

  makeDTOInstance(
    input: TypeOf<P[keyof P]>,
    path: Path,
    context: ConversionContext
  ): DtoTypeOf<P[keyof P]> | DtoTaggedUnionType<P> {
    let output: DtoTypeOf<P[number]> | DtoTaggedUnionType<P>
    let outputTaggedUnion: DtoTypeOf<P[number]> = {} as DtoTypeOf<P[number]>
    const instance = input[this.discriminator]
    if (!instance) {
      validationError(
        `Value ${path}: '${input}' is not a proper union, no discriminator property: '${this.discriminator}'`,
        path,
        this.name,
        input
      )
      return undefined
    } else {
      const type = findTypeFromDiscriminator(instance, this.baseType)
      if (!type) {
        validationError(
          `Value ${path}: '${input}' - there is no type in tagged union named: '${instance}'`,
          path,
          this.name,
          input
        )
        return undefined
      } else {
        outputTaggedUnion = type.toDTOCyclic(
          input,
          appendPath(path, instance, type?.name, input),
          context
        )
        if (context.options.isTreeDTO) {
          output = outputTaggedUnion
        } else {
          output = {
            ref: this.makeReference(input, context),
            taggedUnion: outputTaggedUnion
          }
        }
        return output
      }
    }
  }

  // makeDTOInstance1(
  //   input: TypeOf<P[keyof P]>,
  //   path: Path,
  //   context: ConversionContext
  // ): DtoTaggedUnionType<P> {
  //   const output: DtoTaggedUnionType<P> = {
  //     ref: this.makeReference(input, context),
  //     taggedUnion: undefined
  //   }
  //   const instance = input[this.discriminator]
  //   if (!instance) {
  //     validationError(
  //       `Value ${path}: '${input}' is not a proper union, no discriminator property: '${this.discriminator}'`,
  //       path,
  //       this.name,
  //       input
  //     )
  //     return output
  //   } else {
  //     const type = findTypeFromDiscriminator(instance, this.baseType)
  //     if (!type) {
  //       validationError(
  //         `Value ${path}: '${input}' - there is no type in tagged union named: '${instance}'`,
  //         path,
  //         this.name,
  //         input
  //       )
  //       return output
  //     }
  //     output.taggedUnion = type.toDTOCyclic(
  //       instance,
  //       appendPath(path, instance, type?.name, input),
  //       context
  //     )
  //     return output
  //   }
  // }

  protected isTaggedUnionRef(input: any): input is DtoTaggedUnionType<P> {
    if (input.ref && input.taggedUnion) {
      return true
    }
    return false
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
): TaggedUnionTypeC<P> => {
  for (let key in elements) {
    let elem = elements[key]
    if (elem instanceof ObjectTypeC) {
      let [keys, types, len] = elem.getPropsInfo()
      if (!keys.includes(discr)) {
        throw new Error('Invalid value of discriminator')
      }
    }
  }
  return new TaggedUnionTypeC(name, discr, elements)
}

/*
export type TaggedProps<Tag extends string> = { [K in Tag]: LiteralTypeC<any> }
export type Tagged<Tag extends string> = ObjectType<TaggedProps<Tag>>
*/
