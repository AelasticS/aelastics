import * as r from './REL.meta.model.type'
import { STX } from '../../jsx/handle'

export type IDomainProps = Partial<r.IDomain> & STX.InstanceProps
export type ITableProps = Partial<r.ITable> & STX.InstanceProps
export type IRelSchemaProps = Partial<r.IRelSchema> & STX.InstanceProps
export type IColumnProps = Partial<r.IColumn> & STX.InstanceProps
export type IIndexProps = Partial<r.IIndex> & STX.InstanceProps
export type IForeignKeyProps = Partial<r.IForeignKey> & STX.InstanceProps


export const RelSchema: STX.Template<IRelSchemaProps, r.IRelSchema> = (props,store) => {
    return STX.createChild(r.RelSchema, props, STX.createConnectFun({
      // parentPropName:"domain", parentPropType:'Object'
     // childPropName:"", childPropType:'Array'
    }), store)
  }

export const Domain: STX.Template<IDomainProps, r.IDomain> = (props,store) => {
    return STX.createChild(r.Domain, props, STX.createConnectFun({
      parentPropName:"domain", parentPropType:'Object'
     // childPropName:"", childPropType:'Array'
    }), store)
  }

  export const Column: STX.Template<IColumnProps, r.IIndex> = (props,store) => {
    return STX.createChild(r.Index, props, STX.createConnectFun({
        parentPropName:'columns', parentPropType:'Array',
        childPropName:'ownerTable', childPropType:'Object'
    }), store)
  }

  export const Index: STX.Template<IIndexProps, r.IColumn> = (props,store) => {
    return STX.createChild(r.Column, props, STX.createConnectFun({
        parentPropName:'indexes', parentPropType:'Array',
        childPropName:'ownerTable', childPropType:'Object'
    }), store)
  }

  export const ForeignKey: STX.Template<IIndexProps, r.IColumn> = (props,store) => {
    return STX.createChild(r.Column, props, STX.createConnectFun({
        parentPropName:'foreignKeys', parentPropType:'Array',
        childPropName:'ownerTable', childPropType:'Object'
    }), store)
  }

  export const Table: STX.Template<ITableProps, r.ITable> = (props,store) => {
    return STX.createChild(r.Table, props, STX.createConnectFun({
        // parentPropName:'foreignKeys', parentPropType:'Array',
        // childPropName:'ownerTable', childPropType:'Object'
    }), store)
  }