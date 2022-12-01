import { Element, Template, WithRefProps } from '../jsx2/element'
import * as tr from './transformation.model.type'


export const M2M_Transformation: Template<tr.IM2M_Transformation> = (props) => {
    return new Element(tr.M2M_Transformation, props)
}

export const E2E_Transformation: Template<tr.IE2E_Transformation> = (props) => {
  return new Element(tr.M2M_Transformation, props, "instances")
}

export const M2M_Trace: Template<tr.IM2M_Trace> = (props) => {
  return new Element(tr.M2M_Trace, props, "instances") //childPropName:"instanceOf", childPropType:'Object'
}


export const E2E_Trace: Template<tr.IE2E_Trace> = (props) => {
  return new Element(tr.E2E_Trace, props, "instances") //childPropName:"instanceOf", childPropType:'Object'
}


