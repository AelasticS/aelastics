// https://luckylibora.medium.com/typescript-method-decorators-in-depth-problems-and-solutions-74387d51e6a

import { Any } from "aelastics-types";
import { abstractM2M, M2MContext, _privatePop, _privatePush } from "../transformations/abstractM2M";
import * as tcM from "../decisions/3.transformation-configuration/transformation-configuration-meta.model"; // import decision model types for decision model transformation

// https://stackoverflow.com/questions/55179461/reflection-in-javascript-how-to-intercept-an-object-for-function-enhancement-d

const __VarPoint = "__VarPoint";

interface IOption {
  methodName: string;
  evalCondition: (...args: any[]) => boolean;
}

export interface IVarOption {
  varMethod: string;
  evalFun: (
    inputElem: Any,
    annotElem: any,
    transform: abstractM2M<any, any>
  ) => boolean;
  default: boolean;
}

// method decorator
export const VarPoint = () => {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    descriptor.value = function (...args: any[]) {
      const options: IOption[] = descriptor.value[propertyKey];

      const element = args[0];

      var selectedOptions: tcM.ISelectedOption[] = (this as abstractM2M<any, any, any, tcM.ITransformationConfigurationModel>).decisionModel?.decisions
        .filter((d: tcM.IDecisionForElement) => d.elementId === element.id)
        .flatMap((d: tcM.IDecisionForElement) => d.selectedOptions) || [] as tcM.ISelectedOption[];

      (this as abstractM2M<any, any, any, tcM.ITransformationConfigurationModel>).context.currendElementDecision[_privatePush](selectedOptions);

      const option = options.find((option) => {
        return option.evalCondition(selectedOptions);
      });

      if (!option) {
        throw new Error(`No option condition evaluated to true`);
      }
      let result = (this as any)[option.methodName](...args);

      (this as abstractM2M<any, any, any, tcM.ITransformationConfigurationModel>).context.currendElementDecision[_privatePop]();

      return result;
    };
    descriptor.value[__VarPoint] = propertyKey;
    descriptor.value[propertyKey] = [];
    return descriptor;
  };
};

// method decorator
export const VarOption = (
  methodName: string,
  condition: (...args: any[]) => boolean,
  defaultValue: boolean = false
) => {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const method: Function = target[methodName];
    // @ts-ignore
    if (method[__VarPoint]) {
      let o: IOption = {
        methodName: propertyKey,
        evalCondition: condition,
      };
      // @ts-ignore
      method[method[__VarPoint]].push(o);
    }
    return descriptor;
  };
};
