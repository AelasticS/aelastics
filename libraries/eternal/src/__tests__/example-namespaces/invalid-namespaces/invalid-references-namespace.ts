import { Namespace } from "../../../registry/NamespaceMetadata";
import { ObjectTypeMeta, PropertyMeta, TypeMeta } from "../../../registry/TypeDefinitions";

// ERROR: This namespace has invalid property type references and missing optional flags

const invalidReferencesType: ObjectTypeMeta = {
    qName: "/invalid/references/InvalidReferences",
    kind: "entity",
    properties: new Map<string, PropertyMeta>([
        ["id", {
            name: "id",
            typeRef: "string",
            optional: false
        }],
        ["nonExistentType", {
            name: "nonExistentType",
            typeRef: "/nonexistent/Type", // ERROR: Referenced type doesn't exist
            optional: false
        }],
        ["anotherBadRef", {
            name: "anotherBadRef",
            typeRef: "UndefinedType", // ERROR: Referenced type doesn't exist
            optional: false
        }],
        ["missingOptionalFlag", {
            name: "missingOptionalFlag",
            typeRef: "string"
            // ERROR: Missing optional flag
        } as PropertyMeta]
    ]),
    identityKeys: ["id"]
};

const inheritanceErrorType: ObjectTypeMeta = {
    qName: "/invalid/references/InheritanceError",
    kind: "entity",
    extends: "/nonexistent/BaseType", // ERROR: Base type doesn't exist
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
        }]
    ]),
    identityKeys: ["id"]
};

const invalidBidirectionalType: ObjectTypeMeta = {
    qName: "/invalid/references/InvalidBidirectional",
    kind: "entity",
    properties: new Map<string, PropertyMeta>([
        ["id", {
            name: "id",
            typeRef: "string",
            optional: false
        }],
        ["badInverse", {
            name: "badInverse",
            typeRef: "/invalid/references/InvalidReferences",
            optional: false,
            inverseProp: "nonExistentProperty", // ERROR: Inverse property doesn't exist
            inverseTypeRef: "/invalid/references/InvalidReferences",
        }],
        ["anotherBadInverse", {
            name: "anotherBadInverse",
            typeRef: "/nonexistent/Type", // ERROR: Referenced type doesn't exist
            optional: false,
            inverseProp: "someProperty",
            inverseTypeRef: "/nonexistent/Type", // ERROR: Referenced type doesn't exist
        }]
    ]),
    identityKeys: ["id"]
};

export const invalidReferencesNamespace: Namespace = {
    qName: "/invalid/references",
    version: "1.0.0",
    types: new Map<string, TypeMeta>([
        ["InvalidReferences", invalidReferencesType],
        ["InheritanceError", inheritanceErrorType],
        ["InvalidBidirectional", invalidBidirectionalType]
    ]),
    exports: ["InvalidReferences", "InheritanceError", "InvalidBidirectional"],
    imports: new Map()
};