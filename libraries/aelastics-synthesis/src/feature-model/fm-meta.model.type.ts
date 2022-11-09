/*
 * Copyright (c) AelasticS 2022.
 *
 */

import * as t from "aelastics-types";
import { ModelElement, Model } from "generic-metamodel";

export const FMModel_TypeSchema = t.schema("FMModel");

export const FeatureModel = t.subtype(
  Model,
  {
    aaa: t.string,
    child: t.link(FMModel_TypeSchema, "Feature"),
  },
  "FeatureModel",
  FMModel_TypeSchema
);

export const Feature = t.subtype(
  ModelElement,
  {
    parent: FeatureModel,
  },
  "Feature",
  FMModel_TypeSchema
);

t.inverseProps(Feature, "parent", FeatureModel, "child");

// t.unionOf([t.literal('male'), t.literal("female")],"sexType"),
