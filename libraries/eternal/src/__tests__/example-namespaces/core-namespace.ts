import { Namespace } from "../../registry/NamespaceMetadata";
import { ObjectTypeMeta, PropertyMeta, TypeMeta } from "../../registry/TypeDefinitions";

// ===== ROLE DEFINITION TYPES =====

// Auditable role structure
const auditableRoleType: ObjectTypeMeta = {
    qName: "/core/AuditableRole",
    category: "complex",
    kind: "object",
    properties: new Map<string, PropertyMeta>([
        ["createdBy", {
            name: "createdBy",
            typeRef: "string",
            optional: false
        }],
        ["createdAt", {
            name: "createdAt",
            typeRef: "date",
            optional: false
        }],
        ["updatedBy", {
            name: "updatedBy",
            typeRef: "string",
            optional: true
        }],
        ["updatedAt", {
            name: "updatedAt",
            typeRef: "date",
            optional: true
        }]
    ])
};

// Timestampable role structure
const timestampableRoleType: ObjectTypeMeta = {
    qName: "/core/TimestampableRole",
    category: "complex",
    kind: "object",
    properties: new Map<string, PropertyMeta>([
        ["createdAt", {
            name: "createdAt",
            typeRef: "date",
            optional: false
        }],
        ["updatedAt", {
            name: "updatedAt",
            typeRef: "date",
            optional: true
        }]
    ])
};

// Versionable role structure
const versionableRoleType: ObjectTypeMeta = {
    qName: "/core/VersionableRole",
    category: "complex",
    kind: "object",
    properties: new Map<string, PropertyMeta>([
        ["version", {
            name: "version",
            typeRef: "number",
            optional: false
        }],
        ["isLatestVersion", {
            name: "isLatestVersion",
            typeRef: "boolean",
            optional: false
        }],
        ["versionNote", {
            name: "versionNote",
            typeRef: "string",
            optional: true
        }]
    ])
};

// Soft deletable role structure
const softDeletableRoleType: ObjectTypeMeta = {
    qName: "/core/SoftDeletableRole",
    category: "complex",
    kind: "object",
    properties: new Map<string, PropertyMeta>([
        ["isDeleted", {
            name: "isDeleted",
            typeRef: "boolean",
            optional: false
        }],
        ["deletedAt", {
            name: "deletedAt",
            typeRef: "date",
            optional: true
        }],
        ["deletedBy", {
            name: "deletedBy",
            typeRef: "string",
            optional: true
        }]
    ])
};

// Export the core namespace with role definitions
export const coreNamespace: Namespace = {
    qName: "/core",
    version: "1.0.0",
    types: new Map<string, TypeMeta>([
        ["AuditableRole", auditableRoleType],
        ["TimestampableRole", timestampableRoleType],
        ["VersionableRole", versionableRoleType],
        ["SoftDeletableRole", softDeletableRoleType]
    ]),
    exports: ["AuditableRole", "TimestampableRole", "VersionableRole", "SoftDeletableRole"],
    imports: new Map() // System namespace is auto-imported
};