import { computeResolvedTypes, verifySchemaConsistency } from "../../SchemaRegistry"
import { SchemaRegistry, TypeSchema } from "../../handlers/MetaDefinitions";

describe("Schema Existence Validation", () => {
    let schemaRegistry: SchemaRegistry = { schemas: new Map<string, TypeSchema>() } //  Local schema registry

    beforeEach(() => {
        // Reset schema registry before each test
        schemaRegistry.schemas.clear();

        // Add a valid schema
        schemaRegistry.schemas.set("/core", {
            qName: "/core",
            version: "1.0",
            types: new Map(),
            roles: new Map(),
            export: [],
            import: new Map()
        });

        // Add an invalid schema (missing required fields)
        schemaRegistry.schemas.set("/invalid-schema", {
            qName: "/invalid-schema",
            version: "1.0",
            // `types` is missing, making it invalid
        } as unknown as TypeSchema); // Force cast for testing purposes

    });




    test("T1: Validate an existing schema (should pass)", () => {
        computeResolvedTypes(schemaRegistry.schemas.get("/core")!, schemaRegistry);
        const errors = verifySchemaConsistency(schemaRegistry.schemas.get("/core")!, schemaRegistry);
        expect(errors).toEqual([]); // No errors expected
    });

    test("T3: Validate an invalid schema (should fail)", () => {
        const errors = verifySchemaConsistency(schemaRegistry.schemas.get("/invalid-schema")!, schemaRegistry);
        expect(errors).toContain('Schema "/invalid-schema" is malformed: Missing \'types\' definition.');
    });
});