/** @jsx createExprNode */
/*
 * Copyright (c) AelasticS 2022.
 */

import { abstractM2M, IM2M } from "./abstractM2M"
import { IModel } from "generic-metamodel"
import { ExprNode, ResolveElement } from "../jsx/element"
import { IConfigurationModel } from "../decisions/3.configuration-model/configuration-meta.model"
import {
  __isVarPoint,
  __isSpecPoint,
  guardE2E,
  findPointRegistration,
  consumePointResolutions,
  appendDecoratorHistory,
} from "./decorator-guards"

// Re-export point sentinels — used by point decorators to stamp their wrappers
export { __isVarPoint, __isSpecPoint }

type Class<T = any> = new (...args: any[]) => T;

// Class decorator — parameter-free
export const M2M = () => {
  return function <T extends Class<IM2M<any, any, any, any, any>>>(target: T): T {
    const decorated = class extends target {
      constructor(...args: any[]) {
        super(...args)
      }
    }
    return decorated as unknown as T
  }
}

/**
 * Method decorator — adds end-to-end tracing to a transformation rule.
 *
 * @E2E must always be the outermost decorator so it sees the final result:
 *
 *   @E2E()                               ← outer: traces the final result
 *   @SpecPoint() / @VarPoint("issue")    ← inner: specialization / variability
 *   method(e: IEntity) { ... }
 *
 * Placing @SpecPoint or @VarPoint above @E2E will throw an error at decoration time.
 */
export const E2E = function() {
  return function <DM extends IConfigurationModel | never = never>(
    target: abstractM2M<IModel, IModel, any, DM, any>,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const original = descriptor.value

    guardE2E(original, propertyKey)

    // Detect at decoration time whether a point decorator (@VarPoint, @SpecPoint, …)
    // is present. Uses the registry — no hardcoded sentinel references.
    const pointReg = findPointRegistration(original)

    const wrapped = function(this: abstractM2M<any, any, any, DM>, ...args: any[]) {
        let sourceModelElement = args[0]

        let result = original.apply(this, args) as ExprNode<any> | ExprNode<any>[] | null
        if (!result) return null

        // Normalize result to array
        const jsxElements: ExprNode<any>[] = Array.isArray(result) ? result : [result]
        if (jsxElements.length === 0) return null

        // Filter out ResolveElements — they should not be traced
        const traceableElements = jsxElements.filter(el => !(el instanceof ResolveElement))
        if (traceableElements.length === 0) return result

        // Consume ALL point resolutions (clears leaks from internally nested calls).
        // Returns only the resolution belonging to our registered point decorator.
        const resolution = pointReg
          ? consumePointResolutions(this.context, pointReg)
          : undefined

        if (pointReg && resolution !== undefined) {
          // Delegate to the point decorator's own makeTrace implementation
          pointReg.makeTrace(this.context, sourceModelElement, traceableElements, propertyKey, resolution)
        } else {
          this.context.makeTrace(sourceModelElement, traceableElements, propertyKey, "RegularRule")
        }

        return result
      }
      // Mark the wrapper so @SpecPoint/@VarPoint can detect incorrect ordering
    appendDecoratorHistory(original, wrapped, "E2E")
    descriptor.value = wrapped
    return descriptor
  }
}