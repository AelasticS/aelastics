import * as t from "aelastics-types"

export const OrgSchema = t.schema("OrgSchema");

export const ID = t.number.derive('IDType').positive
export const Name = t.string.derive('NameType').alphanumeric.maxLength(128)
export const Age = t.number.derive('Human age').int8.positive.inRange(1, 120);

export const Employee = t.entity({
    id:ID,
    name: Name,
    age: t.optional(Age),
   sex: t.string, // t.unionOf([t.literal('male'), t.literal("female")],"sexType"),
    birthPlace:  t.object({name: t.string, state: t.string}),
    children: t.arrayOf(t.object({name: t.string}, "Child"))
}, ["id"], 'Employee', OrgSchema);

export const Organization = t.entity({
    id:ID,
    name: Name,
    manager: Employee,
    employees: t.arrayOf(Employee),
    departments: t.arrayOf(t.link(OrgSchema, "Organization")),
}, ["id"], 'Organization', OrgSchema);

export type IEmployee = t.TypeOf<typeof Employee>
export type IOrganization = t.TypeOf<typeof Organization>

