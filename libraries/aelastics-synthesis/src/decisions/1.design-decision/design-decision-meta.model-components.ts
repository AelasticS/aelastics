import * as ddm from './design-decision-meta.model';
import { ModelStore } from '../../index';
import { CpxTemplate, Element, Template, WithRefProps } from "../../jsx/element";

export type IDecisionModelProps = WithRefProps<ddm.IDecisionModel> & {
    store?: ModelStore;
};

export const DecisionModel: CpxTemplate<IDecisionModelProps, ddm.IDecisionModel> = (props) => {
    return new Element(ddm.DesignDecisionModel, props, undefined);
};

export const Option: Template<ddm.IOption> = (props) => {
    return new Element(ddm.Option, props, 'possibleOptions');
}

export const Issue: Template<ddm.IIssue> = (props) => {
    // todo: there is a problem with 3rd parameter, when structure is recursive. Sometimes it is 'roots' and sometimes 'elements'
    return new Element(ddm.Issue, props, 'issues');
}

export const SubIssue: Template<ddm.IIssue> = (props) => {
    // todo: there is a problem with 3rd parameter, when structure is recursive. Sometimes it is 'roots' and sometimes 'elements'
    return new Element(ddm.Issue, props, 'subIssues');
}

export const Dependency: Template<ddm.IDependency> = (props) => {
    return new Element(ddm.Constraint, props, undefined);
}

export const SimpleOption: Template<ddm.ISimpleOption> = (props) => {
    return new Element(ddm.SimpleOption, props, 'optionType');
}

export const CompositeOption: Template<ddm.ICompositeOption> = (props) => {
    return new Element(ddm.CompositeOption, props, 'optionType');
}


