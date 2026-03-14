// https://luckylibora.medium.com/typescript-method-decorators-in-depth-problems-and-solutions-74387d51e6a

import { abstractM2M, _privatePop, _privatePush } from "../transformations/abstractM2M"
// import * as tcM from "../decisions/3.transformation-configuration/transformation-configuration-meta.model";  // import decision model types for decision model transformation
import * as tcM from "./../decisions/3.configuration-model/configuration-meta.model"
import { EvalCondition } from "./eval-operators"

// https://stackoverflow.com/questions/55179461/reflection-in-javascript-how-to-intercept-an-object-for-function-enhancement-d

interface IOption {
  methodName: string
  evalCondition: EvalCondition
  isDefault?: boolean
}

const __VarPoint = "__VarPoint"
const __VarOptionRef = "__VarOptionRef"

type DecoratedMethod = ((this: any, ...args: any[]) => any) & {
  [__VarPoint]?: string
  [__VarOptionRef]?: string
  [key: string]: unknown
}

// Metadata lives on the function object itself so VarOption/Default can register against VarPoint.
const getVarPointPropertyKey = (method: DecoratedMethod | undefined): string | undefined => {
  return method?.[__VarPoint]
}

const getVarPointOptions = (method: DecoratedMethod | undefined): IOption[] | undefined => {
  const varPointPropertyKey = getVarPointPropertyKey(method)
  if (!method || !varPointPropertyKey) {
    return undefined
  }

  if (!Array.isArray(method[varPointPropertyKey])) {
    method[varPointPropertyKey] = []
  }

  return method[varPointPropertyKey] as IOption[]
}

// Ensures the method is marked as VarPoint and has an option bucket allocated.
const initializeVarPointMethod = (method: DecoratedMethod, propertyKey: string): DecoratedMethod => {
  method[__VarPoint] = propertyKey
  getVarPointOptions(method)
  return method
}

const setVarOptionReference = (method: DecoratedMethod, methodName: string): void => {
  method[__VarOptionRef] = methodName
}

const getVarOptionReference = (method: DecoratedMethod | undefined): string | undefined => {
  return method?.[__VarOptionRef]
}

// Option registration is centralized to keep VarOption and Default behavior identical.
const registerOption = (method: DecoratedMethod | undefined, option: IOption): void => {
  getVarPointOptions(method)?.push(option)
}

const resolveSelectedOptions = (
  transformation: abstractM2M<any, any, any, tcM.IConfigurationModel>,
  element: any,
): tcM.IChoice[] => {
  const currentContext = transformation.context
  const decisions = transformation.configModel?.decisions || []

  return decisions
    .filter(
      (d: tcM.IDecision) =>
        !currentContext.store.isTypeOf(d, tcM.ElementDecision)
        || (
          currentContext.store.isTypeOf(d, tcM.ElementDecision)
          && (d as unknown as tcM.IElementDecision).element.id === element.id
        ),
    )
    .flatMap((d: tcM.IDecision) => d.choices)
}

const evaluateOption = (
  option: IOption,
  context: {
    self: any
    selectedOptions: tcM.IChoice[]
    element: any
    currentContext: abstractM2M<any, any, any, tcM.IConfigurationModel>["context"]
  },
): boolean => {
  return option.evalCondition.call(
    context.self,
    context.selectedOptions,
    context.element,
    context.currentContext,
  )
}

const selectOption = (
  options: IOption[],
  context: {
    self: any
    selectedOptions: tcM.IChoice[]
    element: any
    currentContext: abstractM2M<any, any, any, tcM.IConfigurationModel>["context"]
  },
): IOption | undefined => {
  // First matching non-default option wins; otherwise use the default option if provided.
  const matchingOption = options.find((option) => !option.isDefault && evaluateOption(option, context))

  return matchingOption || options.find((option) => option.isDefault)
}

const invokeSelectedMethod = (self: any, option: IOption, args: any[]) => {
  return self[option.methodName](...args)
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
export const VarPoint = (_issue: string) => {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    let wrappedMethod: DecoratedMethod

    wrappedMethod = initializeVarPointMethod((function(this: any, ...args: any[]) {
      const transformation = this as abstractM2M<any, any, any, tcM.IConfigurationModel>
      const currentContext = transformation.context
      const element = args[0]
      const selectedOptions = resolveSelectedOptions(transformation, element)
      const options = getVarPointOptions(wrappedMethod) || []

      // Keep context stack balanced even if condition evaluation or option method throws.
      currentContext.currendElementDecision[_privatePush](selectedOptions)

      try {
        const selectedOption = selectOption(options, {
          self: this,
          selectedOptions,
          element,
          currentContext,
        })

        if (!selectedOption) {
          throw new Error(`No option condition evaluated to true and no default option provided`)
        }

        return invokeSelectedMethod(this, selectedOption, args)
      } finally {
        currentContext.currendElementDecision[_privatePop]()
      }
    } as unknown) as DecoratedMethod, propertyKey)

    const registeredOptions = getVarPointOptions(descriptor.value as DecoratedMethod)
    if (registeredOptions?.length) {
      // Preserve options registered before wrapping (decorator evaluation order).
      getVarPointOptions(wrappedMethod)?.push(...registeredOptions)
    }

    descriptor.value = wrappedMethod
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
    const method = target[methodName] as DecoratedMethod | undefined
    if (getVarPointPropertyKey(method)) {
      if (!option) {
        throw new Error(`VarOption("${methodName}") requires EvalCondition, for example Option("...")`)
      }

      const varOption: IOption = {
        methodName: propertyKey,
        evalCondition: option,
      }

      registerOption(method, varOption)

      // Čuvaj referencu na VarPoint metodu na ovoj metodi
      setVarOptionReference(descriptor.value as DecoratedMethod, methodName)
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
    const varOptionRef = getVarOptionReference(descriptor.value as DecoratedMethod)

    if (varOptionRef) {
      // Pronađi VarPoint metodu koju referencira VarOption
      const varPointMethod = target[varOptionRef] as DecoratedMethod | undefined
      if (getVarPointPropertyKey(varPointMethod)) {
        // Default is just a regular option flagged as fallback.
        registerOption(varPointMethod, {
          methodName: propertyKey,
          evalCondition: () => true,
          isDefault: true,
        })
      }
    }

    return descriptor
  }
}
