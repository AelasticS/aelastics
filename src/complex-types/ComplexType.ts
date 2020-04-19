/*
 * Copyright (c) AelasticS 2019.
 */

import { ToDtoContext, InstanceReference, TypeC, FromDtoContext, Any } from '../common/Type'
import { Path, validationError } from 'aelastics-result'
import { TraversalContext } from '../common/TraversalContext'
import { TypeInstancePair, VisitedNodes } from '../common/VisitedNodes'
import { SimpleTypeC } from '../simple-types/SimpleType'

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

  get categoryCamelCase(): string {
    // @ts-ignore
    let str: string = this['_tag'] as string
    str = str.charAt(0).toLowerCase() + str.substring(1, str.length)
    return str
  }

  abstract makeDTOInstance(input: V, ref: InstanceReference, path: Path, context: ToDtoContext): T

  abstract makeInstanceFromDTO(input: T, empty: V, path: Path, context: FromDtoContext): void

  public retrieveRefFromVisited<S, T>(key: S, visitedNodes: VisitedNodes<TypeC<any>, S, T>): T {
    let ref = visitedNodes.get([this, key])
    if (ref === undefined) {
      throw new Error(
        `System Error in retrieveRefFromVisited: not in VisitedNodes for type '${this.name}'!`
      )
    } else return ref as any
  }

  public makeReference(input: any, context: ToDtoContext): InstanceReference {
    return {
      typeName: this.name,
      category: this.categoryCamelCase,
      id: ++context.counter
    }
  }

  public abstract makeEmptyInstance(value: T | G, path: Path, context: FromDtoContext): V

  protected getRefFromNode(input: any): InstanceReference {
    return input.ref === undefined ? 0 : input.ref
  }

  toDTOCyclic(input: V, path: Path, context: ToDtoContext): T | G {
    let outputRef = context.visitedNodes.get([this, input])
    if (outputRef) {
      if (context.options.isTreeDTO) {
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
      let ref = this.makeReference(input, context)
      context.visitedNodes.set([this, input], ref)
      output = this.makeDTOInstance(input, ref, path, context)
      if (!context.options.isTreeDTO) {
        let res = {} as G
        res.ref = ref
        res[this.categoryCamelCase] = output
        return res
      } else {
        return output
      }
    }
  }

  fromDTOCyclic(value: T | G, path: Path, context: FromDtoContext): V {
    // test if it is graph or tree!
    if (context.options.isTreeDTO === false) {
      // graph!
      let ref = this.getRefFromNode(value)
      let output = context.visitedNodes?.get([this, ref.id])
      if (output) {
        // already in cache
        return output
      } else {
        // put output in cache
        output = this.makeEmptyInstance(value, path, context)
        let ref = this.getRefFromNode(value)
        context.visitedNodes?.set([this, ref.id], output)
        this.makeInstanceFromDTO(
          (value as { [key: string]: any })[this.categoryCamelCase] as T,
          output,
          path,
          context
        )
        return output
      }
    } else {
      // tree!
      let output = this.makeEmptyInstance(value, path, context)
      this.makeInstanceFromDTO(value as T, output, path, context)
      return output
    }
  }

  protected abstract traverseChildren<R>(
    value: V,
    f: (type: Any, value: any, c: TraversalContext<R>) => R,
    context: TraversalContext<R>
  ): void

  traverseCyclic<R>(
    value: V,
    f: (type: Any, value: any, c: TraversalContext<R>) => R,
    context: TraversalContext<R>
  ): R {
    let pair: TypeInstancePair<Any, any> = [this, value]
    if (context.traversed.has(pair)) {
      return context.traversed.get(pair)
    }
    // before children
    let r: R = f(this, value, context)
    context.traversed.set(pair, r)
    this.traverseChildren(value, f, context)
    // after children
    r = f(this, value, context)
    context.traversed.set(pair, r)
    return r
  }
}
