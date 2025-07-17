import { Namespace } from "../../../registry/NamespaceMetadata";
import { ObjectTypeMeta, PropertyMeta, TypeMeta } from "../../../registry/TypeDefinitions";

// ERROR: This namespace has invalid import declarations

const validType: ObjectTypeMeta = {
    qName: "/invalid/imports/ValidType",
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
        ["importedType", {
            name: "importedType",
            typeRef: "NonExportedType", // ERROR: This type is not exported by source namespace
            optional: false
        }]
    ]),
    identityKeys: ["id"]
};

export const invalidImportsNamespace: Namespace = {
    qName: "/invalid/imports",
    version: "1.0.0",
    types: new Map<string, TypeMeta>([
        ["ValidType", validType]
    ]),
    exports: ["ValidType"],
    imports: new Map([
        // ERROR: Importing from non-existent namespace
        ["/nonexistent/namespace", ["SomeType"]],
        
        // ERROR: Importing non-exported type from valid namespace
        ["/company", ["NonExportedType"]],
        
        // ERROR: Importing non-existent type from valid namespace
        ["/company", ["NonExistentType"]]
    ])
};

export const circularImportNamespaceA: Namespace = {
    qName: "/invalid/circular-a",
    version: "1.0.0",
    types: new Map<string, TypeMeta>([
        ["TypeA", {
            qName: "/invalid/circular-a/TypeA",
            category: "complex",
            kind: "entity",
            properties: new Map<string, PropertyMeta>([
                ["id", {
                    name: "id",
                    typeRef: "string",
                    optional: false
                }],
                ["typeB", {
                    name: "typeB",
                    typeRef: "TypeB", // References type from circular-b
                    optional: false
                }]
            ]),
            identityKeys: ["id"]
        } as ObjectTypeMeta]
    ]),
    exports: ["TypeA"],
    imports: new Map([
        ["/invalid/circular-b", ["TypeB"]] // ERROR: Will create circular dependency
    ])
};

export const circularImportNamespaceB: Namespace = {
    qName: "/invalid/circular-b",
    version: "1.0.0",
    types: new Map<string, TypeMeta>([
        ["TypeB", {
            qName: "/invalid/circular-b/TypeB",
            category: "complex",
            kind: "entity",
            properties: new Map<string, PropertyMeta>([
                ["id", {
                    name: "id",
                    typeRef: "string",
                    optional: false
                }],
                ["typeA", {
                    name: "typeA",
                    typeRef: "TypeA", // References type from circular-a
                    optional: false
                }]
            ]),
            identityKeys: ["id"]
        } as ObjectTypeMeta]
    ]),
    exports: ["TypeB"],
    imports: new Map([
        ["/invalid/circular-a", ["TypeA"]] // ERROR: Will create circular dependency
    ])
};