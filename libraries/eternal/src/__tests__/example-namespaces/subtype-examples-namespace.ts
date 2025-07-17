import { Namespace } from "../../registry/NamespaceMetadata";
import { ObjectTypeMeta, PropertyMeta, SubtypeTypeMeta, TypeMeta } from "../../registry/TypeDefinitions";

// ===== BASE TYPES FOR SUBTYPES =====

// Base User type
const baseUserType: ObjectTypeMeta = {
    qName: "/subtypes/BaseUser",
    category: "complex",
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
        }]
    ]),
    identityKeys: ["id"]
};

// Base Product type
const baseProductType: ObjectTypeMeta = {
    qName: "/subtypes/BaseProduct",
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
        ["price", {
            name: "price",
            typeRef: "number",
            optional: false
        }],
        ["isActive", {
            name: "isActive",
            typeRef: "boolean",
            optional: false
        }]
    ]),
    identityKeys: ["id"]
};

// ===== SUBTYPE EXAMPLES =====

// AdminUser as a SUBTYPE of BaseUser (not inheritance)
const adminUserSubtype: SubtypeTypeMeta = {
    qName: "/subtypes/AdminUser",
    category: "complex",
    kind: "subtype",
    baseType: "/subtypes/BaseUser", // Reference to base type
    extraProperties: new Map<string, PropertyMeta>([
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
        ["lastAdminAction", {
            name: "lastAdminAction",
            typeRef: "date",
            optional: true
        }]
    ])
};

// PremiumUser as a SUBTYPE of BaseUser
const premiumUserSubtype: SubtypeTypeMeta = {
    qName: "/subtypes/PremiumUser",
    category: "complex",
    kind: "subtype",
    baseType: "/subtypes/BaseUser",
    extraProperties: new Map<string, PropertyMeta>([
        ["subscriptionLevel", {
            name: "subscriptionLevel",
            typeRef: "string",
            optional: false
        }],
        ["subscriptionExpires", {
            name: "subscriptionExpires",
            typeRef: "date",
            optional: false
        }],
        ["maxProjects", {
            name: "maxProjects",
            typeRef: "number",
            optional: false
        }]
    ])
};

// DigitalProduct as a SUBTYPE of BaseProduct
const digitalProductSubtype: SubtypeTypeMeta = {
    qName: "/subtypes/DigitalProduct",
    category: "complex",
    kind: "subtype",
    baseType: "/subtypes/BaseProduct",
    extraProperties: new Map<string, PropertyMeta>([
        ["downloadUrl", {
            name: "downloadUrl",
            typeRef: "string",
            optional: false
        }],
        ["fileSize", {
            name: "fileSize",
            typeRef: "number",
            optional: false
        }],
        ["supportedFormats", {
            name: "supportedFormats",
            typeRef: "string",
            optional: true
        }]
    ])
};

// PhysicalProduct as a SUBTYPE of BaseProduct
const physicalProductSubtype: SubtypeTypeMeta = {
    qName: "/subtypes/PhysicalProduct",
    category: "complex",
    kind: "subtype",
    baseType: "/subtypes/BaseProduct",
    extraProperties: new Map<string, PropertyMeta>([
        ["weight", {
            name: "weight",
            typeRef: "number",
            optional: false
        }],
        ["dimensions", {
            name: "dimensions",
            typeRef: "string",
            optional: false
        }],
        ["shippingCost", {
            name: "shippingCost",
            typeRef: "number",
            optional: false
        }],
        ["inventoryCount", {
            name: "inventoryCount",
            typeRef: "number",
            optional: false
        }]
    ])
};

// ===== INHERITANCE EXAMPLE (for comparison) =====

// SuperAdminUser - INHERITS from BaseUser (proper inheritance)
const superAdminUserType: ObjectTypeMeta = {
    qName: "/subtypes/SuperAdminUser",
    category: "complex",
    kind: "entity",
    extends: "/subtypes/BaseUser", // This is inheritance, not subtype
    properties: new Map<string, PropertyMeta>([
        ["systemAccess", {
            name: "systemAccess",
            typeRef: "boolean",
            optional: false
        }],
        ["securityClearance", {
            name: "securityClearance",
            typeRef: "string",
            optional: false
        }]
    ]),
    identityKeys: ["id"]
};

export const subtypeExamplesNamespace: Namespace = {
    qName: "/subtypes",
    version: "1.0.0",
    types: new Map<string, TypeMeta>([
        // Base types
        ["BaseUser", baseUserType],
        ["BaseProduct", baseProductType],
        
        // Subtypes (using SubtypeTypeMeta)
        ["AdminUser", adminUserSubtype],
        ["PremiumUser", premiumUserSubtype],
        ["DigitalProduct", digitalProductSubtype],
        ["PhysicalProduct", physicalProductSubtype],
        
        // Inheritance example (using ObjectTypeMeta with extends)
        ["SuperAdminUser", superAdminUserType]
    ]),
    exports: [
        "BaseUser", "BaseProduct", 
        "AdminUser", "PremiumUser", 
        "DigitalProduct", "PhysicalProduct",
        "SuperAdminUser"
    ],
    imports: new Map()
};