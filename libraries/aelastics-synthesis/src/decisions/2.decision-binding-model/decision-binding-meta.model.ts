import * as t from "aelastics-types";
import { Model, ModelElement } from "generic-metamodel";
import * as gdm from "../1.generic-decision-model/generic-decision-meta.model";

export const DecisionBindingModel_TypeSchema = t.schema("DecisionBindingModel_TypeSchema");

export const DecisionBindingElement = t.subtype(
    ModelElement,
    {
        sourceModelElementRef: ModelElement,
        decisionIssues: t.arrayOf(gdm.Issue),
        condition: t.optional(t.string)
    },
    "DecisionBindingElement",
    DecisionBindingModel_TypeSchema
);

export const DecisionBindingModel = t.subtype(
    Model,
    {
        sourceModel: Model,
        genericDecisionModel: gdm.GenericDecisionModel,
        bindings: t.arrayOf(DecisionBindingElement),
    },
    "DecisionBindingModel",
    DecisionBindingModel_TypeSchema
);

export type IDecisionBindingModel = t.TypeOf<typeof DecisionBindingModel>;
export type IDecisionBindingElement = t.TypeOf<typeof DecisionBindingElement>;