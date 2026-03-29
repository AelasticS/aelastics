import * as t from "aelastics-types"
import { Model, ModelElement } from "generic-metamodel"
import { Choice, ConfigurationModel } from "./../3.configuration-model/configuration-meta.model"
import { DocElement, Document } from "../../m2t"

export const TraceModel_TypeSchema = t.schema("TraceModel_TypeSchema")

export const TraceEntry = t.subtype(
  ModelElement,
  {
    rule: t.string,
    timestamp: t.number,
    source: ModelElement,
    targets: t.arrayOf(ModelElement),
    ruleType: t.string.derive().oneOf(["RegularRule", "VariabilityPoint"]),
  },
  "TraceEntry",
  TraceModel_TypeSchema,
)

export const VariabilityPointTraceEntry = t.subtype(
  TraceEntry,
  {
    ruleType: t.literal("VariabilityPoint"),
    variabilityOption: t.string,
    choices: t.arrayOf(Choice),
  },
  "VariabilityPointTraceEntry",
  TraceModel_TypeSchema,
)

export const TraceModel = t.subtype(
  Model,
  {
    transformationSpec: t.string,
    source: Model,
    targets: t.arrayOf(Model),
    config: ConfigurationModel,
    traceEntries: t.arrayOf(TraceEntry),
    timestamp: t.string,
    rule: t.string,
    ruleType: t.string.derive().oneOf(["RegularRule", "VariabilityPoint"]),
    variabilityOption: t.optional(t.string),
    choices: t.optional(t.arrayOf(Choice)),
  },
  "TraceModel",
  TraceModel_TypeSchema,
)

export type ITraceModel = t.TypeOf<typeof TraceModel>;
export type ITraceEntry = t.TypeOf<typeof TraceEntry>;
export type IVarPointTraceEntry = t.TypeOf<typeof VariabilityPointTraceEntry>;
