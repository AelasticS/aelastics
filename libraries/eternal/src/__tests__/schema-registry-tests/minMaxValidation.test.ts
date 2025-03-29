import { verifySchemaConsistency } from "../../meta/SchemaRegistry"
import { PropertyMeta, SchemaRegistry, TypeSchema } from "../../meta/InternalSchema";

describe("Schema Existence Validation", () => {
    let schemaRegistry: SchemaRegistry = { schemas: new Map<string, TypeSchema>() } //  Local schema registry

    beforeEach(() => {
        // Reset schema registry before each test
        schemaRegistry.schemas.clear();

        // Define a valid schema with properly defined min/max constraints
        schemaRegistry.schemas.set("/valid-schema", {
            qName: "/valid-schema",
            version: "1.0",
            types: new Map([
                ["/valid-schema/Order", {
                    qName: "/valid-schema/Order",
                    properties: new Map<string, PropertyMeta>([
                        ["/valid-schema/Order/items", { 
                            qName: "/valid-schema/Order/items",
                            type: "array", 
                            itemType: "string",
                            minElements: "1",
                            maxElements: "10"
                        }]
                    ])
                }]
            ]),
            roles: new Map(),
            export: ["/valid-schema/Order"],
            import: new Map()
        });
    });

    test("T12: Property with valid minElements and maxElements (should pass)", () => {
        const errors = verifySchemaConsistency(schemaRegistry.schemas.get("/valid-schema")!, schemaRegistry);
        expect(errors).toEqual([]); // No errors expected
    });

    test("T13: Property with minElements > maxElements (should fail)", () => {
        schemaRegistry.schemas.set("/invalid-schema", {
            qName: "/invalid-schema",
            version: "1.0",
            types: new Map([
            ["/invalid-schema/Product", {
                qName: "/invalid-schema/Product",
                properties: new Map<string, PropertyMeta>([
                ["/invalid-schema/Product/tags", { 
                    qName: "/invalid-schema/Product/tags",
                    type: "set", 
                    itemType: "string",
                    minElements: "5",
                    maxElements: "3" // 🚨 Invalid: minElements > maxElements
                }]
                ])
            }]
            ]),
            roles: new Map(),
            export: [],
            import: new Map()
        });

        const errors = verifySchemaConsistency(schemaRegistry.schemas.get("/invalid-schema")!, schemaRegistry);
        expect(errors).toContain(
            'Property "/invalid-schema/Product/tags" has minElements=5 but maxElements=3 (invalid).'
        );
    });
});
