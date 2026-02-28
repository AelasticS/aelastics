import * as t from "aelastics-types"
import { Model, ModelElement } from "generic-metamodel"
import { Type } from "../../types-metamodel/types-meta.model"


export const Decision_TypeSchema = t.schema("Decision_TypeSchema")

export const Issue = t.subtype(
  ModelElement,
  {
    possibleOptions: t.arrayOf(t.link(Decision_TypeSchema, "Option")),
  },
  "Issue",
  Decision_TypeSchema,
)

export const ElementIssue = t.subtype(
  Issue,
  {},
  "ElementIssue",
  Decision_TypeSchema,
)

export const ModelIssue = t.subtype(
  Issue,
  {},
  "ModelIssue",
  Decision_TypeSchema,
)

export const DecisionModel = t.subtype(
  Model,
  {
    issues: t.arrayOf(Issue),
  },
  "DecisionModel",
  Decision_TypeSchema,
);

(DecisionModel as any).objectClassification = "Model"

export const SimpleOption = t.subtype(
  ModelElement,
  {
    valueType: t.optional(Type),
    optionType: t.literal("simple"),
  },
  "SimpleOption",
  Decision_TypeSchema)

export const CompositeOption = t.subtype(ModelElement,
  {
    subIssues: t.arrayOf(Issue),
    optionType: t.literal("composite"),
  },
  "CompositeOption",
  Decision_TypeSchema,
)

export const Option = t.subtype(
  ModelElement,
  {
    ParentIssue: Issue,
    Pros: t.string,
    Cons: t.string,
    isDefault: t.optional(t.boolean), // if is not optional, default value is true 
    // TODO: set default value for boolean to false
    optionType: t.taggedUnion(
      {
        simple: SimpleOption,
        composite: CompositeOption,
      },
      "optionType",
      "OptionType",
      Decision_TypeSchema,
    ),

  },
  "Option",
  Decision_TypeSchema,
)

export const ConstraintType = t.string.derive("ConstraintType").oneOf(["Requires", "Exclude"])
export const Constraint = t.subtype(
  ModelElement,
  {
    type: ConstraintType,
    source: Option,
    target: Option,
  },
  "Constraint",
  Decision_TypeSchema,
)

export type IDecisionModel = t.TypeOf<typeof DecisionModel>;
export type IElementIssue = t.TypeOf<typeof ElementIssue>;
export type IModelIssue = t.TypeOf<typeof ModelIssue>;
export type IOption = t.TypeOf<typeof Option>;
export type IDependency = t.TypeOf<typeof Constraint>;
export type IConstraintType = t.TypeOf<typeof ConstraintType>;
export type ISimpleOption = t.TypeOf<typeof SimpleOption>;
export type ICompositeOption = t.TypeOf<typeof CompositeOption>;
export type IIssue = t.TypeOf<typeof Issue>;