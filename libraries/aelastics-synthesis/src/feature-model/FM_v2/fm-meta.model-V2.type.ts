/*
 * Copyright (c) AelasticS 2022.
 *
 */

import * as t from "aelastics-types";
import { ModelElement, Model } from "generic-metamodel";

export const FMModel_TypeSchema = t.schema("FMModelSchema");

// export const FMConcept = t.subtype(
//   ModelElement,
//   {},
//   "FMConcept",
//   FMModel_TypeSchema
// );

export const FMConcept = t.object(
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

// export const FeatureDiagram = t.subtype(
//   Model,
//   {
//     root: Root,
//   },
//   "FeatureDiagram",
//   FMModel_TypeSchema
// );

export const FeatureDiagram = t.object(
  {
    root: SolitaryFeature,
    elements: t.arrayOf(FMConcept), // ovo je od opsteg modela ostalo... mozda i ne treba
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
