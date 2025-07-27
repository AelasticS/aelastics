import { Namespace } from "../../registry/NamespaceMetadata";
import { ObjectTypeMeta, PropertyMeta, ArrayTypeMeta, SetTypeMeta, TypeMeta } from "../../registry/TypeDefinitions";

// ===== COLLECTION TYPES =====

// Array type for permissions
const permissionArrayType: ArrayTypeMeta = {
    qName: "/auth/PermissionArray",
    kind: "array",
    elementType: "/auth/Permission"
};

// Set type for roles
const roleSetType: SetTypeMeta = {
    qName: "/auth/RoleSet",
    kind: "set",
    elementType: "string"
};

// Array type for users
const userArrayType: ArrayTypeMeta = {
    qName: "/auth/UserArray",
    kind: "array",
    elementType: "/auth/User"
};

// ===== BASE TYPES FOR INHERITANCE =====

// Base User type
const userType: ObjectTypeMeta = {
    qName: "/auth/User",
    kind: "entity",
    properties: new Map<string, PropertyMeta>([
        ["id", {
            name: "id",
            typeRef: "string",
            optional: false
        }],
        ["username", {
            name: "username",
            typeRef: "string",
            optional: false
        }],
        ["email", {
            name: "email",
            typeRef: "string",
            optional: false
        }],
        ["isActive", {
            name: "isActive",
            typeRef: "boolean",
            optional: false
        }],
        ["createdAt", {
            name: "createdAt",
            typeRef: "date",
            optional: false
        }],
        ["lastLoginAt", {
            name: "lastLoginAt",
            typeRef: "date",
            optional: true
        }],
        ["roles", {
            name: "roles",
            typeRef: "/auth/RoleSet",
            optional: true
        }]
    ]),
    identityKeys: ["id"],
    roles: ["/core/Auditable", "/core/Timestampable"]
};

// Admin User - PROPER INHERITANCE from User
const adminUserType: ObjectTypeMeta = {
    qName: "/auth/AdminUser",
    kind: "entity",
    extends: "/auth/User", // Proper inheritance from User
    properties: new Map<string, PropertyMeta>([
        ["adminLevel", {
            name: "adminLevel",
            typeRef: "number",
            optional: false
        }],
        ["canManageUsers", {
            name: "canManageUsers",
            typeRef: "boolean",
            optional: false
        }],
        ["permissions", {
            name: "permissions",
            typeRef: "/auth/PermissionArray",
            optional: true,
            // One-to-many: AdminUser has many permissions
            inverseProp: "grantedToAdmin",
            inverseTypeRef: "/auth/Permission",
        }]
    ]),
    identityKeys: ["id"],
    roles: ["/core/Auditable", "/core/Timestampable", "/core/Versionable"]
};

// Guest User - PROPER INHERITANCE from User
const guestUserType: ObjectTypeMeta = {
    qName: "/auth/GuestUser",
    kind: "entity",
    extends: "/auth/User", // Proper inheritance from User
    properties: new Map<string, PropertyMeta>([
        ["sessionId", {
            name: "sessionId",
            typeRef: "string",
            optional: false
        }],
        ["expiresAt", {
            name: "expiresAt",
            typeRef: "date",
            optional: false
        }],
        ["ipAddress", {
            name: "ipAddress",
            typeRef: "string",
            optional: true
        }]
    ]),
    identityKeys: ["id"],
    roles: ["/core/Timestampable"]
};

// Permission entity
const permissionType: ObjectTypeMeta = {
    qName: "/auth/Permission",
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
        ["resource", {
            name: "resource",
            typeRef: "string",
            optional: false
        }],
        ["action", {
            name: "action",
            typeRef: "string",
            optional: false
        }],
        ["grantedToAdmin", {
            name: "grantedToAdmin",
            typeRef: "/auth/AdminUser",
            optional: true,
            // Many-to-one: Permission belongs to one admin
            inverseProp: "permissions",
            inverseTypeRef: "/auth/AdminUser",
        }]
    ]),
    identityKeys: ["id"],
    roles: ["/core/Auditable"]
};

// Session entity with reference to imported Address type
const sessionType: ObjectTypeMeta = {
    qName: "/auth/Session",
    kind: "entity",
    properties: new Map<string, PropertyMeta>([
        ["id", {
            name: "id",
            typeRef: "string",
            optional: false
        }],
        ["token", {
            name: "token",
            typeRef: "string",
            optional: false
        }],
        ["user", {
            name: "user",
            typeRef: "/auth/User",
            optional: false,
            // One-to-one: Session belongs to one user
            inverseProp: "currentSession",
            inverseTypeRef: "/auth/User",
        }],
        ["createdAt", {
            name: "createdAt",
            typeRef: "date",
            optional: false
        }],
        ["expiresAt", {
            name: "expiresAt",
            typeRef: "date",
            optional: false
        }],
        ["ipAddress", {
            name: "ipAddress",
            typeRef: "string",
            optional: true
        }],
        ["userAgent", {
            name: "userAgent",
            typeRef: "string",
            optional: true
        }],
        // Using imported type from company namespace
        ["loginLocation", {
            name: "loginLocation",
            typeRef: "CompanyAddress", // This will be resolved from imports
            optional: true
        }]
    ]),
    identityKeys: ["id"],
    roles: ["/core/Timestampable"]
};

// Update User type to include bidirectional session relationship
userType.properties.set("currentSession", {
    name: "currentSession",
    typeRef: "/auth/Session",
    optional: true,
    // One-to-one: User has one current session
    inverseProp: "user",
    inverseTypeRef: "/auth/Session",
});

// Export the auth namespace with imports
export const authNamespace: Namespace = {
    qName: "/auth",
    version: "1.0.0",
    types: new Map<string, TypeMeta>([
        ["User", userType],
        ["AdminUser", adminUserType],
        ["GuestUser", guestUserType],
        ["Permission", permissionType],
        ["Session", sessionType],
        ["PermissionArray", permissionArrayType],
        ["RoleSet", roleSetType],
        ["UserArray", userArrayType]
    ]),
    exports: ["User", "AdminUser", "GuestUser", "Permission", "Session", "PermissionArray", "RoleSet", "UserArray"],
    imports: new Map([
        // Import with alias from company namespace
        ["/company", [{ original: "Address", alias: "CompanyAddress" }]]
    ])
};