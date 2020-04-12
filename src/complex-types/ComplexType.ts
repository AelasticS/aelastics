/*
 * Copyright (c) AelasticS 2019.
 */

import { ConversionContext, InstanceReference, TypeC } from '../common/Type'
import { Path, validationError } from 'aelastics-result'

/**
 *  Complex type: a structure which is derived from some type P
 */
export abstract class ComplexTypeC<
  P,
  V extends any,
  G extends any = V,
  T extends any = V
> extends TypeC<V, G, T> {
  constructor(name: string, readonly baseType: P) {
    super(name)
  }

  get category(): string {
    // @ts-ignore
    return this['_tag']
  }

  public makeReference(input: any, context: ConversionContext): InstanceReference {
    return {
      typeName: this.name,
      category: this.category,
      id: ++context.counter
    }
  }

  public getReference(input: any, context: ConversionContext): InstanceReference | undefined {
    return input.ref
  }

  abstract makeDTOInstance(input: V, path: Path, context: ConversionContext): T | G

  abstract makeInstanceFromDTO(input: T | G, path: Path, context: ConversionContext): V

  toDTOCyclic(input: V, path: Path, context: ConversionContext): T | G {
    let output = context.visitedNodes.get(input)
    if (output) {
      if (!(context.options.includeTypeInfo && context.options.isTreeDTO)) {
        context.errors.push(
          validationError(
            `Input data is graph. Value ${path}: '${input}' of type '${this.name}' has more then one reference!`,
            path,
            this.name
          )
        )
      }
      return output
    } else {
      output = this.makeDTOInstance(input, path, context)
      context.visitedNodes.set(input, this.getReference(output, context))
    }
    return output
  }

  fromDTOCyclic(value: T | G, path: Path, context: ConversionContext): V {
    let ref = this.getReference(value, context)
    let output = context.visitedNodes.get(ref)

    if (output) {
      if (!(context.options.includeTypeInfo && context.options.isTreeDTO)) {
        // should be tree, not graph
        context.errors.push(
          validationError(
            `Input data is graph. Value ${path}: '${value}' of type '${this.name}' has more then one reference!`,
            path,
            this.name
          )
        )
      }
      return output
    } else {
      // an instance not visited before
      let output = this.makeInstanceFromDTO(value, path, context)
      if (output) {
        if (!(context.options.includeTypeInfo && context.options.isTreeDTO)) {
          context.errors.push(
            validationError(
              `Input data is graph. Value ${path}: '${value}' of type '${this.name}' has more then one reference!`,
              path,
              this.name
            )
          )
        }
      } else {
        context.visitedNodes.set(this.getReference(value, context)?.id, output)
      }
      return output
    }
  }
}
