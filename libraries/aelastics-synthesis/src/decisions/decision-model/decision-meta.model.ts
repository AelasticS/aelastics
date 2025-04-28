import * as t from 'aelastics-types';
import { Model, ModelElement } from 'generic-metamodel';
import * as gdm from './../generic-decision-model/generic-decision-meta.model';

export const DecisionModel_TypeSchema = t.schema('DecisionModel_TypeSchema');

export const SelectedOption = t.subtype(
    ModelElement,
    {
        assumptions: t.string,
        justification: t.string,
        consequences: t.string,
        relatedIssues: t.arrayOf(t.link(DecisionModel_TypeSchema, 'Issue'))
    },
    'SelectedOption',
    DecisionModel_TypeSchema
);

export const Issue = t.subtype(
    ModelElement,
    {
        ref: gdm.Issue,
        selectedOption: SelectedOption
    },
    'Issue',
    DecisionModel_TypeSchema
);

export const DecisionModel = t.subtype(
    Model,
    {
        issues: t.arrayOf(Issue),
    },
    'DecisionModel',
    DecisionModel_TypeSchema
);

export type IDecisionModel = t.TypeOf<typeof DecisionModel>;
export type ISelectedOption = t.TypeOf<typeof SelectedOption>;
export type IIssue = t.TypeOf<typeof Issue>;

