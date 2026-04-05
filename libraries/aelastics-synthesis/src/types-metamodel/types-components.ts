import * as t from "./types-meta.model"
import { ModelStore } from "../index"
import {
  CpxTemplate,
  ExprNode,
  Template,
  WithRefProps,
} from "../jsx/element"

export type IModelProps = WithRefProps<t.ITypeModel> & {
  store?: ModelStore;
};

export const TypeModel: CpxTemplate<IModelProps, t.ITypeModel> = (props) => {
  return new ExprNode(t.TypeModel, props, undefined)
}

export const TypeObject: Template<t.IObject> = (props) => {
  return new ExprNode(t.Object, props, "types")
}

export const TypeEntity: Template<t.IEntity> = (props) => {
  return new ExprNode(t.Entity, props, "types")
}

export const TypeSupertype: Template<t.IObject> = (props) => {
  return new ExprNode(t.Object, props, "superType")
}

export const TypeSubtype: Template<t.ISubtype> = (props) => {
  return new ExprNode(t.Subtype, props, "types")
}

export const Property: Template<t.IProperty> = (props) => {
  return new ExprNode(t.Property, props, "properties")
}

export const TypeObjectReference: Template<t.IObjectReference> = (props) => {
  return new ExprNode(t.ObjectReference, props, 'types')
}

export const TypeArray: Template<t.IArray> = (props) => {
  return new ExprNode(t.Array, props, "types")
}

export const TypeUnion: Template<t.IUnion> = (props) => {
  return new ExprNode(t.Union, props, "types")
}

export const UnionElement: Template<t.IProperty> = (props) => {
  return new ExprNode(t.Property, props, "elements")
}

export const TypeOptional: Template<t.IOptional> = (props) => {
  return new ExprNode(t.Optional, props, "types")
}

export const ArrayElementType: Template<t.IType> = (props) => {
  return new ExprNode(t.Type, props, "elementType")
}

export const PropertyDomain: Template<t.IType> = (props) => {
  return new ExprNode(t.Type, props, "domain")
}

export const TypeOfOptional: Template<t.IType> = (props) => {
  return new ExprNode(t.Type, props, "optionalType")
}

export const TypeLink: Template<t.ILink> = (props) => {
  return new ExprNode(t.Link, props, "types")
}

export const InverseProperty: Template<t.IInverseProperty> = (props) => {
  return new ExprNode(t.InverseProperty, props, "types")
}

export const TypeLiteral: Template<t.ILiteral> = (props) => {
  return new ExprNode(t.Literal, props, "types")
}
