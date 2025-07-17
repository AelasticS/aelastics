import { Namespace } from "../../../registry/NamespaceMetadata";
import { ObjectTypeMeta, PropertyMeta, TypeMeta } from "../../../registry/TypeDefinitions";

// ERROR: This namespace has invalid entity definitions

const missingIdentityKeysType: ObjectTypeMeta = {
    qName: "/invalid/entities/MissingIdentityKeys",
    category: "complex",
    kind: "entity", // ERROR: Entity without identity keys
    properties: new Map<string, PropertyMeta>([
        ["name", {
            name: "name",
            typeRef: "string",
            optional: false
        }],
        ["age", {
            name: "age",
            typeRef: "number",
            optional: false
        }]
    ])
    // ERROR: Missing identityKeys property
};

const invalidIdentityKeysType: ObjectTypeMeta = {
    qName: "/invalid/entities/InvalidIdentityKeys",
    category: "complex",
    kind: "entity",
    properties: new Map<string, PropertyMeta>([
        ["name", {
            name: "name",
            typeRef: "string",
            optional: false
        }],
        ["age", {
            name: "age",
            typeRef: "number",
            optional: false
        }]
    ]),
    identityKeys: ["id", "nonExistentProperty"] // ERROR: Identity keys reference non-existent properties
};

const invalidInheritanceType: ObjectTypeMeta = {
    qName: "/invalid/entities/InvalidInheritance",
    category: "complex",
    kind: "entity",
    extends: "string", // ERROR: Cannot extend from primitive type
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

const invalidInverseCollectionType: ObjectTypeMeta = {
    qName: "/invalid/entities/InvalidInverseCollection",
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
        }]
    ]),
    identityKeys: ["id"],
    inverseCollection: new Map([
        ["invalidInverse", {
            propName: "nonExistentProp", // ERROR: Property doesn't exist
            targetTypeQName: "/nonexistent/Type", // ERROR: Target type doesn't exist
            isCollection: true
        }]
    ])
};

export const invalidEntitiesNamespace: Namespace = {
    qName: "/invalid/entities",
    version: "1.0.0",
    types: new Map<string, TypeMeta>([
        ["MissingIdentityKeys", missingIdentityKeysType],
        ["InvalidIdentityKeys", invalidIdentityKeysType],
        ["InvalidInheritance", invalidInheritanceType],
        ["InvalidInverseCollection", invalidInverseCollectionType]
    ]),
    exports: ["MissingIdentityKeys", "InvalidIdentityKeys", "InvalidInheritance", "InvalidInverseCollection"],
    imports: new Map()
};