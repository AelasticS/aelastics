import { Namespace } from "../../../registry/NamespaceMetadata";
import { ObjectTypeMeta, PropertyMeta, TypeMeta } from "../../../registry/TypeDefinitions";

// ERROR: This namespace has invalid qName formats

const badQNameType1: ObjectTypeMeta = {
    qName: "InvalidQName", // ERROR: Missing leading slash
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

const badQNameType2: ObjectTypeMeta = {
    qName: "/invalid/qnames/", // ERROR: Trailing slash
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

const badQNameType3: ObjectTypeMeta = {
    qName: "/invalid//qnames/EmptySegment", // ERROR: Double slash (empty segment)
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

const badQNameType4: ObjectTypeMeta = {
    qName: "/invalid/qnames/Invalid@Name", // ERROR: Invalid characters
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

export const invalidQNamesNamespace: Namespace = {
    qName: "/invalid/qnames",
    version: "1.0.0",
    types: new Map<string, TypeMeta>([
        ["BadQName1", badQNameType1],
        ["BadQName2", badQNameType2],
        ["BadQName3", badQNameType3],
        ["BadQName4", badQNameType4]
    ]),
    exports: ["BadQName1", "BadQName2", "BadQName3", "BadQName4"],
    imports: new Map()
};