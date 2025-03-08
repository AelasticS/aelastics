import { verifySchemaConsistency } from "../../SchemaRegistry"
import { PropertyMeta, SchemaRegistry, ObjectTypeMeta, TypeSchema } from "../../handlers/MetaDefinitions";

describe("Schema Existence Validation", () => {
    let schemaRegistry: SchemaRegistry = { schemas: new Map<string, TypeSchema>() } //  Local schema registry

    beforeEach(() => {
        // Reset schema registry before each test
        schemaRegistry.schemas.clear();

        // Define a valid schema with correct inheritance
        schemaRegistry.schemas.set("/valid-schema", {
            qName: "/valid-schema",
            version: "1.0",
            types: new Map<string, ObjectTypeMeta>([
                ["/valid-schema/Base", { qName: "/valid-schema/Base", properties: new Map() }],
                ["/valid-schema/Derived", { 
                    qName: "/valid-schema/Derived", 
                    properties: new Map(),
                    extends: "/valid-schema/Base" // ✅ Correct inheritance
                }]
            ]),
            roles: new Map(),
            export: ["/valid-schema/Base", "/valid-schema/Derived"],
            import: new Map()
        });
    });

    test("T14: Validate a correct inheritance chain (should pass)", () => {
        const errors = verifySchemaConsistency(schemaRegistry.schemas.get("/valid-schema")!, schemaRegistry);
        expect(errors).toEqual([]); // No errors expected
    });

    test("T15: Type extends a non-existent parent (should fail)", () => {
        schemaRegistry.schemas.set("/invalid-schema-missing-parent", {
            qName: "/invalid-schema-missing-parent",
            version: "1.0",
            types: new Map<string, ObjectTypeMeta>([
                ["/invalid-schema-missing-parent/Orphan", { 
                    qName: "/invalid-schema-missing-parent/Orphan", 
                    properties: new Map(),
                    extends: "/non-existent/Parent" // 🚨 Parent does not exist
                }]
            ]),
            roles: new Map(),
            export: [],
            import: new Map()
        });

        const errors = verifySchemaConsistency(schemaRegistry.schemas.get("/invalid-schema-missing-parent")!, schemaRegistry);
        expect(errors).toContain(
            'Type "/invalid-schema-missing-parent/Orphan" extends "/non-existent/Parent", but "/non-existent/Parent" does not exist.'
        );
    });

    test("T16: Type extends itself (direct cycle, should fail)", () => {
        schemaRegistry.schemas.set("/invalid-schema-self-extends", {
            qName: "/invalid-schema-self-extends",
            version: "1.0",
            types: new Map<string, ObjectTypeMeta>([
                ["/invalid-schema-self-extends/Self", { 
                    qName: "/invalid-schema-self-extends/Self", 
                    properties: new Map(),
                    extends: "/invalid-schema-self-extends/Self" // 🚨 Direct self-extension
                }]
            ]),
            roles: new Map(),
            export: [],
            import: new Map()
        });

        const errors = verifySchemaConsistency(schemaRegistry.schemas.get("/invalid-schema-self-extends")!, schemaRegistry);
        expect(errors).toContain(
            'Circular inheritance detected in type hierarchy: "/invalid-schema-self-extends/Self → /invalid-schema-self-extends/Self".'
        );
    });

    test("T17: Types form an indirect circular inheritance (should fail)", () => {
        schemaRegistry.schemas.set("/invalid-schema-circular", {
            qName: "/invalid-schema-circular",
            version: "1.0",
            types: new Map<string, ObjectTypeMeta>([
                ["/invalid-schema-circular/A", { 
                    qName: "/invalid-schema-circular/A", 
                    properties: new Map(),
                    extends: "/invalid-schema-circular/B" // 🚨 A → B
                }],
                ["/invalid-schema-circular/B", { 
                    qName: "/invalid-schema-circular/B", 
                    properties: new Map(),
                    extends: "/invalid-schema-circular/C" // 🚨 B → C
                }],
                ["/invalid-schema-circular/C", { 
                    qName: "/invalid-schema-circular/C", 
                    properties: new Map(),
                    extends: "/invalid-schema-circular/A" // 🚨 C → A (Circular dependency)
                }]
            ]),
            roles: new Map(),
            export: [],
            import: new Map()
        });

        const errors = verifySchemaConsistency(schemaRegistry.schemas.get("/invalid-schema-circular")!, schemaRegistry);
        expect(errors).toContain(
            'Circular inheritance detected in type hierarchy: "/invalid-schema-circular/A → /invalid-schema-circular/B → /invalid-schema-circular/C → /invalid-schema-circular/A".'
        );
    });
});
