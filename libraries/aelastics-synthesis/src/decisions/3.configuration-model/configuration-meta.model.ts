import * as t from "aelastics-types"
import { Model, ModelElement } from "generic-metamodel"
import * as gdm from "../1.decision-model/decision-meta.model"
import { BindingModel } from "../2.binding-model/binding-meta.model"

export const ConfigurationModel_TypeSchema = t.schema("ConfigurationModel_TypeSchema")

export const SimpleOption = t.subtype(
  ModelElement,
  {
    //TODO: Type of defaultValue should be determined based on the option type
    // defaultValue: t.optional(getOptionType(option)),
    defaultValue: t.string, // defaultValue is a string for simplicity
    optionType: t.literal("simple"),
  },
  "SimpleOption",
  ConfigurationModel_TypeSchema)

export const CompositeOption = t.subtype(
  ModelElement,
  {
    choices: t.arrayOf(t.link(ConfigurationModel_TypeSchema, "Choice")),
    optionType: t.literal("composite"),
  },
  "CompositeOption",
)

const getOptionType = (option: gdm.IOption): t.Any => {
  return t.string
}

// Base Choice type that can be used in decorators and type annotations
export const BaseChoice = t.subtype(
  ModelElement,
  {
    assumptions: t.optional(t.string),
    justification: t.optional(t.string),
    consequences: t.optional(t.string),
    issue: gdm.Issue,
    selectedOption: gdm.Option,

  },
  "BaseChoice",
  ConfigurationModel_TypeSchema,
)

// Factory function that creates specific Choice types based on the option
export const Choice = t.subtype(
  BaseChoice, // Extend the base type
  {
    // newIssues: t.arrayOf(t.link(DecisionModel_TypeSchema, 'Choice')), // todo selected options for new issues
    value: t.optional(t.taggedUnion(
      {
        simple: SimpleOption,
        composite: CompositeOption,
      },
      "optionType",
      "OptionType",
    )),
  },
  "Choice",
  ConfigurationModel_TypeSchema,
)

export const Decision = t.subtype(
  ModelElement,
  {
    choices: t.arrayOf(Choice), // Use the base type for arrays
  },
  "Decision",
  ConfigurationModel_TypeSchema,
)

export const ElementDecision = t.subtype(
  Decision,
  {
    element: ModelElement,

  },
  "ElementDecision",
  ConfigurationModel_TypeSchema,
)

export const ConfigurationModel = t.subtype(
  Model,
  {
    decisions: t.arrayOf(Decision),
    sourceModel: Model,
    bindingModel: BindingModel,
  },
  "ConfigurationModel",
  ConfigurationModel_TypeSchema,
)

export type IConfigurationModel = t.TypeOf<typeof ConfigurationModel>;
export type IChoice = t.TypeOf<typeof Choice>;
export type IDecision = t.TypeOf<typeof Decision>;
export type IElementDecision = t.TypeOf<typeof ElementDecision>;
export type ISimpleOption = t.TypeOf<typeof SimpleOption>;
export type ICompositeOption = t.TypeOf<typeof CompositeOption>;

