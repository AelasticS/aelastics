import * as gdm from './generic-decision-meta.model';
import { ModelStore } from './../../index';
import { CpxTemplate, Element, Template, WithRefProps } from "../../jsx/element";

export type IModelProps = WithRefProps<gdm.IGenericDecisionModel> & {
    store?: ModelStore;
};

export const GenericDecisionModel: CpxTemplate<IModelProps, gdm.IGenericDecisionModel> = (props) => {
    return new Element(gdm.GenericDecisionModel, props, undefined);
};


export const Option: Template<gdm.IOption> = (props) => {
    return new Element(gdm.Option, props, 'possibleOptions');
}

export const Issue: Template<gdm.IIssue> = (props) => {
    // todo: there is a problem with 3rd parameter, when structure is recursive. Sometimes it is 'roots' and sometimes 'elements'
    return new Element(gdm.Issue, props, 'roots');
}

export const Dependency: Template<gdm.IDependency> = (props) => {
    return new Element(gdm.Constraint, props, undefined);
}
