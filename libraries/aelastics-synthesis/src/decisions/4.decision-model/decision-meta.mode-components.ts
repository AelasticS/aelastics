import * as dm from './decision-meta.model';
import { ModelStore } from '../../index';
import { CpxTemplate, Element, Template, WithRefProps } from "../../jsx/element";
import { IOption } from '../1.generic-decision-model/generic-decision-meta.model';

export type IModelProps = WithRefProps<dm.IDecisionModel> & {
    store?: ModelStore;
};

export const DecisionModel: CpxTemplate<IModelProps, dm.IDecisionModel> = (props) => {
    return new Element(dm.DecisionModel, props, undefined);
}

export const SelectedOption = (option: IOption) => {
    // Get the actual type instance for this specific option
    const SelectedOptionType = dm.SelectedOption(option);
    
    return (props: WithRefProps<dm.IBaseSelectedOption>) => {
        return new Element(SelectedOptionType, props, 'selectedOptions');
    };
};

export const DecisionForElement: Template<dm.IDecisionForElement> = (props) => {
    return new Element(dm.DecisionForElement, props, 'decisions');
}
