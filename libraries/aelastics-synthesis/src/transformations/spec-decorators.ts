// https://luckylibora.medium.com/typescript-method-decorators-in-depth-problems-and-solutions-74387d51e6a

import { Any } from "aelastics-types";
import { IModelElement } from "generic-metamodel";
import { Element } from "../jsx/element";
import { abstractM2M } from "./abstractM2M";

// https://stackoverflow.com/questions/55179461/reflection-in-javascript-how-to-intercept-an-object-for-function-enhancement-d

const __SpecPoint = "__SpecPoint";

export interface ISpecOption {
  specMethod: string;
  inputType: Any;
}

// method decorator
export const SpecPoint = () => {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    // save original method
    const original: (...a: any[]) => Element<any> = target[propertyKey];
    descriptor.value = function (this: abstractM2M<any, any>, ...args: any[]) {
      const a: IModelElement = args[0];
      const aType = this.context.store.getTypeOf(a);
      const options: ISpecOption[] = descriptor.value[__SpecPoint];
      const option = options.find((option) => {
        return option.inputType.isOfType(aType);
      });
      if (!option) {
        throw new Error(`No specilized method found`);
      }

      // TODO handle if orgResult and specResult are arrays
      // TODO check typing for orgResults and specResult correspondingly

      // get result form original method
      let orgResult = original.apply(this, args);
      // get result from specialized method
      let specResult: Element<IModelElement> = (this as any)[option.specMethod](
        ...args
      );
      // connect corresponding results(elemnets)
      orgResult.subElement = specResult;
      orgResult.isAbstract = true;
      // return result fofromrm original method
      return orgResult;
    };
    //descriptor.value[__SpecPoint] = name
    descriptor.value[__SpecPoint] = [];
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
    const method: Function = target[methodName];
    // @ts-ignore
    if (method[__SpecPoint]) {
      let o: ISpecOption = {
        specMethod: propertyKey,
        inputType: type,
      };
      // @ts-ignore
      method[__SpecPoint].push(o);
    }
    return descriptor;
  };
};
