// https://luckylibora.medium.com/typescript-method-decorators-in-depth-problems-and-solutions-74387d51e6a

import { abstractM2M, _privatePop, _privatePush } from "../transformations/abstractM2M"
// import * as tcM from "../decisions/3.transformation-configuration/transformation-configuration-meta.model";  // import decision model types for decision model transformation
import * as tcM from "./../decisions/3.configuration-model/configuration-meta.model"
import { EvalCondition, __OptionName, optionConditionFromName } from "./eval-operators"

// https://stackoverflow.com/questions/55179461/reflection-in-javascript-how-to-intercept-an-object-for-function-enhancement-d

const __VarPoint = "__VarPoint"
const __VarOptionRef = "__VarOptionRef"

interface IOption {
  methodName: string;
  evalCondition: EvalCondition;
  isDefault?: boolean;
}

// @deprecated - Koristi IOption umesto ovoga
// export interface IVarOption {
//   varMethod: string;
//   evalFun: (
//     inputElem: Any,
//     annotElem: any,
//     transform: abstractM2M<any, any>,
//   ) => boolean;
//   default: boolean;
// }

// method decorator
export const VarPoint = (
  issue: string
) => {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    // Inicijalizuj niz opcija
    descriptor.value[propertyKey] = []

    descriptor.value = function(...args: any[]) {
      const options: IOption[] = descriptor.value[propertyKey]

      const element = args[0]
      const currentContext = (this as abstractM2M<any, any, any, tcM.IConfigurationModel>).context

      var selectedOptions: tcM.IChoice[] = (this as abstractM2M<any, any, any, tcM.IConfigurationModel>).configModel?.decisions
        .filter((d: tcM.IDecision) => !currentContext.store.isTypeOf(d, tcM.ElementDecision) || (currentContext.store.isTypeOf(d, tcM.ElementDecision) && (d as unknown as tcM.IElementDecision).element.id === element.id))
        .flatMap((d: tcM.IDecision) => d.choices) || [] as tcM.IChoice[]

      currentContext.currendElementDecision[_privatePush](selectedOptions)

      const option = options.find((option) => {
        return !option.isDefault && option.evalCondition.call(this, selectedOptions, element, currentContext)
      })

      const fallbackOption = options.find((option) => option.isDefault)

      const selectedOption = option || fallbackOption

      if (!selectedOption) {
        throw new Error(`No option condition evaluated to true and no default option provided`)
      }
      let result = (this as any)[selectedOption.methodName](...args);

      (this as abstractM2M<any, any, any, tcM.IConfigurationModel>).context.currendElementDecision[_privatePop]()

      return result
    }
    descriptor.value[__VarPoint] = propertyKey
    return descriptor
  }
}

// method decorator
export const VarOption = (
  methodName: string,
  option?: EvalCondition
) => {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const method: Function = target[methodName]
    // @ts-ignore
    if (method[__VarPoint]) {
      const optionName = descriptor.value?.[__OptionName]
      const evalCondition = option || (optionName ? optionConditionFromName(optionName) : undefined)

      if (!evalCondition) {
        throw new Error(`VarOption("${methodName}") requires EvalCondition or @Option decorator`)
      }

      let o: IOption = {
        methodName: propertyKey,
        evalCondition: evalCondition,
      }
      // @ts-ignore
      method[method[__VarPoint]].push(o)

      // Čuvaj referencu na VarPoint metodu na ovoj metodi
      descriptor.value[__VarOptionRef] = methodName
    }
    return descriptor
  }
}

export const Default = () => {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    // Pronađi VarOption na istoj metodi
    const varOptionRef = descriptor.value[__VarOptionRef]

    if (varOptionRef) {
      // Pronađi VarPoint metodu koju referencira VarOption
      const varPointMethod: Function = target[varOptionRef]
      // @ts-ignore
      if (varPointMethod && varPointMethod[__VarPoint]) {
        // @ts-ignore
        const varPointPropertyKey = varPointMethod[__VarPoint]

        let defaultOption: IOption = {
          methodName: propertyKey,
          evalCondition: () => true,
          isDefault: true,
        }

        // @ts-ignore
        varPointMethod[varPointPropertyKey].push(defaultOption)
      }
    }

    return descriptor
  }
}
