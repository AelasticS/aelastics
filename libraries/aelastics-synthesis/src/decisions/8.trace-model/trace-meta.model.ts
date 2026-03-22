import * as t from "aelastics-types"
import { Model, ModelElement } from "generic-metamodel"
import { Choice, ConfigurationModel } from "./../3.configuration-model/configuration-meta.model";

export const TraceModel_TypeSchema = t.schema("TraceModel_TypeSchema")

export const TraceEntry = t.subtype(
    ModelElement,
    {
        rule: t.string,
        timestamp: t.number,
        source: ModelElement,
        targets: t.arrayOf(ModelElement),
        ruleType: t.string.derive().oneOf(["RegularRule", "VariabilityPoint"]),
        variabilityOption: t.optional(t.string),
        choices: t.optional(t.arrayOf(Choice))
    },
    "TraceEntry",
    TraceModel_TypeSchema,
)

export const TraceModel = t.subtype(
    Model,
    {
        transformationSpec: t.string,
        source: Model,
        targets: t.arrayOf(Model),
        config: ConfigurationModel,
        traceRecords: t.arrayOf(TraceEntry),
        timestamp: t.string,
    },
    "TraceModel",
    TraceModel_TypeSchema,
)

export type ITraceModel = t.TypeOf<typeof TraceModel>;
export type ITraceEntry = t.TypeOf<typeof TraceEntry>;
