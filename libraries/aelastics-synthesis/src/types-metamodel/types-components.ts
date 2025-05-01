import * as t from "./types-meta.model"
import { ModelStore } from "../index"
import {
  CpxTemplate,
  Element,
  Template,
  WithRefProps,
} from "../jsx/element"

export type IModelProps = WithRefProps<t.ITypeModel> & {
  store?: ModelStore;
};

export const TypeModel: CpxTemplate<IModelProps, t.ITypeModel> = (props) => {
  return new Element(t.TypeModel, props, undefined)
}

export const TypeObject: Template<t.IObject> = (props) => {
  return new Element(t.Object, props, "types")
}

export const TypeEntity: Template<t.IEntity> = (props) => {
  return new Element(t.Entity, props, "types")
}

export const TypeSupertype: Template<t.IObject> = (props) => {
  return new Element(t.Object, props, "superType")
}

export const TypeSubtype: Template<t.ISubtype> = (props) => {
  return new Element(t.Subtype, props, "types")
}

export const Property: Template<t.IProperty> = (props) => {
  return new Element(t.Property, props, "properties")
}

export const TypeObjectReference: Template<t.IObjectReference> = (props) => {
  return new Element(t.ObjectReference, props, 'types')
}

export const TypeArray: Template<t.IArray> = (props) => {
  return new Element(t.Array, props, "types")
}

export const TypeUnion: Template<t.IUnion> = (props) => {
  return new Element(t.Union, props, "types")
}

export const TypeOptional: Template<t.IOptional> = (props) => {
  return new Element(t.Optional, props, "types")
}

export const ArrayElementType: Template<t.IType> = (props) => {
  return new Element(t.Type, props, "elementType")
}

export const PropertyDomain: Template<t.IType> = (props) => {
  return new Element(t.Type, props, "domain")
}

export const TypeOfOptional: Template<t.IType> = (props) => {
  return new Element(t.Type, props, "optionalType")
}
