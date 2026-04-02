import * as mlbm from './binding-meta.model'

import { ModelStore } from '../../index';
import { CpxTemplate, ExprNode, Template, WithRefProps } from "../../jsx/element";

export type IModelProps = WithRefProps<mlbm.IBindingModel> & {
    store?: ModelStore;
};

export const BindingModel: CpxTemplate<IModelProps, mlbm.IBindingModel> = (props) => {
    return new ExprNode(mlbm.BindingModel, props, undefined);
}

export const BindingElement: Template<mlbm.IBindingElement> = (props) => {
    return new ExprNode(mlbm.BindingElement, props, 'bindings');
}

export const Binding: Template<mlbm.IBindingElement> = (props) => {
    return new ExprNode(mlbm.BindingElement, props, 'bindings');
}

