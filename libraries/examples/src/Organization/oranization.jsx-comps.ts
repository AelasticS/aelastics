import * as org from './organization.model.type'
import { Element, ValueTemplate, WithRefProps } from 'aelastics-synthesis'
import { ModelStore } from 'aelastics-synthesis'

export type IOrgModelProps = WithRefProps<org.IOrganization> & { store?: ModelStore }

// export const Organization: ValueTemplate<org.IOrganization> = (props) => {
//     return new Element(org.Organization, props, "departments")
// }

// export const Employee: ValueTemplate<org.IEmployee> = (props) => {
//     return new Element(org.Employee, props, 'employees')
// }

// export const Manager: ValueTemplate<org.IEmployee> = (props) => {
//     return new Element(org.Employee, props, 'manager')
// }

export const Child: ValueTemplate<org.IChild> = (props) => {
    return new Element(org.Child, props, 'children')
}






