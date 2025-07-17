import { Namespace } from "../../../registry/NamespaceMetadata";
import { ObjectTypeMeta, PropertyMeta, TypeMeta } from "../../../registry/TypeDefinitions";

// ERROR: This namespace references types from other namespaces without importing them

const employeeType: ObjectTypeMeta = {
    qName: "/invalid/missing-imports/Employee",
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
        ["company", {
            name: "company",
            typeRef: "/company/Company", // ERROR: /company namespace not imported
            optional: false
        }],
        ["badge", {
            name: "badge",
            typeRef: "/company/Badge", // ERROR: /company namespace not imported
            optional: true
        }],
        ["homeAddress", {
            name: "homeAddress",
            typeRef: "/company/Address", // ERROR: /company namespace not imported
            optional: true
        }]
    ]),
    identityKeys: ["id"]
};

export const missingImportsNamespace: Namespace = {
    qName: "/invalid/missing-imports",
    version: "1.0.0",
    types: new Map<string, TypeMeta>([
        ["Employee", employeeType]
    ]),
    exports: ["Employee"],
    imports: new Map() // ERROR: Should import /company namespace
};