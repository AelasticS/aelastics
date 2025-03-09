import { resolve } from "path";
import { computeResolvedTypes, verifySchemaConsistency } from "../../SchemaRegistry"
import { PropertyMeta, SchemaRegistry, TypeSchema } from "../../handlers/MetaDefinitions";

describe("Schema Existence Validation", () => {
    let schemaRegistry: SchemaRegistry = { schemas: new Map<string, TypeSchema>() } //  Local schema registry

    beforeEach(() => {
        // Reset schema registry before each test
        schemaRegistry.schemas.clear();

        // Define a valid schema with proper references
        schemaRegistry.schemas.set("/valid-schema", {
            qName: "/valid-schema",
            version: "1.0",
            types: new Map([
                ["/valid-schema/Document", {
                    qName: "/valid-schema/Document",
                    properties: new Map<string, PropertyMeta>([
                        ["/valid-schema/Document/title", {
                            qName: "/valid-schema/Document/title",
                            type: "string"
                        }]
                    ])
                }],
                ["/valid-schema/User", {
                    qName: "/valid-schema/User",
                    properties: new Map<string, PropertyMeta>([
                        ["/valid-schema/User/documents", {
                            qName: "/valid-schema/User/documents",
                            type: "array",
                            itemType: "object",
                            domainType: "/valid-schema/Document",
                            inverseProp: "/valid-schema/Document/author"
                        }]
                    ])
                }]
            ]),
            roles: new Map(),
            export: ["/valid-schema/Document", "/valid-schema/User"],
            import: new Map()
        });
    });

    test("T8: Validate properties referencing correct types (should pass)", () => {
        computeResolvedTypes(schemaRegistry.schemas.get("/valid-schema")!, schemaRegistry);
        const errors = verifySchemaConsistency(schemaRegistry.schemas.get("/valid-schema")!, schemaRegistry);
        expect(errors).toEqual([]); // No errors expected
    });

    test("T9: Property references a missing type (should fail)", () => {
        schemaRegistry.schemas.set("/invalid-schema", {
            qName: "/invalid-schema",
            version: "1.0",
            types: new Map([
                ["/invalid-schema/InvalidType", {
                    qName: "/invalid-schema/InvalidType",
                    properties: new Map<string, PropertyMeta>([
                        ["/invalid-schema/InvalidType/invalidRef", {
                            qName: "/invalid-schema/InvalidType/invalidRef",
                            type: "object",
                            domainType: "/non-existent/Type" // 🚨 This type does not exist
                        }]
                    ])
                }]
            ]),
            roles: new Map(),
            export: [],
            import: new Map()
        });

        const errors = verifySchemaConsistency(schemaRegistry.schemas.get("/invalid-schema")!, schemaRegistry);
    });

    test("T10: Property references a missing domainType (should fail)", () => {
        schemaRegistry.schemas.set("/invalid-schema-inverse", {
            qName: "/invalid-schema-inverse",
            version: "1.0",
            types: new Map([
                ["/invalid-schema-inverse/InvalidType", {
                    qName: "/invalid-schema-inverse/InvalidType",
                    properties: new Map<string, PropertyMeta>([
                        ["/invalid-schema-inverse/InvalidType/ref", {
                            qName: "/invalid-schema-inverse/InvalidType/ref",
                            type: "object",
                            domainType: "/valid-schema/NonExistentType", // 🚨 This inverse type does not exist
                            inverseProp: "/valid-schema/NonExistentType/refBack"
                        }]
                    ])
                }]
            ]),
            roles: new Map(),
            export: [],
            import: new Map()
        });

        const errors = verifySchemaConsistency(schemaRegistry.schemas.get("/invalid-schema-inverse")!, schemaRegistry);
        expect(errors).toContain(
            'Property "/invalid-schema-inverse/InvalidType/ref" refers to unknown type "/valid-schema/NonExistentType".'
        );
    });

    test("T11: Property references an domainType, but inverseProp does not match (should fail)", () => {
        schemaRegistry.schemas.set("/invalid-schema-mismatch", {
            qName: "/invalid-schema-mismatch",
            version: "1.0",
            types: new Map([
                ["/invalid-schema-mismatch/TypeA", {
                    qName: "/invalid-schema-mismatch/TypeA",
                    properties: new Map<string, PropertyMeta>([
                        ["/invalid-schema-mismatch/TypeA/ref", {
                            qName: "/invalid-schema-mismatch/TypeA/ref",
                            type: "object",
                            domainType: "/invalid-schema-mismatch/TypeB",
                            inverseProp: "/invalid-schema-mismatch/TypeB/missingRef" // 🚨 Inverse property does not exist
                        }]
                    ])
                }],
                ["/invalid-schema-mismatch/TypeB", {
                    qName: "/invalid-schema-mismatch/TypeB",
                    properties: new Map<string, PropertyMeta>([
                        ["/invalid-schema-mismatch/TypeB/actualRef", {
                            qName: "/invalid-schema-mismatch/TypeB/actualRef",
                            type: "object",
                            domainType: "/invalid-schema-mismatch/TypeA",
                            inverseProp: "/invalid-schema-mismatch/TypeA/ref"
                        }]
                    ])
                }]
            ]),
            roles: new Map(),
            export: [],
            import: new Map()
        });
        computeResolvedTypes(schemaRegistry.schemas.get("/invalid-schema-mismatch")!, schemaRegistry);
        const errors = verifySchemaConsistency(schemaRegistry.schemas.get("/invalid-schema-mismatch")!, schemaRegistry);
        expect(errors.some(error => error.includes(
            'Property "/invalid-schema-mismatch/TypeA/ref" declares inverseProp "/invalid-schema-mismatch/TypeB/missingRef", but it does not exist in "/invalid-schema-mismatch/TypeB".'))).toBe(true);

    });
});
