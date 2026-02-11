import * as t from "aelastics-types";
import { Model, ModelElement } from "generic-metamodel";
import * as ddM from "../1.decision-model/decision-meta.model";

export const BindingModel_TypeSchema = t.schema("BindingModel_TypeSchema");

export const BindingElement = t.subtype(
    ModelElement,
    {
        element: ModelElement,
        issues: t.arrayOf(ddM.ElementIssue),
        condition: t.optional(t.string)
    },
    "BindingElement",
    BindingModel_TypeSchema
);

export const BindingModel = t.subtype(
    Model,
    {
        sourceModel: Model,
        decisionModel: ddM.DecisionModel,
        bindings: t.arrayOf(BindingElement),
    },
    "BindingModel",
    BindingModel_TypeSchema
);

export type IBindingModel = t.TypeOf<typeof BindingModel>;
export type IBindingElement = t.TypeOf<typeof BindingElement>;