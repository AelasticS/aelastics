/*
 * Copyright (c) AelasticS 2022.
 *
 */

import * as t from "aelastics-types";

export const FMModel_TypeSchema = t.schema("FMModelSchema");

// #####################  ZA BRISANJE   ########################

export const ModelElement = t.object(
  {
    name: t.string,
  },
  "ModelElement",
  FMModel_TypeSchema
);

export const Model = t.subtype(
  ModelElement,
  {
    elements: t.arrayOf(ModelElement),
  },
  "Model",
  FMModel_TypeSchema
);

export type IModelElement = t.TypeOf<typeof ModelElement>;
export type IModel = t.TypeOf<typeof Model>;

// #################  KRAJ DELA ZA BRISANJE  #####################

export const FMConcept = t.subtype(
  ModelElement,
  {
    name: t.string,
  },
  "FMConcept",
  FMModel_TypeSchema
);

export const Attribute = t.subtype(
  FMConcept,
  {
    name: t.string,
    type: t.string.derive("DataType").oneOf(["int", "string"]),
  },
  "Attribute",
  FMModel_TypeSchema
);

export const Feature = t.subtype(
  FMConcept,
  {
    minCardinality: t.string.derive().oneOf(["0", "1", "M", "m", "*"]),
    maxCardinality: t.string.derive().oneOf(["1", "M", "m", "*"]),
    children: t.optional(t.arrayOf(t.link(FMModel_TypeSchema, "Feature"))),
  },
  "Feature",
  FMModel_TypeSchema
);

export const SolitaryFeature = t.subtype(
  Feature,
  { attributes: t.optional(t.arrayOf(Attribute)) },
  "SolitaryFeature",
  FMModel_TypeSchema
);

export const GroupFeature = t.subtype(
  Feature,
  {},
  "GroupFeature",
  FMModel_TypeSchema
);

export const FeatureDiagram = t.subtype(
  Model,
  {
    name: t.string,
    root: SolitaryFeature,
  },
  "FeatureDiagram",
  FMModel_TypeSchema
);

export type IFMConcept = t.TypeOf<typeof FMConcept>;
export type IAttribute = t.TypeOf<typeof Attribute>;
export type IFeatureDiagram = t.TypeOf<typeof FeatureDiagram>;
export type IFeature = t.TypeOf<typeof Feature>;
export type ISolitaryFeature = t.TypeOf<typeof SolitaryFeature>;
export type IGroupFeature = t.TypeOf<typeof GroupFeature>;
