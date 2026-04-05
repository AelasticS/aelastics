import * as ddm from './decision-meta.model';
import { ModelStore } from '../../index';
import { CpxTemplate, ExprNode, Template, WithRefProps } from "../../jsx/element";

export type IDecisionModelProps = WithRefProps<ddm.IDecisionModel> & {
    store?: ModelStore;
};

export const DecisionModel: CpxTemplate<IDecisionModelProps, ddm.IDecisionModel> = (props) => {
    return new ExprNode(ddm.DecisionModel, props, undefined);
};

export const Option: Template<ddm.IOption> = (props) => {
    return new ExprNode(ddm.Option, props, 'possibleOptions');
}

export const ElementIssue: Template<ddm.IElementIssue> = (props) => {
    return new ExprNode(ddm.ElementIssue, props, 'issues');
}

export const ModelIssue: Template<ddm.IModelIssue> = (props) => {
    return new ExprNode(ddm.ModelIssue, props, 'issues');
}

export const GlobalIssue: Template<ddm.IModelIssue> = (props) => {
    return new ExprNode(ddm.ModelIssue, props, 'issues');
}

export const ElementSubIssue: Template<ddm.IElementIssue> = (props) => {
    return new ExprNode(ddm.ElementIssue, props, 'subIssues');
}

export const ModelSubIssue: Template<ddm.IModelIssue> = (props) => {
    return new ExprNode(ddm.ModelIssue, props, 'subIssues');
}

export const Dependency: Template<ddm.IDependency> = (props) => {
    return new ExprNode(ddm.Constraint, props, undefined);
}

export const SimpleOption: Template<ddm.ISimpleOption> = (props) => {
    return new ExprNode(ddm.SimpleOption, props, 'optionType');
}

export const CompositeOption: Template<ddm.ICompositeOption> = (props) => {
    return new ExprNode(ddm.CompositeOption, props, 'optionType');
}


