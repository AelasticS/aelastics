import * as r from './REL.meta.model.type'
import { CpxTemplate, ExprNode, Template, WithRefProps} from 'aelastics-synthesis'
import { ModelStore } from 'aelastics-synthesis'

export type IModelProps = WithRefProps<r.IRelSchema> & { store?: ModelStore }

export const RelSchema: CpxTemplate<IModelProps, r.IRelSchema> = (props) => {
  return new ExprNode(r.RelSchema, props, undefined)
}

export const Domain: Template<r.IDomain> = (props) => {
  return new ExprNode(r.Domain, props, 'domain')
}

export const Column: Template<r.IColumn> = (props) => {
  return new ExprNode(r.Column, props, 'columns')
}

export const Index: Template<r.IIndex> = (props) => {
  return new ExprNode(r.Index, props, 'indexes')
}

export const ForeignKey: Template<r.IForeignKey> = (props) => {
  return new ExprNode(r.ForeignKey, props, 'foreignKeys')
}

export const Table: Template<r.ITable> = (props) => {
  return new ExprNode(r.Table, props, undefined)
}

