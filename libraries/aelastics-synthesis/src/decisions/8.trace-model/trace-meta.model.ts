import * as t from 'aelastics-types';
import { Model, ModelElement } from 'generic-metamodel';
import { ConfigurationModel } from '../3.transformation-configuration/transformation-configuration-meta.model';

export const TraceModel_TypeSchema = t.schema("TraceModel_TypeSchema");

export const RegularRule = t.subtype(
    ModelElement,
    {
        type: t.literal('regularRule'),
    },
    'RegularRule',
    TraceModel_TypeSchema
);

export const VariabilityPoint = t.subtype(
    ModelElement,
    {
        type: t.literal('variabilityPoint'),
    },
    'VariabilityPoint',
    TraceModel_TypeSchema
);

export const TraceEntry = t.subtype(
    ModelElement,
    {
        ruleName: t.string,
        timestamp: t.number,
        source: ModelElement,
        target: t.arrayOf(ModelElement), // todo: use references to model elements
        ruleType: t.string.derivedFrom
        ruleType: t.taggedUnion({
            regularRule: RegularRule,
            variabilityPoint: VariabilityPoint,
        }, 'type',
            'RuleType',
            TraceModel_TypeSchema)

    },
    'TraceEntry',
    TraceModel_TypeSchema
);

export const TraceModel = t.subtype(
    Model,
    {
        name: t.string,
        transformationName: t.string,
        sourceModel: Model,
        targetModel: Model,
        transformationConfigurationModel: ConfigurationModel,
        traceRecords: t.arrayOf(TraceEntry),
    },
    'TraceModel',
    TraceModel_TypeSchema
);

export type ITraceModel = t.TypeOf<typeof TraceModel>;
export type ITraceEntry = t.TypeOf<typeof TraceEntry>;
