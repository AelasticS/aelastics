import { Namespace } from "../../../registry/NamespaceMetadata";
import { ObjectTypeMeta, PropertyMeta, SubtypeTypeMeta, TypeMeta } from "../../../registry/TypeDefinitions";

// ===== VALID BASE TYPE FOR TESTING =====

const validBaseType: ObjectTypeMeta = {
    qName: "/invalid/subtypes/ValidBase",
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
    identityKeys: ["id"]
};

// ===== INVALID SUBTYPE EXAMPLES =====

// ERROR: Subtype referencing non-existent base type
const nonExistentBaseSubtype: SubtypeTypeMeta = {
    qName: "/invalid/subtypes/NonExistentBase",
    category: "complex",
    kind: "subtype",
    baseType: "/nonexistent/BaseType", // ERROR: Base type doesn't exist
    extraProperties: new Map<string, PropertyMeta>([
        ["extraProp", {
            name: "extraProp",
            typeRef: "string",
            optional: false
        }]
    ])
};

// ERROR: Subtype referencing primitive type as base
const primitiveBaseSubtype: SubtypeTypeMeta = {
    qName: "/invalid/subtypes/PrimitiveBase",
    category: "complex",
    kind: "subtype",
    baseType: "string", // ERROR: Cannot use primitive as base type
    extraProperties: new Map<string, PropertyMeta>([
        ["extraProp", {
            name: "extraProp",
            typeRef: "string",
            optional: false
        }]
    ])
};

// ERROR: Subtype with invalid property references
const invalidPropertyRefsSubtype: SubtypeTypeMeta = {
    qName: "/invalid/subtypes/InvalidPropertyRefs",
    category: "complex",
    kind: "subtype",
    baseType: "/invalid/subtypes/ValidBase",
    extraProperties: new Map<string, PropertyMeta>([
        ["badTypeRef", {
            name: "badTypeRef",
            typeRef: "/nonexistent/Type", // ERROR: Referenced type doesn't exist
            optional: false
        }],
        ["missingOptional", {
            name: "missingOptional",
            typeRef: "string"
            // ERROR: Missing optional flag
        } as PropertyMeta]
    ])
};

// ERROR: Subtype with circular reference
const circularSubtype1: SubtypeTypeMeta = {
    qName: "/invalid/subtypes/CircularA",
    category: "complex",
    kind: "subtype",
    baseType: "/invalid/subtypes/CircularB", // ERROR: Will create circular dependency
    extraProperties: new Map<string, PropertyMeta>([
        ["propA", {
            name: "propA",
            typeRef: "string",
            optional: false
        }]
    ])
};

const circularSubtype2: SubtypeTypeMeta = {
    qName: "/invalid/subtypes/CircularB",
    category: "complex",
    kind: "subtype",
    baseType: "/invalid/subtypes/CircularA", // ERROR: Will create circular dependency
    extraProperties: new Map<string, PropertyMeta>([
        ["propB", {
            name: "propB",
            typeRef: "string",
            optional: false
        }]
    ])
};

// ERROR: Subtype with duplicate property names from base
const duplicatePropertySubtype: SubtypeTypeMeta = {
    qName: "/invalid/subtypes/DuplicateProperty",
    category: "complex",
    kind: "subtype",
    baseType: "/invalid/subtypes/ValidBase",
    extraProperties: new Map<string, PropertyMeta>([
        ["id", { // ERROR: Property 'id' already exists in base type
            name: "id",
            typeRef: "number", // Different type than base
            optional: false
        }],
        ["name", { // ERROR: Property 'name' already exists in base type
            name: "name",
            typeRef: "string",
            optional: true // Different optionality than base
        }]
    ])
};

// ERROR: Subtype with invalid qName
const invalidQNameSubtype: SubtypeTypeMeta = {
    qName: "InvalidQName", // ERROR: Missing leading slash
    category: "complex",
    kind: "subtype",
    baseType: "/invalid/subtypes/ValidBase",
    extraProperties: new Map<string, PropertyMeta>([
        ["extraProp", {
            name: "extraProp",
            typeRef: "string",
            optional: false
        }]
    ])
};

// ERROR: Subtype attempting to extend another subtype (deep nesting)
const nestedSubtype: SubtypeTypeMeta = {
    qName: "/invalid/subtypes/NestedSubtype",
    category: "complex",
    kind: "subtype",
    baseType: "/invalid/subtypes/NonExistentBase", // ERROR: Base is another subtype (if it existed)
    extraProperties: new Map<string, PropertyMeta>([
        ["deepProp", {
            name: "deepProp",
            typeRef: "string",
            optional: false
        }]
    ])
};

export const invalidSubtypesNamespace: Namespace = {
    qName: "/invalid/subtypes",
    version: "1.0.0",
    types: new Map<string, TypeMeta>([
        // Valid base for testing
        ["ValidBase", validBaseType],
        
        // Invalid subtypes
        ["NonExistentBase", nonExistentBaseSubtype],
        ["PrimitiveBase", primitiveBaseSubtype],
        ["InvalidPropertyRefs", invalidPropertyRefsSubtype],
        ["CircularA", circularSubtype1],
        ["CircularB", circularSubtype2],
        ["DuplicateProperty", duplicatePropertySubtype],
        ["InvalidQName", invalidQNameSubtype],
        ["NestedSubtype", nestedSubtype]
    ]),
    exports: [
        "ValidBase",
        "NonExistentBase", "PrimitiveBase", "InvalidPropertyRefs", 
        "CircularA", "CircularB", "DuplicateProperty", 
        "InvalidQName", "NestedSubtype"
    ],
    imports: new Map()
};