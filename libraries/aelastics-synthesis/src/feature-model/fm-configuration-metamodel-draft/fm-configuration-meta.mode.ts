/*
 * Copyright (c) AelasticS 2022.
 *
 */

import * as t from "aelastics-types";
import {
  FeatureDiagram as FM_FeatureDiagram,
  Feature as FM_Feature,
  Attribute as FM_Attribute,
} from "../fm-metamodel/fm-meta.model.type";
import { ModelElement, Model } from "generic-metamodel";

export const FMConfigModel_TypeSchema = t.schema("FMConfigModel_TypeSchema");

export const Attribute = t.subtype(
  ModelElement,
  {
    name: t.string,
    value: t.string,
    reference: FM_Attribute, // TODO It should refer to an Attribute or an IAttribute? It should be Attribute
  },
  "Attribute",
  FMConfigModel_TypeSchema
);

export const SelectedFeature = t.subtype(
  ModelElement,
  {
    children: t.arrayOf(t.link(FMConfigModel_TypeSchema, "SelectedFeature")),
    reference: FM_Feature, // TODO It should refer to a Feature or an IFeature?
  },
  "SelectedFeature",
  FMConfigModel_TypeSchema
);

export const SolitaryFeature = t.subtype(
  SelectedFeature,
  {},
  "SolitaryFeature",
  FMConfigModel_TypeSchema
);

export const GroupFeature = t.subtype(
  SelectedFeature,
  {},
  "GroupFeature",
  FMConfigModel_TypeSchema
);
export const FMConfiguration = t.subtype(
  Model,
  {
    selectedFeatures: t.arrayOf(SelectedFeature),
    forModel: FM_FeatureDiagram, // TODO It should refer to a FeatureDiagram or an IFeatureDiagram?
  },
  "FMConfiguration",
  FMConfigModel_TypeSchema
);

export type ISelectedFeature = t.TypeOf<typeof SelectedFeature>;
export type IFMConfiguration = t.TypeOf<typeof FMConfiguration>;
export type ISolitaryFeature = t.TypeOf<typeof SolitaryFeature>;
export type IGroupFeature = t.TypeOf<typeof GroupFeature>;
export type IAttribute = t.TypeOf<typeof Attribute>;
