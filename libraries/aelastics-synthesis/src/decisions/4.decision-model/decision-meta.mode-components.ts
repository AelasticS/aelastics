import * as dm from './decision-meta.model';
import { ModelStore } from '../../index';
import { CpxTemplate, Element, Template, WithRefProps } from "../../jsx/element";

export type IModelProps = WithRefProps<dm.IDecisionModel> & {
    store?: ModelStore;
};

export const DecisionModel: CpxTemplate<IModelProps, dm.IDecisionModel> = (props) => {
    return new Element(dm.DecisionModel, props, undefined);
}

export const SelectedOption: Template<dm.ISelectedOption> = (props) => {
    return new Element(dm.SelectedOption, props, 'selectedOptions');
}

export const DecisionForElement: Template<dm.IDecisionForElement> = (props) => {
    return new Element(dm.DecisionForElement, props, 'decisions');
}