/*
 * Copyright (c) AelasticS 2019.
 */

import { ConversionContext, InstanceReference, TypeC } from '../common/Type'
import { Error, Path } from 'aelastics-result'
import { DtoObjectType, ObjectType } from './ObjectType'

/**
 *  Complex type: a structure which is derived from some type P
 */
export abstract class ComplexTypeC<P, T extends any, D extends any = T> extends TypeC<T, D> {
  constructor(name: string, readonly baseType: P) {
    super(name)
  }

  abstract makeInstanceDTO(
    input: T,
    path: Path,
    visitedNodes: Map<any, any>,
    errors: Error[],
    context: ConversionContext
  ): D

  abstract makeInstanceFromDTO(
    input: D,
    path: Path,
    visitedNodes: Map<any, any>,
    errors: Error[],
    context: ConversionContext
  ): T

  toDTOCyclic(
    input: T,
    path: Path,
    visitedNodes: Map<any, any>,
    errors: Error[],
    context: ConversionContext
  ): D | InstanceReference {
    let output = visitedNodes.get(input)
    if (output) {
      if (!(context.typeInfo && context.generateID)) {
        errors.push(
          new Error(
            `Input data is graph. Value ${path}: '${input}' of type '${this.name}' has more then one reference!`
          )
        )
      }
      return output
    } else {
      output = this.makeInstanceDTO(input, path, visitedNodes, errors, context)
      visitedNodes.set(input, this.getReference(output, context))
    }
    return output
  }

  fromDTOCyclic(
    value: any,
    path: Path,
    visitedNodes: Map<any, any>,
    errors: Error[],
    context: ConversionContext
  ): T {
    if (this.isReference(value, context)) {
      // a reference to a visited instance, should be in visitedNodes
      let output = visitedNodes.get(value)
      if (output) {
        if (!(context.typeInfo && context.generateID)) {
          errors.push(
            new Error(
              `Input data is graph. Value ${path}: '${value}' of type '${this.name}' has more then one reference!`
            )
          )
        }
      } else {
        errors.push(
          new Error(
            `Value ${path}: '${value}' of type '${this.name}' is a reference to an object that does not exist!`
          )
        )
      }
      return output
    } else {
      // an instance
      let output = this.makeInstanceFromDTO(value, path, visitedNodes, errors, context)
      if (output) {
        if (!(context.typeInfo && context.generateID)) {
          errors.push(
            new Error(
              `Input data is graph. Value ${path}: '${value}' of type '${this.name}' has more then one reference!`
            )
          )
        }
      } else {
        visitedNodes.set(this.getReference(value, context), output)
      }
      return output
    }
  }
}
