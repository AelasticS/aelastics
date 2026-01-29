import * as mlbm from './modeling-language-binding-meta.model'

import { ModelStore } from '../../index';
import { CpxTemplate, Element, Template, WithRefProps } from "../../jsx/element";

export type IModelProps = WithRefProps<mlbm.IModelingLanguageBindingModel> & {
    store?: ModelStore;
};

export const ModelingLanguageBindingModel: CpxTemplate<IModelProps, mlbm.IModelingLanguageBindingModel> = (props) => {
    return new Element(mlbm.ModelingLanguageBindingModel, props, undefined);
}

export const ModelingLanguageBindingElement: Template<mlbm.IModelingLanguageBindingElement> = (props) => {
    return new Element(mlbm.ModelingLanguageBindingElement, props, 'bindings');
}