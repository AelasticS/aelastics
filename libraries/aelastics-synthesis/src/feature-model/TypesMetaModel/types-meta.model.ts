/**
 *
 */
import * as t from "aelastics-types";

export const TypesMM_TypeSchema = t.schema("TypesMM_TypeSchema");

// #####################  ZA BRISANJE   ########################
export const ModelElement = t.object(
  {
    // name must be proper alphanumeric
    // label is logically same as name, but can it be consisting of several words (and shown in multiple lines)
    // label is shown and entered in UI; name is computed from label by removing all extra spaces and newlines
    name: t.string,
  },
  "ModelElement",
  TypesMM_TypeSchema
);

export const Model = t.subtype(
  ModelElement,
  {
    elements: t.arrayOf(ModelElement),
  },
  "Model",
  TypesMM_TypeSchema
);

export type IModelElement = t.TypeOf<typeof ModelElement>;
export type IModel = t.TypeOf<typeof Model>;

// #################  KRAJ DELA ZA BRISANJE  #####################

export const Type = t.subtype(ModelElement, {}, "Type", TypesMM_TypeSchema);

export const TypeModel = t.subtype(Model, {}, "TypeModel", TypesMM_TypeSchema);

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
    superType: Type,
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
  Object,
  {
    elementType: Type,
  },
  "Array",
  TypesMM_TypeSchema
);

export const Union = t.subtype(
  Object,
  {
    elements: t.arrayOf(Property),
    descriminator: t.string,
  },
  "Union",
  TypesMM_TypeSchema
);

type ISimpleType = t.TypeOf<typeof SimpleType>;
const SimpleType = t.subtype(Type, {}, "SimpleType", TypesMM_TypeSchema);

export const number: ISimpleType = { name: "Number" };
export const boolean: ISimpleType = { name: "Boolean" };
export const string: ISimpleType = { name: "String" };

export type IObject = t.TypeOf<typeof Object>;
export type IArray = t.TypeOf<typeof Array>;
export type ISubtype = t.TypeOf<typeof Subtype>;
export type IUnion = t.TypeOf<typeof Union>;
export type IProperty = t.TypeOf<typeof Property>;
export type ITypeModel = t.TypeOf<typeof TypeModel>;
