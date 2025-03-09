import { computeResolvedTypes, verifySchemaConsistency } from "../../SchemaRegistry"
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
                            type: "object", domainType: "/core/Document" }]
                    ])
                }]
            ]),
            roles: new Map(),
            export: ["/customer/sales/Invoice"],
            import: new Map([
                ["/core", ["/core/Document"]]
            ])
        });
            // Compute resolved types
    for (const schema of schemaRegistry.schemas.values()) {
        computeResolvedTypes(schema, schemaRegistry);
    }
    });

    test("T3: Validate a schema that correctly imports another schema (should pass)", () => {
        const schema = schemaRegistry.schemas.get("/customer/sales")!
        computeResolvedTypes(schema, schemaRegistry);
        const errors = verifySchemaConsistency(schema, schemaRegistry);
        expect(errors).toEqual([]); // No errors expected
    });

    test("T4: Validate a schema importing a missing schema (should fail)", () => {
        const s = {
            qName: "/customer/finance",
            version: "2.0",
            types: new Map(),
            roles: new Map(),
            export: [],
            import: new Map([
                ["/missing-schema", ["/missing-schema/MissingType"]]
            ])}
        schemaRegistry.schemas.set("/customer/finance", s);
        computeResolvedTypes(s, schemaRegistry);
        const errors = verifySchemaConsistency(s, schemaRegistry);
        expect(errors).toContain('Imported schema "/missing-schema" not found in registry.');
    });

    test("T5: Validate a schema importing a missing type or role from an existing schema (should fail)", () => {
        const s = {
            qName: "/customer/marketing",
            version: "2.0",
            types: new Map(),
            roles: new Map(),
            export: [],
            import: new Map([
                ["/core", ["/core/MissingType"]]
            ])
        }
        schemaRegistry.schemas.set("/customer/marketing", s);
        computeResolvedTypes(s, schemaRegistry);
        const errors = verifySchemaConsistency(s, schemaRegistry);
        expect(errors).toContain('Entity "/core/MissingType" imported from "/core" does not exist.');
    });
});