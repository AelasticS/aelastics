import * as t from "./types-meta.model";
import { ModelStore } from '../index'
import {
  CpxTemplate,
  Element,
  Template,
  WithRefProps,
} from "../jsx/element";

export type IModelProps = WithRefProps<t.ITypeModel> & {
  store?: ModelStore;
};

export const TypeModel: CpxTemplate<IModelProps, t.ITypeModel> = (props) => {
  return new Element(t.TypeModel, props, undefined);
};

export const TypeObject: Template<t.IObject> = (props) => {
  return new Element(t.Object, props, undefined);
};

export const TypeSupertype: Template<t.IObject> = (props) => {
  return new Element(t.Object, props, "superType");
};

export const TypeSubtype: Template<t.ISubtype> = (props) => {
  return new Element(t.Subtype, props, undefined);
};

export const Property: Template<t.IProperty> = (props) => {
  return new Element(t.Property, props, "properties");
};

export const TypeArray: Template<t.IArray> = (props) => {
  return new Element(t.Array, props, undefined);
};

export const TypeUnion: Template<t.IUnion> = (props) => {
  return new Element(t.Union, props, undefined);
};

export const TypeOptional: Template<t.IOptional> = (props) => {
  return new Element(t.Optional, props, undefined);
};

export const ArrayElementType: Template<t.IType> = (props) => {
  return new Element(t.Type, props, "elementType");
};

export const PropertyDomain: Template<t.IType> = (props) => {
  return new Element(t.Type, props, "domain");
};

export const TypeOfOptional: Template<t.IType> = (props) => {
  return new Element(t.Type, props, "optionalType");
};

export const TypeInUnion: Template<t.IType> = (props) => {
  return new Element(t.Type, props, "unionTypes");
};
