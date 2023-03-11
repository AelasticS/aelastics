import * as jm from "./jsx-maker"
import * as t from "aelastics-types"
import { object } from "aelastics-types";

export const OrgSchema = t.schema("OrgSchema");

export const ID = t.number.derive('IDType').positive
export const Name = t.string.derive('NameType').alphanumeric.maxLength(128)
export const Age = t.number.derive('HumanAge').int8.positive.inRange(1, 120);

export const ChildType = t.object({name: t.string}, "Child", OrgSchema)
export const Employee = t.entity({
    id:ID,
    name: Name,
  //  age: t.optional(Age),
  //  sex: t.string, // t.unionOf([t.literal('male'), t.literal("female")],"sexType"),
    birthPlace:  t.object({name: t.string, state: t.string}, "Place", OrgSchema),
    children: t.arrayOf(ChildType)
}, ["id"], 'Employee', OrgSchema);


export const Organization = t.entity({
    id:ID,
    name: Name,
  //  child: ChildType,
    manager: Employee,
    employees: t.arrayOf(Employee, "Employees", OrgSchema),
 //   departments: t.arrayOf(t.link(OrgSchema, "Organization")),
}, ["id"], 'Organization', OrgSchema);

export type IEmployee = t.TypeOf<typeof Employee>
export type IOrganization = t.TypeOf<typeof Organization>

let w1: IEmployee = {
    id: 1, name: "John", 
    birthPlace: { name: "London", state: "UK" },
    children: [{ name: "Paul" }, { name: "Anna" }]
}

let w2: IEmployee = {
    id: 1, name: "Peter", // age: 25, sex: "male",
    birthPlace: { name: "London", state: "UK" },
    children: []
}

let w3: IEmployee = {
    id: 1, name: "Suzanne", // age: 52, sex: "female",
    birthPlace: { name: "London", state: "UK" },
    children: []
}
export const dep1: IOrganization = {
    id: 1, name: "Department 1",
  //  child:{name:"John"},
   // departments: [],
    manager: w1,
    employees: [w1,w2, w3],
}

describe ("Test jsx-maker", ()=> {
    test("using builder without annotation", ()=>{
        let cpx = jm.make(Organization, dep1)
        expect(cpx).toEqual(
            {
                name: "Organization",
                properties: [
                  {
                    name: "id",
                    reference: {
                      name: 1,
                      value: 1,
                    },
                  },
                  {
                    name: "name",
                    reference: {
                      name: "Department 1",
                      value: "Department 1",
                    },
                  },
                ],
                subElements: [
                  {
                    name: "Employee",
                    properties: [
                      {
                        name: "id",
                        reference: {
                          name: 1,
                          value: 1,
                        },
                      },
                      {
                        name: "name",
                        reference: {
                          name: "John",
                          value: "John",
                        },
                      },
                    ],
                    subElements: [
                      {
                        name: "Place",
                        properties: [
                          {
                            name: "name",
                            reference: {
                              name: "London",
                              value: "London",
                            },
                          },
                          {
                            name: "state",
                            reference: {
                              name: "UK",
                              value: "UK",
                            },
                          },
                        ],
                        subElements: [
                        ],
                        references: [
                        ],
                      },
                      {
                        name: "Child",
                        properties: [
                          {
                            name: "name",
                            reference: {
                              name: "Paul",
                              value: "Paul",
                            },
                          },
                        ],
                        subElements: [
                        ],
                        references: [
                        ],
                      },
                      {
                        name: "Child",
                        properties: [
                          {
                            name: "name",
                            reference: {
                              name: "Anna",
                              value: "Anna",
                            },
                          },
                        ],
                        subElements: [
                        ],
                        references: [
                        ],
                      },
                    ],
                    references: [
                    ],
                  },
                  {
                    name: "Employee",
                    properties: [
                      {
                        name: "id",
                        reference: {
                          name: 1,
                          value: 1,
                        },
                      },
                      {
                        name: "name",
                        reference: {
                          name: "Peter",
                          value: "Peter",
                        },
                      },
                    ],
                    subElements: [
                      {
                        name: "Place",
                        properties: [
                          {
                            name: "name",
                            reference: {
                              name: "London",
                              value: "London",
                            },
                          },
                          {
                            name: "state",
                            reference: {
                              name: "UK",
                              value: "UK",
                            },
                          },
                        ],
                        subElements: [
                        ],
                        references: [
                        ],
                      },
                    ],
                    references: [
                    ],
                  },
                  {
                    name: "Employee",
                    properties: [
                      {
                        name: "id",
                        reference: {
                          name: 1,
                          value: 1,
                        },
                      },
                      {
                        name: "name",
                        reference: {
                          name: "Suzanne",
                          value: "Suzanne",
                        },
                      },
                    ],
                    subElements: [
                      {
                        name: "Place",
                        properties: [
                          {
                            name: "name",
                            reference: {
                              name: "London",
                              value: "London",
                            },
                          },
                          {
                            name: "state",
                            reference: {
                              name: "UK",
                              value: "UK",
                            },
                          },
                        ],
                        subElements: [
                        ],
                        references: [
                        ],
                      },
                    ],
                    references: [
                    ],
                  },
                ],
                references: [
                  {
                    name: "Employee",
                    tagName: "Employee",
                    refByType: "refByName",
                    refValue: "John",
                  },
                ],
              }  
        )
    })
})