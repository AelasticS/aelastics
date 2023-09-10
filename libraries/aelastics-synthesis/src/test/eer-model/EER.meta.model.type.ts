/*
 * Copyright (c) AelasticS 2020.
 *
 */

import * as t from "aelastics-types";
import { ModelElement, Model } from "generic-metamodel";

// tslint:disable-next-line:variable-name
export const EERModel_TypeSchema = t.schema("EERModelSchema");

export const IntegityRule = t.string.derive().oneOf(["R", "C", "N", "D"]); // .defaultValue("R");

export const ERConcept = t.subtype(
  ModelElement,
  {
    conceptType: t.string
      .derive()
      .oneOf([
        "Domain",
        "Submodel",
        "EERSchema",
        "Attribute",
        "Entity",
        "Kernel",
        "Weak",
        "Aggregation",
        "Subtype",
        "Specialization",
        "Mapping",
        "WeakMapping",
        "AggregationMapping",
        "OrdinaryMapping",
        "SpecializationMapping",
        "Relationship",
      ]),
  },
  "ERConcept",
  EERModel_TypeSchema
);

export const Domain = t.subtype(ERConcept, {}, "Domain", EERModel_TypeSchema);

export const Submodel = t.subtype(
  ERConcept,
  {
    concepts: t.arrayOf(ERConcept),
  },
  "Submodel",
  EERModel_TypeSchema
);

export const EERSchema = t.subtype(
  Model,
  {
    submodels: t.arrayOf(Submodel),
  },
  "EERSchema",
  EERModel_TypeSchema
);

export const Attribute = t.subtype(
  ERConcept,
  {
    attrDomain: Domain,
    attrEntity: t.link(EERModel_TypeSchema, "Entity"),
    isKey: t.boolean,
    defaultValue: t.optional(t.string),
  },
  "Attribute",
  EERModel_TypeSchema
);

export const Entity = t.subtype(
  ERConcept,
  {
    attributes: t.arrayOf(Attribute),
    mappings: t.arrayOf(t.link(EERModel_TypeSchema, "Mapping")),
  },
  "Entity",
  EERModel_TypeSchema
);

t.inverseProps(Attribute, "attrEntity", Entity, "attributes");

export const Kernel = t.subtype(Entity, {}, "Kernel", EERModel_TypeSchema);

export const Weak = t.subtype(
  Entity,
  {
    weakMap: t.optional(t.link(EERModel_TypeSchema, "WeakMapping")),
  },
  "Weak",
  EERModel_TypeSchema
);

export const Aggregation = t.subtype(
  Entity,
  {
    agrMapp: t.arrayOf(t.link(EERModel_TypeSchema, "AggregationMapping")),
  },
  "Aggregation",
  EERModel_TypeSchema
);

export const Subtype = t.subtype(
  Entity,
  {
    supertype: t.link(EERModel_TypeSchema, "Specialization"),
    cnSupertype: IntegityRule,
    dcnSupertype: IntegityRule,
    cnSubtype: IntegityRule,
    dcnSubtype: IntegityRule,
  },
  "Subtype",
  EERModel_TypeSchema
);

export const Mapping = t.subtype(
  ERConcept,
  {
    domain: Entity,
    lowerBound: t.string.derive().oneOf(["0", "1", "M", "m", "*"]), // .defaultValue("0"),
    upperBound: t.string.derive().oneOf(["1", "M", "m", "*"]), // .defaultValue("M"),
    cnMapp: IntegityRule,
    dcnMapp: IntegityRule,
  },
  "Mapping",
  EERModel_TypeSchema
);

export const WeakMapping = t.subtype(
  Mapping,
  {
    codomain: Weak,
    cnWeakOwner: IntegityRule,
    dcnWeakOwner: IntegityRule,
  },
  "WeakMapping",
  EERModel_TypeSchema
);

export const AggregationMapping = t.subtype(
  Mapping,
  {
    codomain: Aggregation,
    cnAggrOwner: IntegityRule,
    dcnAggrOwner: IntegityRule,
  },
  "AggregationMapping",
  EERModel_TypeSchema
);

export const OrdinaryMapping = t.subtype(
  Mapping,
  {
    relationship: t.link(EERModel_TypeSchema, "Relationship", "relationship"),
  },
  "OrdinaryMapping",
  EERModel_TypeSchema
);

export const SpecializationMapping = t.subtype(
  Mapping,
  {
    specialization: t.optional(t.link(EERModel_TypeSchema, "Specialization")),
  },
  "SpecializationMapping",
  EERModel_TypeSchema
);

export const Specialization = t.subtype(
  ERConcept,
  {
    mapping: t.optional(SpecializationMapping),
    subtypes: t.arrayOf(Subtype),
  },
  "Specialization",
  EERModel_TypeSchema
);

export const Relationship = t.subtype(
  ERConcept,
  {
    ordinaryMapping: t.arrayOf(OrdinaryMapping),
  },
  "Relationship",
  EERModel_TypeSchema
);

t.inverseProps(
  Relationship,
  "ordinaryMapping",
  OrdinaryMapping,
  "relationship"
);
t.inverseProps(Entity, "mappings", Mapping, "domain");
t.inverseProps(Weak, "weakMap", WeakMapping, "codomain");
t.inverseProps(Aggregation, "agrMapp", AggregationMapping, "codomain");
t.inverseProps(Subtype, "supertype", Specialization, "subtypes");
t.inverseProps(
  Specialization,
  "mapping",
  SpecializationMapping,
  "specialization"
);

export type IERConcept = t.TypeOf<typeof ERConcept>;
export type IDomain = t.TypeOf<typeof Domain>;
export type ISubmodel = t.TypeOf<typeof Submodel>;
export type IEERSchema = t.TypeOf<typeof EERSchema>;
export type IAttribute = t.TypeOf<typeof Attribute>;
export type IEntity = t.TypeOf<typeof Entity>;
export type IKernel = t.TypeOf<typeof Kernel>;
export type IWeak = t.TypeOf<typeof Weak>;
export type IAggregation = t.TypeOf<typeof Aggregation>;
export type ISubtype = t.TypeOf<typeof Subtype>;
export type ISpecialization = t.TypeOf<typeof Specialization>;
export type IMapping = t.TypeOf<typeof Mapping>;
export type IWeakMapping = t.TypeOf<typeof WeakMapping>;
export type IAggregationMapping = t.TypeOf<typeof AggregationMapping>;
export type IOrdinaryMapping = t.TypeOf<typeof OrdinaryMapping>;
export type ISpecializationMapping = t.TypeOf<typeof SpecializationMapping>;
export type IRelationship = t.TypeOf<typeof Relationship>;

export const getCodomain = (mapping: IOrdinaryMapping): IEntity => {
  return getInverse(mapping).domain;
};

export const getInverse = (mapping: IOrdinaryMapping): IOrdinaryMapping => {
  const first: IOrdinaryMapping = (mapping.relationship as IRelationship)
    .ordinaryMapping[0];
  const second: IOrdinaryMapping = (mapping.relationship as IRelationship)
    .ordinaryMapping[1];

  return first === mapping ? second : first;
};
