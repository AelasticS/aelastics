import * as tcM from "../decisions/3.configuration-model/configuration-meta.model"

// Logical operators for working with dM.Option types in VarOption decorators
// Enables creating complex expressions by combining And, Or, Not operations

/**
 * Type of a function that evaluates a condition based on a list of config choices
 */
export type EvalCondition = (configChoices: any[], element?: any, currentContext?: any) => boolean

type ChoiceLike = {
  selectedOption?: { name?: string }
  option?: { name?: string }
  name?: string
}

type ConditionContext = {
  context?: { store?: { isTypeOf?: (value: unknown, type: unknown) => boolean } }
  configModel?: { decisions?: unknown[] }
}

type ContextStore = NonNullable<ConditionContext["context"]>["store"]

const isElementDecision = (store: ContextStore, decision: unknown): boolean => {
  return !!store?.isTypeOf?.(decision, (tcM as any).ElementDecision)
}

const isElementScopedDecision = (decision: unknown, element: any): boolean => {
  return (decision as any)?.element?.id === element?.id
}

const decisionChoices = (decision: unknown): any[] => {
  const choices = (decision as any)?.choices
  return Array.isArray(choices) ? choices : []
}

const hasOptionName = (choice: unknown, optionName: string): boolean => {
  const candidate = choice as ChoiceLike
  return candidate?.selectedOption?.name === optionName
}

const resolveConfigChoices = (self: ConditionContext | undefined, element: any, currentContext: any): any[] => {
  const context = currentContext || self?.context
  const decisions = self?.configModel?.decisions || []
  const store = context?.store

  return decisions
    .filter(
      (d: unknown) =>
        !isElementDecision(store, d) || (isElementDecision(store, d) && isElementScopedDecision(d, element))
    )
    .flatMap((d: unknown) => decisionChoices(d))
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
  return (configChoices: any[]): boolean => {
    return conditions.every((condition) => condition(configChoices))
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
  return (configChoices: any[]): boolean => {
    return conditions.some((condition) => condition(configChoices))
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
  return (configChoices: any[]): boolean => {
    return !condition(configChoices)
  }
}

/**
 * Option operator - returns an EvalCondition that checks whether the named option is selected
 * @param optionName - string identifier of the option (e.g., "Use Join Table")
 * @returns EvalCondition function that evaluates whether the requested option is selected
 *
 * @example
 * Option("Use Join Table")
 * Option("Use Role Names")
 * And(Option("option1"), Option("option2"))
 * Or(Option("strategy1"), Option("strategy2"))
 */
export function Option(optionName: string): EvalCondition {
  return function (this: ConditionContext, configChoices: any[] = [], element?: any, currentContext?: any): boolean {
    const effectiveChoices = configChoices.length > 0 ? configChoices : resolveConfigChoices(this, element, currentContext)
    return effectiveChoices.some((choice: unknown) => hasOptionName(choice, optionName))
  }
}
