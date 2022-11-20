/*
 * Copyright (c) AelasticS 2022.
 *
 */

import * as t from "aelastics-types";
import { ModelElement, Model } from "generic-metamodel";

export const FMModel_TypeSchema = t.schema("FMModelSchema");

export const FMConcept = t.subtype(
  ModelElement,
  {},
  "FMConcept",
  FMModel_TypeSchema
);

export const FeatureDiagram = t.subtype(
  Model,
  {
    root: t.link(FMModel_TypeSchema, "Root"),
  },
  "FeatureDiagram",
  FMModel_TypeSchema
);

export const Attribute = t.subtype(
  FMConcept,
  {
    name: t.string,
  },
  "Attribute",
  FMModel_TypeSchema
);

export const Feature = t.subtype(
  FMConcept,
  {
    minCardinality: t.string.derive().oneOf(["0", "1", "M", "m", "*"]),
    maxCardinality: t.string.derive().oneOf(["1", "M", "m", "*"]),
    attributes: t.arrayOf(Attribute),
  },
  "Feature",
  FMModel_TypeSchema
);

export const Root = t.subtype(Feature, {}, "Root", FMModel_TypeSchema);
export const Child = t.subtype(Feature, {}, "Child", FMModel_TypeSchema);

export const GroupElement = t.subtype(
  Feature,
  {},
  "GroupElement",
  FMModel_TypeSchema
);

export const SolitaryFeature = t.subtype(
  Child,
  {},
  "SolitaryFeature",
  FMModel_TypeSchema
);

export const GroupFeature = t.subtype(
  Child,
  {
    elements: t.arrayOf(GroupElement),
  },
  "GroupFeature",
  FMModel_TypeSchema
);

export type IFMConcept = t.TypeOf<typeof FMConcept>;
export type IAttribute = t.TypeOf<typeof Attribute>;
export type IFeatureDiagram = t.TypeOf<typeof FeatureDiagram>;
export type IFeature = t.TypeOf<typeof Feature>;
export type Root = t.TypeOf<typeof Root>;
export type Child = t.TypeOf<typeof Child>;
export type GroupElement = t.TypeOf<typeof GroupElement>;
export type SolitaryFeature = t.TypeOf<typeof SolitaryFeature>;
export type GroupFeature = t.TypeOf<typeof GroupFeature>;
