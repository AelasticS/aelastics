import * as uml from './uml.meta.model.type'
import { ConnectionInfo, CpxTemplate, ExprNode, Template, WithRefProps, defaultConnectionInfo } from 'aelastics-synthesis'
import { ModelStore } from 'aelastics-synthesis'

export type IClassDiagramProps = WithRefProps<uml.IClassDiagram> & { store?: ModelStore }

export const ClassDiagram: CpxTemplate<IClassDiagramProps, uml.IClassDiagram> = (props) => {
    return new ExprNode(uml.ClassDiagram, props, undefined)
}

export const Class: Template<uml.IClass> = (props) => {
    const connInfo:ConnectionInfo = defaultConnectionInfo(undefined)
    return new ExprNode(uml.Class, props, connInfo)
}

export const SuperClass: Template<uml.IClass> = (props) => {
    const connInfo:ConnectionInfo = {
        propName:"subClasses",
        isParentProp:true,
        isReconnectAllowed:false,
        textContentAllowed:false,
        textPropName:""
    }
    return new ExprNode(uml.Class, props, connInfo)
}

export const Property: Template<uml.IProperty> = (props) => {
    const connInfo:ConnectionInfo = {
        propName:"properties",
        isParentProp:true,
        isReconnectAllowed:false,
        textContentAllowed:false,
        textPropName:""
    }
    return new ExprNode(uml.Property, props, connInfo)
}

export const Association: Template<uml.IAssociation> = (props) => {
    const connInfo:ConnectionInfo = defaultConnectionInfo(undefined)
    return new ExprNode(uml.Association, props, connInfo)
}

