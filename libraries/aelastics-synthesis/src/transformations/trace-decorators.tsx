/** @jsx createExprNode */
/*
 * Copyright (c) AelasticS 2022.
 */

import { abstractM2M, IM2M } from "./abstractM2M"
import { IModel } from "generic-metamodel"
import { CpxTemplate, ExprNode, ResolveElement } from "../jsx/element"
import { AnySchema } from "aelastics-types/lib/annotations/Annotation"
import { Sec } from "../m2t"
import { IConfigurationModel } from "../decisions/3.configuration-model/configuration-meta.model"
import * as tmC from "./../decisions/8.trace-model/trace-model-meta.model-components"


type Class<T = any> = new (...args: any[]) => T;

// Class decorator — parameter-free
export const M2M = () => {
  return function <T extends Class<IM2M<any, any, any, any, any>>>(target: T): T {
    const transformationName = target.name

    const decorated = class extends target {
      constructor(...args: any[]) {
        super(...args)
      }
    }
    return decorated as unknown as T
  }
}

// Sentinel used by @SpecPoint/@VarPoint to detect incorrect ordering (they must not wrap @E2E).
export const __isE2E = "__isE2E"

// Sentinel set by @VarPoint on its wrapper function so that @E2E can detect at decoration time
// whether the method itself is a VarPoint (both decorators present → VariabilityPoint trace).
export const __isVarPoint = "__isVarPoint"

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

    // Determine at decoration time whether this method is ALSO a @VarPoint.
    // When @E2E is outer (wraps @VarPoint), @VarPoint runs first and marks its wrapper with __isVarPoint.
    // Only methods that are themselves VarPoints should be traced as "VariabilityPoint".
    // Methods that merely call VarPoints internally (e.g. Attribute2Column calling applyNaming)
    // are always "RegularRule".
    const isAlsoVarPoint = !!(original as any)[__isVarPoint]

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

        // Infer types from runtime objects
        const fromType = this.context.store.getTypeOf(sourceModelElement)
        // Use type of first element (all should be same type)
        const toType = traceableElements[0].type

        // Read and always clear lastVarResolution to prevent leak
        const varRes = this.context.lastVarResolution
        this.context.lastVarResolution = undefined

        // Trace as "VariabilityPoint" ONLY when this method itself is both @E2E and @VarPoint.
        // If this method only has @E2E (e.g. Attribute2Column), inner VarPoint calls
        // (e.g. applyNaming, primaryKeyStrategy) may have set lastVarResolution,
        // but we ignore it — such methods are always "RegularRule".
        if (isAlsoVarPoint && varRes !== undefined) {
          this.context.makeTrace(
            sourceModelElement, traceableElements, propertyKey,
            "VariabilityPoint", varRes.optionName, varRes.choices,
          )
        } else {
          this.context.makeTrace(
            sourceModelElement, traceableElements, propertyKey, "RegularRule",
          )
        }

        return result
      }
      // Mark the wrapper so @SpecPoint/@VarPoint can detect incorrect ordering
    ;(wrapped as any)[__isE2E] = true
    descriptor.value = wrapped
    return descriptor
  }
}