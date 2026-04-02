import * as r from "./REL.meta.model.type"
import { CpxTemplate, ExprNode, Template, WithRefProps } from "../../jsx/element"
import { ModelStore } from "../../index"

export type IModelProps = WithRefProps<r.IRelSchema> & { store?: ModelStore }

export const RelSchema: CpxTemplate<IModelProps, r.IRelSchema> = (props) => {
  return new ExprNode(r.RelSchema, props, undefined)
}

export const Domain: Template<r.IDomain> = (props) => {
  return new ExprNode(r.Domain, props, "domain")
}

export const Column: Template<r.IColumn> = (props) => {
  return new ExprNode(r.Column, props, "columns")
}

export const Table: Template<r.ITable> = (props) => {
  return new ExprNode(r.Table, props, undefined)
}

