import * as dm from './transformation-configuration-meta.model';
import { ModelStore } from '../../index';
import { CpxTemplate, Element, Template, WithRefProps } from "../../jsx/element";

export type IModelProps = WithRefProps<dm.ITransformationConfigurationModel> & {
    store?: ModelStore;
};

export const TransformationConfigurationModel: CpxTemplate<IModelProps, dm.ITransformationConfigurationModel> = (props) => {
    return new Element(dm.TransformationConfigurationModel, props, undefined);
}

// export const SelectedOption = (option: IOption) => {
//     // Get the actual type instance for this specific option
//     const SelectedOptionType = dm.SelectedOption;


//     return (props: WithRefProps<dm.IBaseSelectedOption>) => {
//         // 
//         return new Element(SelectedOptionType, props, 'selectedOptions');
//     };
// };

export const SelectedOption: Template<dm.ISelectedOption> = (props) => {
    return new Element(dm.SelectedOption, props, 'selectedOptions');
}

export const DecisionForElement: Template<dm.IDecisionForElement> = (props) => {
    return new Element(dm.DecisionForElement, props, 'decisions');
}

export const SimpleOption: Template<dm.ISimpleOption> = (props) => {
    return new Element(dm.SimpleOption, props, 'value');
}

export const CompositeOption: Template<dm.ICompositeOption> = (props) => {
    return new Element(dm.CompositeOption, props, 'value');
}
