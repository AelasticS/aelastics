import * as t from 'aelastics-types';
import { Model, ModelElement } from 'generic-metamodel';
import * as gdm from '../1.design-decision/design-decision-meta.model';

export const TransformationConfigurationModel_TypeSchema = t.schema('TransformationConfigurationModel_TypeSchema');

export const SimpleOption = t.subtype(
    ModelElement,
    {
        //TODO: Type of defaultValue should be determined based on the option type
        // defaultValue: t.optional(getOptionType(option)), 
        defaultValue: t.string, // defaultValue is a string for simplicity
        optionType: t.literal('simple')
    },
    'SimpleOption',
    TransformationConfigurationModel_TypeSchema);

export const CompositeOption = t.subtype(
    ModelElement,
    {
        selectedOptions: t.arrayOf(t.link(TransformationConfigurationModel_TypeSchema, 'SelectedOption')),
        optionType: t.literal('composite')
    },
    'CompositeOption'
);

const getOptionType = (option: gdm.IOption): t.Any => {
    return t.string;
}

// Base SelectedOption type that can be used in decorators and type annotations
export const BaseSelectedOption = t.subtype(
    ModelElement,
    {
        assumptions: t.string,
        justification: t.string,
        consequences: t.string,
        ref: gdm.Option,
    },
    'BaseSelectedOption',
    TransformationConfigurationModel_TypeSchema
);

// Factory function that creates specific SelectedOption types based on the option
export const SelectedOption = t.subtype(
    BaseSelectedOption, // Extend the base type
    {
        // newIssues: t.arrayOf(t.link(DecisionModel_TypeSchema, 'SelectedOption')), // todo selected options for new issues
        value: t.taggedUnion(
            {
                simple: SimpleOption,
                composite: CompositeOption,
            },
            'optionType',
            'OptionType',
        )
    },
    'SelectedOption',
    TransformationConfigurationModel_TypeSchema
);

export const DecisionForElement = t.subtype(
    ModelElement,
    {
        elementId: t.string,
        selectedOptions: t.arrayOf(SelectedOption), // Use the base type for arrays
    },
    'DecisionForElement',
    TransformationConfigurationModel_TypeSchema
);

export const TransformationConfigurationModel = t.subtype(
    Model,
    {
        decisions: t.arrayOf(DecisionForElement),
        relatedModel: Model,
    },
    'TransformationConfigurationModel',
    TransformationConfigurationModel_TypeSchema
);


export type ITransformationConfigurationModel = t.TypeOf<typeof TransformationConfigurationModel>;
export type IBaseSelectedOption = t.TypeOf<typeof BaseSelectedOption>; // Type for the base
export type ISelectedOption = t.TypeOf<typeof SelectedOption>;
export type IDecisionForElement = t.TypeOf<typeof DecisionForElement>;
export type ISimpleOption = t.TypeOf<typeof SimpleOption>;
export type ICompositeOption = t.TypeOf<typeof CompositeOption>;

