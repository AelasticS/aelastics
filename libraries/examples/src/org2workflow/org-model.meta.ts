import * as t from "aelastics-types"
import { ModelElement, Model } from "generic-metamodel"

export const Org_Schema = t.schema("OrgModel-Schema")

export const Worker = t.subtype(ModelElement, {
    role: t.optional(t.string),
    worksIn: t.optional(t.link(Org_Schema, "OrgUnit")),
}, "Worker", Org_Schema)

export const OrgUnit = t.subtype(ModelElement, {
    parent: t.optional(t.link(Org_Schema, "OrgUnit")),
    subUnits: t.arrayOf(t.link(Org_Schema, "OrgUnit")),
    members: t.arrayOf(Worker),
}, "OrgUnit", Org_Schema)

export const Department = t.subtype(OrgUnit, {
    manager: t.link(Org_Schema, "Worker"),
}, "Department", Org_Schema)

export const Board = t.subtype(OrgUnit, {
}, "Board", Org_Schema)

export const Organization = t.subtype(Model, {
    topUnit: OrgUnit,
}, "Organization", Org_Schema)

t.inverseProps(OrgUnit, 'parent', OrgUnit, 'subUnits')
t.inverseProps(OrgUnit, 'members', Worker, 'worksIn')

export type IWorker = t.TypeOf<typeof Worker>
export type IOrgUnit = t.TypeOf<typeof OrgUnit>
export type IDepartment = t.TypeOf<typeof Department>
export type IBoard = t.TypeOf<typeof Board>
export type IOrganization = t.TypeOf<typeof Organization>
