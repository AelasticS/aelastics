import * as t from 'aelastics-types';
import { Model, ModelElement } from 'generic-metamodel';
import * as gdm from '../1.generic-decision-model/generic-decision-meta.model';

export const DecisionModel_TypeSchema = t.schema('DecisionModel_TypeSchema');

export const SelectedOption = t.subtype(
    ModelElement,
    {
        assumptions: t.string,
        justification: t.string,
        consequences: t.string,
        ref: gdm.Option,
        newIssues: t.arrayOf(t.link(DecisionModel_TypeSchema, 'SelectedOption')), // todo selected options for new issues
    },
    'SelectedOption',
    DecisionModel_TypeSchema
);

export const DecisionForElement = t.subtype(
    ModelElement,
    {
        elementId: t.string,
        selectedOptions: t.arrayOf(SelectedOption),
    },
    'DecisionForElement',
    DecisionModel_TypeSchema
);

export const DecisionModel = t.subtype(
    Model,
    {
        decisions: t.arrayOf(DecisionForElement),
        relatedModel: Model,
    },
    'DecisionModel',
    DecisionModel_TypeSchema
);


export type IDecisionModel = t.TypeOf<typeof DecisionModel>;
export type ISelectedOption = t.TypeOf<typeof SelectedOption>;
export type IDecisionForElement = t.TypeOf<typeof DecisionForElement>;

