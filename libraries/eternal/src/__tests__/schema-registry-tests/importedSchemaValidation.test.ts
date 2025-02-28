import { verifySchemaConsistency } from "../../SchemaRegistry"
import { SchemaRegistry, TypeSchema } from "../../handlers/MetaDefinitions";

describe("Schema Existence Validation", () => {
    let schemaRegistry: SchemaRegistry = { schemas: new Map<string, TypeSchema>() } //  Local schema registry

    beforeEach(() => {
        // Reset schema registry before each test
        schemaRegistry.schemas.clear();


        // Add a valid core schema
        schemaRegistry.schemas.set("/core", {
            qName: "/core",
            version: "1.0",
            types: new Map([
                ["/core/Document", { qName: "/core/Document", properties: new Map() }]
            ]),
            roles: new Map([
                ["/core/Versionable", { qName: "/core/Versionable", type: "/core/VersioningRules" }]
            ]),
            export: ["/core/Document", "/core/Versionable"],
            import: new Map()
        });

        // Add a valid customer schema importing from core
        schemaRegistry.schemas.set("/customer/sales", {
            qName: "/customer/sales",
            version: "2.0",
            types: new Map([
                ["/customer/sales/Invoice", { 
                    qName: "/customer/sales/Invoice", 
                    properties: new Map([
                        ["/customer/sales/Invoice/document", { 
                            qName: "/customer/sales/Invoice/document", 
                            type: "object", inverseType: "/core/Document" }]
                    ])
                }]
            ]),
            roles: new Map(),
            export: ["/customer/sales/Invoice"],
            import: new Map([
                ["/core", ["/core/Document"]]
            ])
        });
    });

    test("T3: Validate a schema that correctly imports another schema (should pass)", () => {
        const errors = verifySchemaConsistency("/customer/sales", schemaRegistry);
        expect(errors).toEqual([]); // No errors expected
    });

    test("T4: Validate a schema importing a missing schema (should fail)", () => {
        schemaRegistry.schemas.set("/customer/finance", {
            qName: "/customer/finance",
            version: "2.0",
            types: new Map(),
            roles: new Map(),
            export: [],
            import: new Map([
                ["/missing-schema", ["/missing-schema/MissingType"]]
            ])
        });

        const errors = verifySchemaConsistency("/customer/finance", schemaRegistry);
        expect(errors).toContain('Imported schema "/missing-schema" not found in registry.');
    });

    test("T5: Validate a schema importing a missing type or role from an existing schema (should fail)", () => {
        schemaRegistry.schemas.set("/customer/marketing", {
            qName: "/customer/marketing",
            version: "2.0",
            types: new Map(),
            roles: new Map(),
            export: [],
            import: new Map([
                ["/core", ["/core/MissingType"]]
            ])
        });

        const errors = verifySchemaConsistency("/customer/marketing", schemaRegistry);
        expect(errors).toContain('Entity "/core/MissingType" imported from "/core" does not exist.');
    });
});