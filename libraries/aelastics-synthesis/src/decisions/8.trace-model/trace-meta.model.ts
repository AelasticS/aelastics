import * as t from "aelastics-types"
import { Model, ModelElement } from "generic-metamodel"
import { Choice, ConfigurationModel } from "./../3.configuration-model/configuration-meta.model"

export const TraceModel_TypeSchema = t.schema("TraceModel_TypeSchema")

export const TraceEntry = t.subtype(
  ModelElement,
  {
    rule: t.string,
    timestamp: t.number,
    source: ModelElement,
    targets: t.arrayOf(ModelElement),
    ruleType: t.string.derive().oneOf(["RegularRule", "VariabilityPoint", "SpecializationPoint"]),
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

export const SpecializationPointTraceEntry = t.subtype(
  TraceEntry,
  {
    ruleType: t.literal("SpecializationPoint"),
    specializationOption: t.string,
    sourceType: t.string,
  },
  "SpecializationPointTraceEntry",
  TraceModel_TypeSchema,
)

export const TraceModel = t.subtype(
  Model,
  {
    transformationSpec: t.string,
    source: Model,
    targets: t.arrayOf(Model),
    config: t.optional(ConfigurationModel),
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
export type ISpecPointTraceEntry = t.TypeOf<typeof SpecializationPointTraceEntry>;
