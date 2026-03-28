import * as org from './org-model.meta'
import { CpxTemplate, Element, Template, WithRefProps } from 'aelastics-synthesis'
import { ModelStore } from 'aelastics-synthesis'

export type IModelProps = WithRefProps<org.IOrganization> & { store?: ModelStore }

export const Organization: CpxTemplate<IModelProps, org.IOrganization> = (props) => {
    return new Element(org.Organization, props, undefined)
}

export const Board: Template<org.IBoard> = (props) => {
    return new Element(org.Board, props, 'topUnit')
}

export const Department: Template<org.IDepartment> = (props) => {
    return new Element(org.Department, props, 'subUnits')
}

export const Worker: Template<org.IWorker> = (props) => {
    return new Element(org.Worker, props, 'members')
}

export const Manager: Template<org.IWorker> = (props) => {
    return new Element(org.Worker, props, 'manager')
}
