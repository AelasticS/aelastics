import * as t from "aelastics-types";
import { Model, ModelElement } from "generic-metamodel";
import { Type } from "../../types-metamodel/types-meta.model";


export const DesignDecision_TypeSchema = t.schema("DesignDecision_TypeSchema");

export const Issue = t.subtype(
  ModelElement,
  {
    possibleOptions: t.arrayOf(t.link(DesignDecision_TypeSchema, "Option")),
  },
  "Issue",
  DesignDecision_TypeSchema
);

export const DesignDecisionModel = t.subtype(
  Model,
  {
    issues: t.arrayOf(Issue),
  },
  "DesignDecisionModel",
  DesignDecision_TypeSchema
);

(DesignDecisionModel as any).objectClassification = "Model";

export const SimpleOption = t.subtype(
  ModelElement,
  {
    valueType: t.optional(Type),
    optionType: t.literal('simple')
  },
  'SimpleOption',
  DesignDecision_TypeSchema);

export const CompositeOption = t.subtype(ModelElement,
  {
    subIssues: t.arrayOf(Issue),
    optionType: t.literal('composite')
  },
  'CompositeOption',
  DesignDecision_TypeSchema
);

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
      'optionType',
      'OptionType',
      DesignDecision_TypeSchema
    )

  },
  "Option",
  DesignDecision_TypeSchema
);

export const ConstraintType = t.string.derive("ConstraintType").oneOf(["Requires", "Exclude"]);
export const Constraint = t.subtype(
  ModelElement,
  {
    type: ConstraintType,
    source: Option,
    target: Option,
  },
  "Constraint",
  DesignDecision_TypeSchema
);

export type IDecisionModel = t.TypeOf<typeof DesignDecisionModel>;
export type IIssue = t.TypeOf<typeof Issue>;
export type IOption = t.TypeOf<typeof Option>;
export type IDependency = t.TypeOf<typeof Constraint>;
export type IDependencyType = t.TypeOf<typeof ConstraintType>;
export type ISimpleOption = t.TypeOf<typeof SimpleOption>;
export type ICompositeOption = t.TypeOf<typeof CompositeOption>;