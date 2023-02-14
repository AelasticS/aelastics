/*
 * Copyright (c) AelasticS 2022.
 *
 */

import * as t from "aelastics-types";
import { Model, ModelElement } from "generic-metamodel";

export const FMModel_TypeSchema = t.schema("FMModelSchema");

export const Attribute = t.subtype(
  ModelElement,
  {
    type: t.string.derive("DataType").oneOf(["int", "string"]),
  },
  "Attribute",
  FMModel_TypeSchema
);

export const Feature = t.subtype(
  ModelElement,
  {
    // ideja je da se * predstavi kao -1, da bi mogla bilo koji broj da se upise
    minCardinality: t.number.derive().greaterThanOrEqual(-1),

    // ne znam kako da stavim da treba da bude >= 1, ali i >= minCardinality
    maxCardinality: t.number.derive().greaterThanOrEqual(1),
    subfeatures: t.arrayOf(t.link(FMModel_TypeSchema, "Feature")),
  },
  "Feature",
  FMModel_TypeSchema
);

export const SolitaryFeature = t.subtype(
  Feature,
  { attributes: t.arrayOf(Attribute) },
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
  {},
  "FeatureDiagram",
  FMModel_TypeSchema
);

export type IAttribute = t.TypeOf<typeof Attribute>;
export type IFeatureDiagram = t.TypeOf<typeof FeatureDiagram>;
export type ISolitaryFeature = t.TypeOf<typeof SolitaryFeature>;
export type IGroupFeature = t.TypeOf<typeof GroupFeature>;
export type IFeature = t.TypeOf<typeof Feature>;
