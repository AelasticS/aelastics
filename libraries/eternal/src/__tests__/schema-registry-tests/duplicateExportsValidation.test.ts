import { verifySchemaConsistency } from "../../SchemaRegistry"
import { SchemaRegistry, TypeSchema } from "../../meta/InternalSchema";

describe("Schema Existence Validation", () => {
    let schemaRegistry: SchemaRegistry = { schemas: new Map<string, TypeSchema>() } //  Local schema registry

    beforeEach(() => {
        // Reset schema registry before each test
        schemaRegistry.schemas.clear();


        // Add first schema exporting a type
        schemaRegistry.schemas.set("/schema1", {
            qName: "/schema1",
            version: "1.0",
            types: new Map([
                ["/schema1/SharedType", { qName: "/schema1/SharedType", properties: new Map() }]
            ]),
            roles: new Map(),
            export: ["/schema1/SharedType"],
            import: new Map()
        });

        // Add second schema that incorrectly exports the same type
        schemaRegistry.schemas.set("/schema2", {
            qName: "/schema2",
            version: "1.0",
            types: new Map([
                ["/schema2/AnotherType", { qName: "/schema2/AnotherType", properties: new Map() }]
            ]),
            roles: new Map(),
            export: ["/schema1/SharedType"], // 🚨 Conflict: Exporting the same type from two schemas
            import: new Map()
        });
    });

    test("T6: Two schemas export the same type or role (should fail)", () => {
        const errors = verifySchemaConsistency(schemaRegistry.schemas.get("/schema2")!, schemaRegistry);
        expect(errors).toEqual(
            expect.arrayContaining([
            'Conflict: Entity "/schema1/SharedType" is exported by both "/schema2" and "/schema1".'
            ])
        );
    });
});
