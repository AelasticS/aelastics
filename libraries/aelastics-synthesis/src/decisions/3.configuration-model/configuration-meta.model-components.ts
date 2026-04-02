import * as dm from './configuration-meta.model';
import { ModelStore } from '../../index';
import { CpxTemplate, ExprNode, Template, WithRefProps } from "../../jsx/element";

export type IModelProps = WithRefProps<dm.IConfigurationModel> & {
    store?: ModelStore;
};

export const ConfigurationModel: CpxTemplate<IModelProps, dm.IConfigurationModel> = (props) => {
    return new ExprNode(dm.ConfigurationModel, props, undefined);
}

// export const SelectedOption = (option: IOption) => {
//     // Get the actual type instance for this specific option
//     const SelectedOptionType = dm.SelectedOption;


//     return (props: WithRefProps<dm.IBaseSelectedOption>) => {
//         // 
//         return new Element(SelectedOptionType, props, 'selectedOptions');
//     };
// };

export const SelectedOption: Template<dm.IChoice> = (props) => {
    return new ExprNode(dm.Choice, props, 'selectedOptions');
}

export const ElementChoice: Template<dm.IElementDecision> = (props) => {
    return new ExprNode(dm.ElementDecision, props, 'decisions');
}

export const GlobalChoice: Template<dm.IDecision> = (props)=>{
    return new ExprNode(dm.Decision, props, 'decisions');
}

export const SimpleOption: Template<dm.ISimpleOption> = (props) => {
    return new ExprNode(dm.SimpleOption, props, 'value');
}

export const CompositeOption: Template<dm.ICompositeOption> = (props) => {
    return new ExprNode(dm.CompositeOption, props, 'value');
}

export const Choice: Template<dm.IChoice> = (props)=>{
    return new ExprNode(dm.Choice, props, undefined);
}
