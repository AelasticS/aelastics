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
  // foreignKeys: t.arrayOf(t.link(RelModel_TypeSchema, "ForeignKey")),
}, "Column", RelModel_TypeSchema);

export const Index = t.subtype(ModelElement, {
  ownerTable: t.link(RelModel_TypeSchema, 'Table'),
  columns: t.arrayOf(Column),
  isUnique: t.boolean
}, "Index", RelModel_TypeSchema);

export const ForeignKeyColumn = t.subtype(ModelElement, {
  fkColumn: Column,
  refColumn: Column
}, 'ForeignKeyColumn', RelModel_TypeSchema);

export const ForeignKey = t.subtype(ModelElement, {
  ownerTable: t.link(RelModel_TypeSchema, 'Table'),
  fkColumns: t.arrayOf(ForeignKeyColumn),
  isUnique: t.boolean,
  referencedTable: t.link(RelModel_TypeSchema, 'Table')
}, "ForeignKey", RelModel_TypeSchema);

export const Table = t.subtype(ModelElement, {
  columns: t.arrayOf(Column),
  indexes: t.arrayOf(Index),
  foreignKeys: t.arrayOf(ForeignKey)
}, "Table", RelModel_TypeSchema);


export type ITable = t.TypeOf<typeof Table>
export type IRelSchema = t.TypeOf<typeof RelSchema>
export type IDomain = t.TypeOf<typeof Domain>
export type IColumn = t.TypeOf<typeof Column>
export type IIndex = t.TypeOf<typeof Index>
export type IForeignKey = t.TypeOf<typeof ForeignKey>
export type IForeignKeyColumn = t.TypeOf<typeof ForeignKeyColumn>

