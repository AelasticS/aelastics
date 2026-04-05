import { ModelStore } from "../index"
import { Model as GenericModel, ModelElement, IModel, IModelElement } from "generic-metamodel"
import { CpxTemplate, ExprNode, Template, WithRefProps } from "../jsx/element"

export type IModelProps = WithRefProps<IModel> & {
  store?: ModelStore;
};

export const Model: CpxTemplate<IModelProps, IModel> = (props) => {
  return new ExprNode(GenericModel, props, undefined)
}

export const Element: Template<IModelElement> = (props) => {
  return new ExprNode(ModelElement, props, undefined)
}