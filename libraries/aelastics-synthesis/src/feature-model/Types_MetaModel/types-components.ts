import * as t from "./types-meta.model";
import { ModelStore } from "../../jsx/ModelsStore";
import {
  CpxTemplate,
  Element,
  Template,
  WithRefProps,
} from "../../jsx/element";

export type IModelProps = WithRefProps<t.ITypeModel> & {
  store?: ModelStore;
};

export const TypeModel: CpxTemplate<IModelProps, t.ITypeModel> = (props) => {
  return new Element(t.TypeModel, props, undefined);
};

export const Object: Template<t.IObject> = (props) => {
  return new Element(t.Object, props, undefined);
};

export const Supertype: Template<t.IObject> = (props) => {
  return new Element(t.Object, props, "superType");
};

export const Subtype: Template<t.ISubtype> = (props) => {
  return new Element(t.Subtype, props, undefined);
};

export const Property: Template<t.IProperty> = (props) => {
  return new Element(t.Property, props, "properties");
};

export const Array: Template<t.IArray> = (props) => {
  return new Element(t.Array, props, undefined);
};

export const ArrayType: Template<t.IType> = (props) => {
  return new Element(t.Type, props, "elementType");
};

export const Union: Template<t.IUnion> = (props) => {
  return new Element(t.Union, props, undefined);
};

export const Optional: Template<t.IOptional> = (props) => {
  return new Element(t.Optional, props, undefined);
};

export const OptionalType: Template<t.IType> = (props) => {
  return new Element(t.Type, props, "optionalType");
};
