import * as t from "aelastics-types";
import { Model, ModelElement } from "generic-metamodel";


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
    roots: t.arrayOf(Issue),
  },
  "GenericDecisionModel",
  GenericDecisionModel_TypeSchema
);

export const Option = t.subtype(
  ModelElement,
  { Pros: t.string, Cons: t.string, isDefault: t.boolean, newIssues: t.arrayOf(Issue) },
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