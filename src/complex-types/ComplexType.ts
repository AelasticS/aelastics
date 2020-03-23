/*
 * Copyright (c) AelasticS 2019.
 */

import { ConversionContext, InstanceReference, TypeC } from '../common/Type'
import { Error, Path } from 'aelastics-result'

/**
 *  Complex type: a structure which is derived from some type P
 */
export abstract class ComplexTypeC<P, T extends any, D extends any = T> extends TypeC<T, D> {
  constructor(name: string, readonly baseType: P) {
    super(name)
  }

  /**
   *  can return:
   *  1- reference, if already serialized and in cache
   *  2 - DTO value, if not serialized before
   *  3 - error, if only tree structure are only allowed
   *    type serialzeResult = [1|2|3, InstanceReference, any]
   * @param input
   * @param path
   * @param visitedNodes
   * @param errors
   * @param context
   */

  public serialize(
    input: any,
    path: Path,
    visitedNodes: Map<any, any>,
    errors: Error[],
    context: ConversionContext
  ): InstanceReference | undefined {
    let ref = visitedNodes.get(input)
    if (ref) {
      if (!(context.typeInfo && context.generateID)) {
        errors.push(
          new Error(
            `Input data is graph. Value ${path}: '${input}' of type '${this.name}' has more then one reference!`
          )
        )
        return undefined
      }
    } else {
      let ref = this.makeReference(input, context)
      visitedNodes.set(input, ref)
      return ref
    }
  }

  public deserialize(
    input: any,
    path: Path,
    visitedNodes: Map<any, any>,
    errors: Error[],
    context: ConversionContext
  ): any {
    let ref = this.getReference(input, context)
    if (!ref) {
    } else {
      let output = visitedNodes.get(ref.id)
    }
    if (output !== undefined) {
      return output
    } else {
      output = this.getReference(ref)
      visitedNodes.set(ref.id, output)
    }
  }
}
