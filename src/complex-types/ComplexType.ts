/*
 * Copyright (c) AelasticS 2019.
 */

import { ConversionContext, InstanceReference, TypeC } from '../common/Type'
import { Error, Path } from 'aelastics-result'
import { ObjectType } from './ObjectType'

/**
 *  Complex type: a structure which is derived from some type P
 */
export abstract class ComplexTypeC<P, T extends any, D extends any = T> extends TypeC<T, D> {
  constructor(name: string, readonly baseType: P) {
    super(name)
  }

  public handleGraph(
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
      let ref = this.makeReference(input, ++context.counter)
      visitedNodes.set(input, ref)
      return ref
    }
  }
}
