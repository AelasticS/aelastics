// https://luckylibora.medium.com/typescript-method-decorators-in-depth-problems-and-solutions-74387d51e6a

import { abstractM2M, _privatePop, _privatePush } from "../transformations/abstractM2M"
// import * as tcM from "../decisions/3.transformation-configuration/transformation-configuration-meta.model";  // import decision model types for decision model transformation
import * as tcM from "./../decisions/3.configuration-model/configuration-meta.model"
import { EvalCondition } from "./eval-operators"

// https://stackoverflow.com/questions/55179461/reflection-in-javascript-how-to-intercept-an-object-for-function-enhancement-d

interface IVarOption {
  methodName: string
  evalCondition: EvalCondition
  isDefault?: boolean
}

const __VarOptionRef = "__VarOptionRef"

type DecoratedMethod = ((this: any, ...args: any[]) => any) & {
  [__VarOptionRef]?: string
  [key: string]: unknown
}

// WeakMap registry: prototype → (varPointName → IVarOption[])
// Decouples option registration from the function object so that outer decorators
// (e.g. @E2E) can freely wrap a @VarPoint method without destroying the options bucket.
const varPointRegistry = new WeakMap<object, Map<string, IVarOption[]>>()

const isVarPoint = (target: object, methodName: string): boolean =>
  varPointRegistry.get(target)?.has(methodName) ?? false

const getRegisteredVarOptions = (target: object, methodName: string): IVarOption[] | undefined =>
  varPointRegistry.get(target)?.get(methodName)

const registerVarPoint = (target: object, propertyKey: string): void => {
  if (!varPointRegistry.has(target)) {
    varPointRegistry.set(target, new Map())
  }
  const map = varPointRegistry.get(target)!
  if (!map.has(propertyKey)) {
    map.set(propertyKey, [])
  }
}

const registerVarOption = (target: object, varPointName: string, varOption: IVarOption): void => {
  getRegisteredVarOptions(target, varPointName)?.push(varOption)
}

const setVarOptionReference = (method: DecoratedMethod, methodName: string): void => {
  method[__VarOptionRef] = methodName
}

const getVarOptionReference = (method: DecoratedMethod | undefined): string | undefined =>
  method?.[__VarOptionRef]

const resolveConfiguredChoices = (
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

const evaluateVarOption = (
  varOption: IVarOption,
  context: {
    self: any
    configChoices: tcM.IChoice[]
    element: any
    currentContext: abstractM2M<any, any, any, tcM.IConfigurationModel>["context"]
  },
): boolean => {
  return varOption.evalCondition.call(
    context.self,
    context.configChoices,
    context.element,
    context.currentContext,
  )
}

const selectVarOption = (
  varOptions: IVarOption[],
  context: {
    self: any
    configChoices: tcM.IChoice[]
    element: any
    currentContext: abstractM2M<any, any, any, tcM.IConfigurationModel>["context"]
  },
): IVarOption | undefined => {
  // First matching non-default option wins; otherwise fall back to the default option.
  const matchingVarOption = varOptions.find((varOption) => !varOption.isDefault && evaluateVarOption(varOption, context))

  return matchingVarOption || varOptions.find((varOption) => varOption.isDefault)
}

const invokeVarOption = (self: any, varOption: IVarOption, args: any[]) => {
  return self[varOption.methodName](...args)
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
    // Register the options bucket in the WeakMap registry keyed by (prototype, propertyKey).
    // This allows outer decorators (e.g. @E2E) to wrap this method without breaking registration.
    registerVarPoint(target, propertyKey)

    descriptor.value = function(this: any, ...args: any[]) {
      const transformation = this as abstractM2M<any, any, any, tcM.IConfigurationModel>
      const currentContext = transformation.context
      const element = args[0]
      const configChoices = resolveConfiguredChoices(transformation, element)
      // VarOptions are looked up from the registry at call time, not from the function object.
      const varOptions = getRegisteredVarOptions(target, propertyKey) || []

      // Keep context stack balanced even if condition evaluation or option method throws.
      currentContext.currentElementDecision[_privatePush](configChoices)

      try {
        const chosenVarOption = selectVarOption(varOptions, {
          self: this,
          configChoices,
          element,
          currentContext,
        })

        if (!chosenVarOption) {
          throw new Error(`No option condition evaluated to true and no default option provided`)
        }

        return invokeVarOption(this, chosenVarOption, args)
      } finally {
        currentContext.currentElementDecision[_privatePop]()
      }
    }

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
    // Use registry lookup — independent of what's currently in target[methodName],
    // so @E2E or any other decorator wrapping the VarPoint method doesn't break registration.
    if (isVarPoint(target, methodName)) {
      if (!option) {
        throw new Error(`VarOption("${methodName}") requires EvalCondition, for example Option("...")`)
      }

      registerVarOption(target, methodName, {
        methodName: propertyKey,
        evalCondition: option,
      })

      // Čuvaj referencu na VarPoint metodu na ovoj metodi (potrebno za @Default)
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
    // Reads __VarOptionRef set by @VarOption, then registers via registry (not target[ref]).
    const varOptionRef = getVarOptionReference(descriptor.value as DecoratedMethod)

    if (varOptionRef && isVarPoint(target, varOptionRef)) {
      // Mark the already-registered VarOption as default instead of adding a duplicate entry.
      const existing = getRegisteredVarOptions(target, varOptionRef)?.find((v) => v.methodName === propertyKey)
      if (existing) {
        existing.isDefault = true
      }
    }

    return descriptor
  }
}
