import { Namespace } from "../../../registry/NamespaceMetadata";
import { ObjectTypeMeta, PropertyMeta, SimpleTypeMeta, TypeMeta } from "../../../registry/TypeDefinitions";

// ERROR: This namespace tries to redefine system types and use reserved namespace name

const conflictingStringType: SimpleTypeMeta = {
    qName: "/invalid/system-conflicts/string", // ERROR: 'string' conflicts with system type
    kind: "string"
};

const conflictingNumberType: SimpleTypeMeta = {
    qName: "/invalid/system-conflicts/number", // ERROR: 'number' conflicts with system type
    kind: "number"
};

const conflictingBooleanType: SimpleTypeMeta = {
    qName: "/invalid/system-conflicts/boolean", // ERROR: 'boolean' conflicts with system type
    kind: "boolean"
};

const someValidType: ObjectTypeMeta = {
    qName: "/invalid/system-conflicts/ValidType",
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

export const systemConflictsNamespace: Namespace = {
    qName: "/invalid/system-conflicts",
    version: "1.0.0",
    types: new Map<string, TypeMeta>([
        ["string", conflictingStringType], // ERROR: Type name conflicts with system type
        ["number", conflictingNumberType], // ERROR: Type name conflicts with system type
        ["boolean", conflictingBooleanType], // ERROR: Type name conflicts with system type
        ["ValidType", someValidType]
    ]),
    exports: ["string", "number", "boolean", "ValidType"],
    imports: new Map()
};

// ERROR: This namespace tries to use reserved 'system' name
export const reservedSystemNamespace: Namespace = {
    qName: "system", // ERROR: 'system' is reserved for system namespace
    version: "1.0.0",
    types: new Map<string, TypeMeta>([
        ["CustomType", someValidType]
    ]),
    exports: ["CustomType"],
    imports: new Map()
};