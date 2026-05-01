// https://luckylibora.medium.com/typescript-method-decorators-in-depth-problems-and-solutions-74387d51e6a

import { Any } from "aelastics-types";
import { IModelElement } from "generic-metamodel";
import { ExprNode } from "../jsx/element";
import { abstractM2M } from "./abstractM2M";
import {
  __isSpecPoint,
  guardSpecPoint,
  guardSpecOption,
  registerPointDecorator,
  appendDecoratorHistory,
  recordDecorator,
} from "./decorator-guards";

// https://stackoverflow.com/questions/55179461/reflection-in-javascript-how-to-intercept-an-object-for-function-enhancement-d

const __SpecPoint = "__SpecPoint";

export interface ISpecOption {
  specMethod: string;
  inputType: Any;
}

/**
 * Method decorator — marks a transformation rule as a specialization point.
 *
 * Required decorator ordering (when combined with @E2E):
 *
 *   @E2E()          ← outer (applied second) — handles tracing
 *   @SpecPoint()    ← inner (applied first)  — handles specialization
 *   Entity2Table(e: IEntity) { ... }
 *
 * @E2E must be outermost so it sees the final specialized result.
 * Placing @SpecPoint above @E2E will throw an error at decoration time.
 */
export const SpecPoint = () => {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    // Detect incorrect ordering: if descriptor.value is already an @E2E wrapper,
    // then @SpecPoint is being applied AFTER @E2E (SpecPoint is outer, E2E is inner).
    // Also guards against @SpecPoint + @VarPoint combination.
    guardSpecPoint(descriptor.value, propertyKey);

    // Read from descriptor.value (not target[propertyKey]) to preserve any inner decorator wrappers.
    const original: (...a: any[]) => ExprNode<any> = descriptor.value;

    descriptor.value = function (this: abstractM2M<any, any>, ...args: any[]) {
      const a: IModelElement = args[0];
      const aType = this.context.store.getTypeOf(a);

      // TODO handle subtyping of specPoints(VarPoints). It is needed to combine options from subtype and supertype
      const options: ISpecOption[] = (this as any)[__SpecPoint][propertyKey];
      const option = options?.find((option) => {
        return option.inputType.isOfType(aType);
      });
      
      if (!option) {
        throw new Error(`No specialized method found`);
      }

      // TODO handle if orgResult and specResult are arrays
      // TODO check typing for orgResults and specResult correspondingly

      // get result form original method
      let orgResult = original.apply(this, args);
      // get result from specialized method
      let specResult: ExprNode<IModelElement> = (this as any)[option.specMethod](
        ...args
      );
      // connect corresponding results (elements)
      orgResult.subElement = specResult;
      orgResult.isAbstract = true;

      // Signal to @E2E (outer) that specialization occurred — analogous to VarPoint's lastVarResolution
      this.context.lastSpecResolution = {
        optionName: option.specMethod,
        sourceTypeName: aType.name,
      };

      // return result from original method
      return orgResult;
    };

    // Mark the wrapper so @E2E can detect at decoration time that this method is a SpecPoint
    (descriptor.value as any)[__isSpecPoint] = true;
    appendDecoratorHistory(original, descriptor.value, "SpecPoint");

    // added because in composition of decorator, descriptor will be another decorator, not a function
    target[__SpecPoint] = { ...target[__SpecPoint], [propertyKey]: [] };

    return descriptor;
  };
};

// method decorator
export const SpecOption = (methodName: string, type: Any) => {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    // @SpecOption must not be placed above @E2E — would cause duplicate trace entries.
    guardSpecOption(descriptor.value, propertyKey)

    const method: Function = target[__SpecPoint][methodName];
    // @ts-ignore
    if (method) {
      let o: ISpecOption = {
        specMethod: propertyKey,
        inputType: type,
      };
      // @ts-ignore
      method.push(o);
    }
    recordDecorator(descriptor.value, "SpecOption", { specPointMethod: methodName })
    return descriptor;
  };
};

// ─── Self-registration ────────────────────────────────────────────────────────
// @SpecPoint registers as a point decorator so @E2E can trace it without
// hardcoded sentinel references.
registerPointDecorator({
  sentinel: __isSpecPoint,
  getResolution: (ctx: { lastSpecResolution: any; }) => ctx.lastSpecResolution,
  clearResolution: (ctx: { lastSpecResolution: undefined; }) => { ctx.lastSpecResolution = undefined },
  makeTrace: (ctx, source, elements, ruleName, resolution) => {
    ctx.makeTrace(source, elements, ruleName, "SpecializationPoint",
      undefined, undefined, resolution.optionName, resolution.sourceTypeName)
  },
})


