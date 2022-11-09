import { STX } from '../jsx/handle'
import * as tr from './transformation.model.type'

export type IM2M_TransformationProps = Partial<tr.IM2M_Transformation> & STX.InstanceProps
export type IE2E_TransformationProps = Partial<tr.IE2E_Transformation> & STX.InstanceProps
export type IM2M_TraceProps = Partial<tr.IM2M_Trace> & STX.InstanceProps
export type IE2E_TraceProps = Partial<tr.IE2E_Trace> & STX.InstanceProps

export const M2M_Transformation: STX.Template<IM2M_TransformationProps, tr.IM2M_Transformation> =
 (props, store) => {
    return STX.createChild(tr.M2M_Transformation, props, STX.createConnectFun({
        // parentPropName:"instances", parentPropType:'Array',
        // childPropName:"instanceOf", childPropType:'Object'
      }), store)
}

export const E2E_Transformation: STX.Template<IE2E_TransformationProps, tr.IE2E_Transformation> =
 (props, store) => {
    return STX.createChild(tr.E2E_Transformation, props, STX.createConnectFun({
        // parentPropName:"instances", parentPropType:'Array',
        // childPropName:"instanceOf", childPropType:'Object'
      }), store)
}

export const M2M_Trace: STX.Template<IM2M_TraceProps, tr.IM2M_Trace> = (props, store) => {
    return STX.createChild(tr.M2M_Trace, props, STX.createConnectFun({
        // parentPropName:"instances", parentPropType:'Array',
        childPropName:"instanceOf", childPropType:'Object'
      }), store)
}

export const E2E_Trace: STX.Template<IE2E_TraceProps, tr.IE2E_Trace> = (props, store) => {
    return STX.createChild(tr.E2E_Trace, props, STX.createConnectFun({
        // parentPropName:"instances", parentPropType:'Array',
        childPropName:"instanceOf", childPropType:'Object'
      }), store)
}

