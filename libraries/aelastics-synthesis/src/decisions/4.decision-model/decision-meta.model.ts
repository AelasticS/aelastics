import * as t from 'aelastics-types';
import { Model, ModelElement } from 'generic-metamodel';
import * as gdm from '../1.generic-decision-model/generic-decision-meta.model';
import { Type } from '../../types-metamodel/types-meta.model';

export const DecisionModel_TypeSchema = t.schema('DecisionModel_TypeSchema');

export const SimpleOption = (option: gdm.IOption) => t.subtype(ModelElement, { defaultValue: t.optional(getOptionType(option)), optionType: t.literal('simple') }, 'SimpleOption');
export const CompositeOption = t.subtype(ModelElement,
    { subIssues: t.arrayOf(t.link(DecisionModel_TypeSchema, 'SelectedOption')), optionType: t.literal('composite') },
    'CompositeOption'
);

const getOptionType = (option: gdm.IOption): t.Any => {

    return t.string;
}

export const SelectedOption = (option: gdm.IOption) => t.subtype(
    ModelElement,
    {
        assumptions: t.string,
        justification: t.string,
        consequences: t.string,
        ref: gdm.Option,
        // newIssues: t.arrayOf(t.link(DecisionModel_TypeSchema, 'SelectedOption')), // todo selected options for new issues
        value: t.taggedUnion(
            {
                simple: SimpleOption(option),
                composite: CompositeOption,
            },
            'optionType',
            'OptionType',
        )
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

