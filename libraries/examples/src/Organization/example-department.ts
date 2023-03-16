import { IEmployee, IOrganization } from "./organization.model.type"

let w0: IEmployee = { id: 0, name: "Zoran", age: 45, sex: "male", 
children: [{ name: "Bata" }], birthPlace:{name:"NK",state:"Serbia"} }

let w1: IEmployee = {
    id: 1, name: "John", age: 45, sex: "male",
    birthPlace: { name: "London", state: "UK" },
    children: [{ name: "Paul" }, { name: "Anna" }]
}

let w2: IEmployee = {
    id: 1, name: "Peter", age: 25, sex: "male",
    birthPlace: { name: "London", state: "UK" },
    children: []
}

let w3: IEmployee = {
    id: 1, name: "Suzanne", age: 52, sex: "female",
    birthPlace: { name: "London", state: "UK" },
    children: []
}

let w4: IEmployee = {
    id: 1, name: "George", age: 33, sex: "male",
    birthPlace: { name: "London", state: "UK" },
    children: []
}

export const dep1: IOrganization = {
    id: 1, name: "Department 1",
    departments: [],
    manager: w1,
    employees: [w2, w3]
}


export const myComp: IOrganization = {
    id: 1, name: "MyCompany",
    departments: [dep1],
    manager: w4,
    employees: []
}


