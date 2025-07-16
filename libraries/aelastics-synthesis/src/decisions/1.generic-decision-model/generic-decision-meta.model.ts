import * as t from "aelastics-types";
import { Model, ModelElement } from "generic-metamodel";
import { Type } from "../../types-metamodel/types-meta.model";


export const GenericDecisionModel_TypeSchema = t.schema("GenericDecisionModel_TypeSchema");

export const Issue = t.subtype(
  ModelElement,
  {
    possibleOptions: t.arrayOf(t.link(GenericDecisionModel_TypeSchema, "Option")),
  },
  "Issue",
  GenericDecisionModel_TypeSchema
);

export const GenericDecisionModel = t.subtype(
  Model,
  {
    issues: t.arrayOf(Issue),
  },
  "GenericDecisionModel",
  GenericDecisionModel_TypeSchema
);

export const SimpleOption = t.subtype(ModelElement, { valueType: t.optional(Type), optionType: t.literal('simple') }, 'SimpleOption');
export const CompositeOption = t.subtype(ModelElement,
  { subIssues: t.arrayOf(Issue), optionType: t.literal('composite') },
  'CompositeOption'
);

export const Option = t.subtype(
  ModelElement,
  {
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
    )
  },
  "Option",
  GenericDecisionModel_TypeSchema
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
  GenericDecisionModel_TypeSchema
);

export type IGenericDecisionModel = t.TypeOf<typeof GenericDecisionModel>;
export type IIssue = t.TypeOf<typeof Issue>;
export type IOption = t.TypeOf<typeof Option>;
export type IDependency = t.TypeOf<typeof Constraint>;
export type IDependencyType = t.TypeOf<typeof ConstraintType>;
export type ISimpleOption = t.TypeOf<typeof SimpleOption>;
export type ICompositeOption = t.TypeOf<typeof CompositeOption>;