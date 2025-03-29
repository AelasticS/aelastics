import { verifySchemaConsistency } from "../../meta/SchemaRegistry"
import { SchemaRegistry, TypeSchema } from "../../meta/InternalSchema";

describe("Schema Existence Validation", () => {
    let schemaRegistry: SchemaRegistry = { schemas: new Map<string, TypeSchema>() } //  Local schema registry

    beforeEach(() => {
        // Reset schema registry before each test
        schemaRegistry.schemas.clear();


        // Define two schemas that import each other, creating a circular dependency
        schemaRegistry.schemas.set("/schemaA", {
            qName: "/schemaA",
            version: "1.0",
            types: new Map(),
            roles: new Map(),
            export: [],
            import: new Map([
                ["/schemaB", []] // 🚨 Circular reference: schemaA imports schemaB
            ])
        });

        schemaRegistry.schemas.set("/schemaB", {
            qName: "/schemaB",
            version: "1.0",
            types: new Map(),
            roles: new Map(),
            export: [],
            import: new Map([
                ["/schemaA", []] // 🚨 Circular reference: schemaB imports schemaA
            ])
        });
    });

    test("T7: A schema imports another schema, which imports back the first (should fail)", () => {
        const errors = verifySchemaConsistency(schemaRegistry.schemas.get("/schemaA")!, schemaRegistry);
        expect(errors).toContain('Circular dependency detected in schema imports: "/schemaA".');
    });
});
