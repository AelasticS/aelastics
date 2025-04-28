import * as t from "aelastics-types";
import { Model, ModelElement } from "generic-metamodel";
import { DecisionModel } from "../decision-model/decision-meta.model";

export const DecisionDocument_TypeSchema = t.schema("DecisionDocument_TypeSchema");

export const GlobalDecision = t.subtype(
    ModelElement,
    {
        decision: DecisionModel,
    },
    "GlobalDecisionDocument",
    DecisionDocument_TypeSchema
);

export const ElementDecision = t.subtype(
    ModelElement,
    {
        elementId: t.string,
        decision: DecisionModel,
    },
    "DecisionDocument",
    DecisionDocument_TypeSchema
);

export const DecisionDocument = t.subtype(
    Model,
    {
        globalDecision: t.optional(GlobalDecision),
        elementsDecision: t.optional(t.arrayOf(ElementDecision)),
        // TODO: this is suspicious, cause elementDecision should be a object with unknown keys
        // {"elem123": ElementDecision, "elem456": ElementDecision}

    },
    "DecisionDocument",
    DecisionDocument_TypeSchema
);

export type IDecisionDocument = t.TypeOf<typeof DecisionDocument>;
export type IGlobalDecision = t.TypeOf<typeof GlobalDecision>;
export type IElementDecision = t.TypeOf<typeof ElementDecision>;