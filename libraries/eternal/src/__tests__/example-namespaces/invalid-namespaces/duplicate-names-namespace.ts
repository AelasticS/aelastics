import { Namespace } from "../../../registry/NamespaceMetadata";
import { ObjectTypeMeta, PropertyMeta, TypeMeta } from "../../../registry/TypeDefinitions";

// ERROR: This namespace has duplicate type names (will cause import conflicts)

const duplicateType1: ObjectTypeMeta = {
    qName: "/invalid/duplicates/DuplicateType",
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
    identityKeys: ["id"]
};

const duplicateType2: ObjectTypeMeta = {
    qName: "/invalid/duplicates/DuplicateType", // ERROR: Same qName as duplicateType1
    kind: "entity",
    properties: new Map<string, PropertyMeta>([
        ["id", {
            name: "id",
            typeRef: "string",
            optional: false
        }],
        ["description", {
            name: "description",
            typeRef: "string",
            optional: false
        }]
    ]),
    identityKeys: ["id"]
};

export const duplicateNamesNamespace: Namespace = {
    qName: "/invalid/duplicates",
    version: "1.0.0",
    types: new Map<string, TypeMeta>([
        ["DuplicateType", duplicateType1],
        // ERROR: This would overwrite the previous entry in the Map
        ["DuplicateType", duplicateType2]
    ]),
    exports: ["DuplicateType"],
    imports: new Map()
};

// ERROR: This namespace will conflict with an existing namespace when imported
export const duplicateNamespaceQName: Namespace = {
    qName: "/company", // ERROR: This qName already exists
    version: "1.0.0",
    types: new Map<string, TypeMeta>([
        ["ConflictingType", duplicateType1]
    ]),
    exports: ["ConflictingType"],
    imports: new Map()
};