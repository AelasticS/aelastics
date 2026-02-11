/*
 * Copyright (c) AelasticS 2020.
 *
 */

import * as t from "aelastics-types"

import { ModelElement, Model } from "generic-metamodel"

// tslint:disable-next-line:variable-name
export const RelModel_TypeSchema = t.schema("EERModelSchema");

export const RelSchema = t.subtype(Model, {
}, "RelSchema", RelModel_TypeSchema);

export const Domain = t.subtype(ModelElement, {
  type: t.string,
  defaultValue: t.optional(t.string)
}, "Domain", RelModel_TypeSchema);

export const Column = t.subtype(ModelElement, {
  domain: Domain,
  isKey: t.boolean,
  ownerTable: t.link(RelModel_TypeSchema, 'Table'),
  indexes: t.arrayOf(t.link(RelModel_TypeSchema, "Index")),
  isForeignKey: t.link(RelModel_TypeSchema, 'Column'),
  references: t.string
}, "Column", RelModel_TypeSchema);

export const Table = t.subtype(ModelElement, {
  columns: t.arrayOf(Column),
}, "Table", RelModel_TypeSchema);


export type ITable = t.TypeOf<typeof Table>
export type IRelSchema = t.TypeOf<typeof RelSchema>
export type IDomain = t.TypeOf<typeof Domain>
export type IColumn = t.TypeOf<typeof Column>