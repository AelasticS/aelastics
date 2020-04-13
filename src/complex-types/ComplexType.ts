/*
 * Copyright (c) AelasticS 2019.
 */

import {
  ToDtoContext,
  InstanceReference,
  TypeC,
  FromDtoContext,
  ConversionContext
} from '../common/Type'
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

  public makeReference(input: any, context: ToDtoContext): InstanceReference {
    return {
      typeName: this.name,
      category: this.category,
      id: ++context.counter
    }
  }

  public getReference(input: any): InstanceReference {
    return input.ref === undefined ? 0 : input.ref
  }

  abstract makeDTOInstance(input: V, path: Path, context: ToDtoContext): T | G

  abstract makeInstanceFromDTO(input: T | G, path: Path, context: FromDtoContext): V

  toDTOCyclic(input: V, path: Path, context: ToDtoContext): T | G {
    let outputRef = context.visitedNodes.get([this, input])
    if (outputRef) {
      if (!context.options.isTreeDTO) {
        context.errors.push(
          validationError(
            `Input data is graph. Value ${path}: '${input}' of type '${this.name}' has more then one reference!`,
            path,
            this.name
          )
        )
      }
      return { ref: outputRef } as any
    } else {
      let output: T | G
      output = this.makeDTOInstance(input, path, context)
      context.visitedNodes.set([this, input], this.getReference(output))
      return output
    }
  }

  fromDTOCyclic(value: T | G, path: Path, context: FromDtoContext): V {
    // test if it is graph or tree!
    if (context.options.isTreeDTO === false) {
      // graph!
      let ref = this.getReference(value)
      let output = context.visitedNodes?.get([this, ref.id])
      if (output) {
        // already in cache
        return output
      } else {
        // put output in cache
        output = this.makeInstanceFromDTO(value, path, context)
        context.visitedNodes?.set([this, this.getReference(value).id], output)
        return output
      }
    } else {
      // tree!
      let output = this.makeInstanceFromDTO(value, path, context)
      return output
    }
  }
}
