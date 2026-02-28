import * as tcM from "../decisions/3.configuration-model/configuration-meta.model"

// Logical operators for working with dM.Option types in VarOption decorators
// Enables creating complex expressions by combining And, Or, Not operations

/**
 * Type of a function that evaluates a condition based on a list of selected options
 */
export type EvalCondition = (selectedOptions: any[], element?: any, currentContext?: any) => boolean

export const __OptionName = "__OptionName"

const resolveSelectedOptions = (self: any, element: any, currentContext: any): any[] => {
  const context = currentContext || self?.context
  const decisions = self?.configModel?.decisions || []
  const store = context?.store

  return decisions
    .filter((d: any) => !store?.isTypeOf?.(d, (tcM as any).ElementDecision)
      || (store?.isTypeOf?.(d, (tcM as any).ElementDecision)
        && (d as any)?.element?.id === element?.id))
    .flatMap((d: any) => d.choices) || []
}

export function optionConditionFromName(optionName: string): EvalCondition {
  return function(selectedOptions: any[] = [], element?: any, currentContext?: any): boolean {
    // @ts-ignore
    const effectiveOptions = selectedOptions.length > 0
      ? selectedOptions
      // @ts-ignore
      : resolveSelectedOptions(this as any, element, currentContext)

    return (effectiveOptions || []).some((choice: any) => {
      const selectedName = choice?.selectedOption?.name
      const optionNameFallback = choice?.option?.name
      const choiceName = choice?.name
      return selectedName === optionName || optionNameFallback === optionName || choiceName === optionName || choice === optionName
    })
  }
}

/**
 * AND operator - all conditions must be satisfied
 * @param conditions - one or more EvalCondition values (Option(), And(), Or(), Not())
 * @returns EvalCondition function that evaluates AND logic
 *
 * @example
 * And(Option("option1"), Option("option2"), Option("option3"))
 * And(Or(Option("opt1"), Option("opt2")), Not(Option("opt3")))
 * And(Option("Use Join Table"), Option("Normalize"))
 */
export function And(...conditions: EvalCondition[]): EvalCondition {
  return (selectedOptions: any[]): boolean => {
    return conditions.every(condition => {
      // All values are EvalCondition functions
      return condition(selectedOptions)
    })
  }
}

/**
 * OR operator - at least one condition must be satisfied
 * @param conditions - one or more EvalCondition values (Option(), And(), Not())
 * @returns EvalCondition function that evaluates OR logic
 *
 * @example
 * Or(Option("option1"), Option("option2"), Option("option3"))
 * Or(And(Option("opt1"), Option("opt2")), Not(Option("opt3")))
 * Or(Option("strategy1"), Option("strategy2"))
 */
export function Or(...conditions: EvalCondition[]): EvalCondition {
  return (selectedOptions: any[]): boolean => {
    return conditions.some(condition => {
      // All values are EvalCondition functions
      return condition(selectedOptions)
    })
  }
}

/**
 * NOT operator - condition must not be satisfied
 * @param condition - EvalCondition value (Option(), And(), Or())
 * @returns EvalCondition function that evaluates NOT logic
 *
 * @example
 * Not(Option("option1"))
 * Not(And(Option("opt1"), Option("opt2")))
 * Not(Or(Option("perf"), Option("optimization")))
 */
export function Not(condition: EvalCondition): EvalCondition {
  return (selectedOptions: any[]): boolean => {
    // condition is an EvalCondition function
    return !condition(selectedOptions)
  }
}

/**
 * Option function - finds dM.IOption object by string identifier
 * @param optionName - string identifier of the option (e.g., "option.name" or "issue:option")
 * @returns EvalCondition function that evaluates whether the requested option is selected
 *
 * @example
 * Option("Use Join Table")
 * Option("Use Role Names")
 * And(Option("option1"), Option("option2"))
 * Or(Option("strategy1"), Option("strategy2"))
 *
 * @TODO Implement finding dM.IOption object from the structure
 * Required:
 * 1. Find logic for finding option by string identifier
 * 2. Use decision model structure (DecisionModel -> Issue -> possibleOptions)
 * 3. Map string ID to actual dM.IOption object
 * 4. Return EvalCondition that checks whether that option is in selectedOptions
 */
export function Option(optionName: string) {
  const condition = optionConditionFromName(optionName)

  return (...args: any[]): any => {
    if (args.length >= 2 && typeof args[1] === "string") {
      const descriptor = args[2] as PropertyDescriptor | undefined
      if (descriptor?.value) {
        descriptor.value[__OptionName] = optionName
      }
      return descriptor
    }

    // @ts-ignore
    return condition.call(this, args[0] as any[], args[1], args[2])
  }
}
