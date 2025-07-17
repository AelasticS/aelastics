import { Namespace } from "../../registry/NamespaceMetadata";
import { ObjectTypeMeta, PropertyMeta, ArrayTypeMeta, SetTypeMeta, MapTypeMeta, TypeMeta } from "../../registry/TypeDefinitions";

// ===== COLLECTION TYPES =====

// Array type for employees
const employeeArrayType: ArrayTypeMeta = {
    qName: "/company/EmployeeArray",
    category: "complex",
    kind: "array",
    elementType: "/company/Employee"
};

// Array type for projects
const projectArrayType: ArrayTypeMeta = {
    qName: "/company/ProjectArray",
    category: "complex",
    kind: "array",
    elementType: "/company/Project"
};

// Set type for skills
const skillSetType: SetTypeMeta = {
    qName: "/company/SkillSet",
    category: "complex",
    kind: "set",
    elementType: "string"
};

// ===== BASIC OBJECT TYPES =====

// Address value object (no bidirectional relationships)
const addressType: ObjectTypeMeta = {
    qName: "/company/Address",
    category: "complex",
    kind: "object",
    properties: new Map<string, PropertyMeta>([
        ["street", {
            name: "street",
            typeRef: "string",
            optional: false
        }],
        ["city", {
            name: "city", 
            typeRef: "string",
            optional: false
        }],
        ["zipCode", {
            name: "zipCode",
            typeRef: "string",
            optional: false
        }],
        ["country", {
            name: "country",
            typeRef: "string",
            optional: true
        }]
    ])
};

// Badge entity - ONE-TO-ONE with Employee
const badgeType: ObjectTypeMeta = {
    qName: "/company/Badge",
    category: "complex",
    kind: "entity",
    properties: new Map<string, PropertyMeta>([
        ["id", {
            name: "id",
            typeRef: "string",
            optional: false
        }],
        ["badgeNumber", {
            name: "badgeNumber",
            typeRef: "string",
            optional: false
        }],
        ["isActive", {
            name: "isActive",
            typeRef: "boolean",
            optional: false
        }],
        ["employee", {
            name: "employee",
            typeRef: "/company/Employee",
            optional: false,
            // One-to-one: Badge belongs to one employee
            inverseProp: "badge",
            inverseTypeRef: "/company/Employee",
            inverseType: "object" // Employee.badge is a single reference
        }]
    ]),
    identityKeys: ["id"]
};

// Employee entity with bidirectional relationships
const employeeType: ObjectTypeMeta = {
    qName: "/company/Employee",
    category: "complex",
    kind: "entity",
    properties: new Map<string, PropertyMeta>([
        ["id", {
            name: "id",
            typeRef: "string",
            optional: false
        }],
        ["firstName", {
            name: "firstName",
            typeRef: "string",
            optional: false
        }],
        ["lastName", {
            name: "lastName",
            typeRef: "string",
            optional: false
        }],
        ["email", {
            name: "email",
            typeRef: "string",
            optional: false
        }],
        ["dateOfBirth", {
            name: "dateOfBirth",
            typeRef: "date",
            optional: true
        }],
        ["salary", {
            name: "salary",
            typeRef: "number",
            optional: true
        }],
        ["isActive", {
            name: "isActive",
            typeRef: "boolean",
            optional: false
        }],
        ["homeAddress", {
            name: "homeAddress",
            typeRef: "/company/Address",
            optional: true
        }],
        ["skills", {
            name: "skills",
            typeRef: "/company/SkillSet",
            optional: true
        }],
        ["badge", {
            name: "badge",
            typeRef: "/company/Badge",
            optional: true,
            // One-to-one: Employee has one badge
            inverseProp: "employee",
            inverseTypeRef: "/company/Employee",
            inverseType: "object" // Badge.employee is a single reference
        }],
        ["company", {
            name: "company",
            typeRef: "/company/Company",
            optional: false,
            // Many-to-one: Employee belongs to one company
            inverseProp: "employees",
            inverseTypeRef: "/company/Company",
            inverseType: "array" // Company.employees is a collection
        }],
        ["projects", {
            name: "projects",
            typeRef: "/company/ProjectArray",
            optional: true,
            // Many-to-many: Employee works on many projects
            inverseProp: "assignedEmployees",
            inverseTypeRef: "/company/Project",
            inverseType: "array" // Project.assignedEmployees is a collection
        }]
    ]),
    identityKeys: ["id"],
    roles: ["/core/Auditable", "/core/Timestampable"]
};

// Company entity - ONE-TO-MANY with Employees
const companyType: ObjectTypeMeta = {
    qName: "/company/Company",
    category: "complex",
    kind: "entity",
    properties: new Map<string, PropertyMeta>([
        ["id", {
            name: "id",
            typeRef: "string",
            optional: false
        }],
        ["name", {
            name: "name",
            typeRef: "string",
            optional: false
        }],
        ["foundedYear", {
            name: "foundedYear",
            typeRef: "number",
            optional: true
        }],
        ["headquartersAddress", {
            name: "headquartersAddress",
            typeRef: "/company/Address",
            optional: true
        }],
        ["employees", {
            name: "employees",
            typeRef: "/company/EmployeeArray",
            optional: true,
            // One-to-many: Company has many employees
            inverseProp: "company",
            inverseTypeRef: "/company/Employee",
            inverseType: "object" // Employee.company is a single reference
        }]
    ]),
    identityKeys: ["id"],
    roles: ["/core/Auditable", "/core/Versionable", "/core/Timestampable"]
};

// Project entity - MANY-TO-MANY with Employees
const projectType: ObjectTypeMeta = {
    qName: "/company/Project",
    category: "complex",
    kind: "entity",
    properties: new Map<string, PropertyMeta>([
        ["id", {
            name: "id",
            typeRef: "string",
            optional: false
        }],
        ["name", {
            name: "name",
            typeRef: "string",
            optional: false
        }],
        ["description", {
            name: "description",
            typeRef: "string",
            optional: true
        }],
        ["startDate", {
            name: "startDate",
            typeRef: "date",
            optional: true
        }],
        ["endDate", {
            name: "endDate",
            typeRef: "date",
            optional: true
        }],
        ["assignedEmployees", {
            name: "assignedEmployees",
            typeRef: "/company/EmployeeArray",
            optional: true,
            // Many-to-many: Project has many employees
            inverseProp: "projects",
            inverseTypeRef: "/company/Employee",
            inverseType: "array" // Employee.projects is a collection
        }]
    ]),
    identityKeys: ["id"],
    roles: ["/core/Auditable", "/core/Versionable"]
};

// Export the company namespace
export const companyNamespace: Namespace = {
    qName: "/company",
    version: "1.0.0",
    types: new Map<string, TypeMeta>([
        ["Address", addressType],
        ["Badge", badgeType],
        ["Employee", employeeType],
        ["Company", companyType],
        ["Project", projectType],
        ["EmployeeArray", employeeArrayType],
        ["ProjectArray", projectArrayType],
        ["SkillSet", skillSetType]
    ]),
    exports: ["Address", "Badge", "Employee", "Company", "Project", "EmployeeArray", "ProjectArray", "SkillSet"],
    imports: new Map() // System namespace is auto-imported
};