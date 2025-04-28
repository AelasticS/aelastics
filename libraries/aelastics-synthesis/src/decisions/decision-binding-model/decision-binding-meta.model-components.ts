import * as dbm from './decision-binding-meta.model'

import { ModelStore } from './../../index';
import { CpxTemplate, Element, Template, WithRefProps } from "../../jsx/element";

export type IModelProps = WithRefProps<dbm.IDecisionBindingModel> & {
    store?: ModelStore;
};

export const DecisionBindingModel: CpxTemplate<IModelProps, dbm.IDecisionBindingModel> = (props) => {
    return new Element(dbm.DecisionBindingModel, props, undefined);
}

export const DecisionBindingElement: Template<dbm.IDecisionBindingElement> = (props) => {
    return new Element(dbm.DecisionBindingElement, props, 'bindings');
}