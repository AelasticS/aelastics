/**
 *
 */
import * as t from "aelastics-types";
import { Model, ModelElement } from "generic-metamodel";

export const TypesMM_TypeSchema = t.schema("TypesMM_TypeSchema");

export const Type = t.subtype(ModelElement, {}, "Type", TypesMM_TypeSchema);

export const TypeModel = t.subtype(
  Model,
  {
    types: t.arrayOf(Type),
  },
  "TypeModel",
  TypesMM_TypeSchema
);

export const Optional = t.subtype(
  Type,
  {
    optionalType: Type,
  },
  "Optional",
  TypesMM_TypeSchema
);

export const Property = t.subtype(
  ModelElement,
  {
    domain: Type,
  },
  "Property",
  TypesMM_TypeSchema
);

export const Object = t.subtype(
  Type,
  {
    properties: t.arrayOf(Property),
  },
  "Object",
  TypesMM_TypeSchema
);

export const Subtype = t.subtype(
  Object,
  {
    superType: Object,
  },
  "Subtype",
  TypesMM_TypeSchema
);

// export const Entity = t.subtype(
//   Object,
//   {
//     identifiers: t.arrayOf(t.string),
//   },
//   "Subtype",
//   TypesMM_TypeSchema
// );

export const Array = t.subtype(
  Type,
  {
    elementType: Type,
  },
  "Array",
  TypesMM_TypeSchema
);

export const Union = t.subtype(
  Type,
  {
    elements: t.arrayOf(Property),
    descriminator: t.string,
  },
  "Union",
  TypesMM_TypeSchema
);

// type ISimpleType = t.TypeOf<typeof SimpleType>;
const SimpleType = t.subtype(Type, {}, "SimpleType", TypesMM_TypeSchema);

export const Number = t.subtype(SimpleType, {}, "Number", TypesMM_TypeSchema);
export const String = t.subtype(SimpleType, {}, "String", TypesMM_TypeSchema);
export const Boolean = t.subtype(SimpleType, {}, "Boolean", TypesMM_TypeSchema);

export type IObject = t.TypeOf<typeof Object>;
export type IArray = t.TypeOf<typeof Array>;
export type ISubtype = t.TypeOf<typeof Subtype>;
export type IUnion = t.TypeOf<typeof Union>;
export type IProperty = t.TypeOf<typeof Property>;
export type ITypeModel = t.TypeOf<typeof TypeModel>;
export type IType = t.TypeOf<typeof Type>;
export type IOptional = t.TypeOf<typeof Optional>;

export type INumber = t.TypeOf<typeof Number>;
export type IString = t.TypeOf<typeof String>;
export type IBoolean = t.TypeOf<typeof Boolean>;
