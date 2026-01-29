import * as t from "aelastics-types";
import { Model, ModelElement } from "generic-metamodel";
import * as ddM from "../1.design-decision/design-decision-meta.model";

export const ModelingLanguageBindingModel_TypeSchema = t.schema("ModelingLanguageBindingModel_TypeSchema");

export const ModelingLanguageBindingElement = t.subtype(
    ModelElement,
    {
        sourceModelElementRef: ModelElement,
        decisionIssues: t.arrayOf(ddM.Issue),
        condition: t.optional(t.string)
    },
    "ModelingLanguageBindingElement",
    ModelingLanguageBindingModel_TypeSchema
);

export const ModelingLanguageBindingModel = t.subtype(
    Model,
    {
        sourceModel: Model,
        decisionModel: ddM.DesignDecisionModel,
        bindings: t.arrayOf(ModelingLanguageBindingElement),
    },
    "ModelingLanguageBindingModel",
    ModelingLanguageBindingModel_TypeSchema
);

export type IModelingLanguageBindingModel = t.TypeOf<typeof ModelingLanguageBindingModel>;
export type IModelingLanguageBindingElement = t.TypeOf<typeof ModelingLanguageBindingElement>;