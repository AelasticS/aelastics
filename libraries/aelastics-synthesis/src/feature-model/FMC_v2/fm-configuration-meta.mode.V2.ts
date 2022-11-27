/*
 * Copyright (c) AelasticS 2022.
 *
 */

import * as t from "aelastics-types";
import {
  FeatureDiagram as FM_FeatureDiagram,
  Feature as FM_Feature,
  Attribute as FM_Attribute,
} from "../FM_v2/fm-meta.model-V2.type";
import { ModelElement, Model } from "generic-metamodel";

export const FMConfigModel_TypeSchema = t.schema("FMConfigModel_TypeSchema");

export const Attribute = t.object(
  {
    name: t.string,
    value: t.string,
    reference: FM_Attribute, // referencira Attribute as FM metamodela. Da li treba ovo ili interfejs
  },
  "Attribute",
  FMConfigModel_TypeSchema
);

export const SelectedFeature = t.object(
  {
    // name: t.string, // nema smisla ovde, jer se ime dobija po vezi. Osim kod instance, ali onda spustiti na podtip
    children: t.arrayOf(t.link(FMConfigModel_TypeSchema, "SelectedFeature")),
    reference: FM_Feature, // referencira Feature as FM metamodela. Da li treba ovo ili interfejs
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
export const FMConfiguration = t.object(
  {
    name: t.string,
    selectedFeatures: t.arrayOf(SelectedFeature),
    forModel: FM_FeatureDiagram, // referencira FeatureDiagram as FM metamodela. Da li treba ovo ili interfejs
  },
  "FMConfiguration",
  FMConfigModel_TypeSchema
);

export type ISelectedFeature = t.TypeOf<typeof SelectedFeature>;
export type IFMConfiguration = t.TypeOf<typeof FMConfiguration>;
export type ISolitaryFeature = t.TypeOf<typeof SolitaryFeature>;
export type IGroupFeature = t.TypeOf<typeof GroupFeature>;
export type IAttribute = t.TypeOf<typeof Attribute>;
