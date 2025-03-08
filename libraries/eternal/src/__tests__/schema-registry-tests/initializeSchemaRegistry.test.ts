import { initializeSchemaRegistry } from "../../SchemaRegistry";
import { SchemaRegistry, TypeSchema } from "../../handlers/MetaDefinitions";

describe("initializeSchemaRegistry", () => {
    let schemaRegistry: SchemaRegistry;

    beforeEach(() => {
        schemaRegistry = { schemas: new Map<string, TypeSchema>() };
    });

    test("T1: should initialize an empty schema registry", () => {
        const result = initializeSchemaRegistry([]);
        expect(result).toEqual({ schemas: new Map<string, TypeSchema>() });
    });

    test("T2: should initialize a schema registry with valid schemas", () => {
        const jsonSchemas = [
            {
                qName: "/core/Document",
                label: "Document",
                version: "1.0",
                types: {
                    "/core/Document": {
                        properties: {
                            "/core/Document/title": { type: "string" },
                            "/core/Document/content": { type: "string" }
                        }
                    }
                }
            },
            {
                qName: "/core/User",
                label: "User",
                version: "1.0",
                types: {
                    "/core/User": {
                        properties: {
                            "/core/User/name": { type: "string" },
                            "/core/User/email": { type: "string" }
                        }
                    }
                }
            }
        ];
        const result = initializeSchemaRegistry(jsonSchemas);
        if (Array.isArray(result)) {
            throw new Error("Expected a SchemaRegistry, but got errors");
        }
        expect(result).toHaveProperty("schemas");
        expect(result.schemas.size).toBe(2);
        expect(result.schemas.has("/core/Document")).toBe(true);
        expect(result.schemas.has("/core/User")).toBe(true);
    });

    test("T3: should return errors for schemas with missing qName", () => {
        const jsonSchemas = [
            {
                label: "Document",
                version: "1.0",
                types: {
                    "/core/Document": {
                        properties: {
                            "/core/Document/title": { type: "string" }
                        }
                    }
                }
            }
        ];
        const result = initializeSchemaRegistry(jsonSchemas);
        expect(Array.isArray(result)).toBe(true);
        if (Array.isArray(result)) {
            expect(result.some(error => error.includes("Schema is missing a valid 'qName'."))).toBe(true);
        }
    });

    test("T4: should return errors for schemas with duplicate qName", () => {
        const jsonSchemas = [
            {
                qName: "/core/Document",
                label: "Document",
                version: "1.0",
                types: {
                    "/core/Document": {
                        properties: {
                            "/core/Document/title": { type: "string" }
                        }
                    }
                }
            },
            {
                qName: "/core/Document",
                label: "Document",
                version: "1.0",
                types: {
                    "/core/Document": {
                        properties: {
                            "/core/Document/title": { type: "string" }
                        }
                    }
                }
            }
        ];
        const result = initializeSchemaRegistry(jsonSchemas);
        expect(Array.isArray(result)).toBe(true);
        if (Array.isArray(result)) {
            expect(result.some(error => error.includes('Schema "/core/Document" is already defined.'))).toBe(true);
        }
    });

    test("T5: should return errors for schemas with invalid properties", () => {
        const jsonSchemas = [
            {
                qName: "/core/Document",
                label: "Document",
                version: "1.0",
                types: {
                    "/core/Document": {
                        properties: {
                            "/core/Document/title": { type: "invalidType" }
                        }
                    }
                }
            }
        ];
        const result = initializeSchemaRegistry(jsonSchemas);
        expect(Array.isArray(result)).toBe(true);
        if (Array.isArray(result)) {
            expect(result.some(error => error.includes('Property "/core/Document/title" refers to unknown type "invalidType".'))).toBe(true);
        }
    });

    test("T6: should handle complex nested schemas", () => {
        const jsonSchemas = [
            {
                qName: "/core/Document",
                label: "Document",
                version: "1.0",
                types: {
                    "/core/Document": {
                        properties: {
                            "/core/Document/title": { type: "string" },
                            "/core/Document/content": { type: "string" },
                            "/core/Document/author": { type: "/core/User" }
                        }
                    }
                }
            },
            {
                qName: "/core/User",
                label: "User",
                version: "1.0",
                types: {
                    "/core/User": {
                        properties: {
                            "/core/User/name": { type: "string" },
                            "/core/User/email": { type: "string" }
                        }
                    }
                }
            }
        ];
        const result = initializeSchemaRegistry(jsonSchemas);
        if (Array.isArray(result)) {
            throw new Error("Expected a SchemaRegistry, but got errors");
        }
        expect(result).toHaveProperty("schemas");
        expect(result.schemas.size).toBe(2);
        expect(result.schemas.has("/core/Document")).toBe(true);
        expect(result.schemas.has("/core/User")).toBe(true);
    });

    test("T7: should return errors for schemas with circular references", () => {
        const jsonSchemas = [
            {
                qName: "/core/Document",
                label: "Document",
                version: "1.0",
                types: {
                    "/core/Document": {
                        properties: {
                            "/core/Document/title": { type: "string" },
                            "/core/Document/content": { type: "string" },
                            "/core/Document/relatedDocument": { type: "/core/Document" }
                        }
                    }
                }
            }
        ];
        const result = initializeSchemaRegistry(jsonSchemas);
        expect(Array.isArray(result)).toBe(true);
        if (Array.isArray(result)) {
            expect(result.some(error => error.includes('Schema "/core/Document" has a circular reference.'))).toBe(true);
        }
    });

    test("T8: should handle schemas with valid minElements and maxElements", () => {
        const jsonSchemas = [
            {
                qName: "/core/Order",
                label: "Order",
                version: "1.0",
                types: {
                    "/core/Order": {
                        properties: {
                            "/core/Order/items": {
                                type: "array",
                                itemType: "string",
                                minElements: 1,
                                maxElements: 10
                            }
                        }
                    }
                }
            }
        ];
        const result = initializeSchemaRegistry(jsonSchemas);
        if (Array.isArray(result)) {
            throw new Error("Expected a SchemaRegistry, but got errors");
        }
        expect(result).toHaveProperty("schemas");
        expect(result.schemas.size).toBe(1);
        expect(result.schemas.has("/core/Order")).toBe(true);
    });

    test("T9: should return errors for schemas with invalid minElements and maxElements", () => {
        const jsonSchemas = [
            {
                qName: "/core/Product",
                label: "Product",
                version: "1.0",
                types: {
                    "/core/Product": {
                        properties: {
                            "/core/Product/tags": {
                                type: "set",
                                itemType: "string",
                                minElements: 5,
                                maxElements: 3 // Invalid: minElements > maxElements
                            }
                        }
                    }
                }
            }
        ];
        const result = initializeSchemaRegistry(jsonSchemas);
        expect(Array.isArray(result)).toBe(true);
        if (Array.isArray(result)) {
            expect(result.some(error => error.includes('Property "/core/Product/tags" has minElements=5 but maxElements=3 (invalid).'))).toBe(true);
        }
    });

    test("T10: should handle schemas with valid property references", () => {
        const jsonSchemas = [
            {
                qName: "/core/Document",
                label: "Document",
                version: "1.0",
                types: {
                    "/core/Document": {
                        properties: {
                            "/core/Document/title": { type: "string" }
                        }
                    }
                }
            },
            {
                qName: "/core/User",
                label: "User",
                version: "1.0",
                types: {
                    "/core/User": {
                        properties: {
                            "/core/User/documents": {
                                type: "array",
                                itemType: "object",
                                inverseType: "/core/Document",
                                inverseProp: "/core/Document/author"
                            }
                        }
                    }
                }
            }
        ];
        const result = initializeSchemaRegistry(jsonSchemas);
        if (Array.isArray(result)) {
            throw new Error("Expected a SchemaRegistry, but got errors");
        }
        expect(result).toHaveProperty("schemas");
        expect(result.schemas.size).toBe(2);
        expect(result.schemas.has("/core/Document")).toBe(true);
        expect(result.schemas.has("/core/User")).toBe(true);
    });

    test("T11: should return errors for schemas with missing property references", () => {
        const jsonSchemas = [
            {
                qName: "/core/InvalidType",
                label: "InvalidType",
                version: "1.0",
                types: {
                    "/core/InvalidType": {
                        properties: {
                            "/core/InvalidType/invalidRef": {
                                type: "object",
                                inverseType: "/non-existent/Type" // This type does not exist
                            }
                        }
                    }
                }
            }
        ];
        const result = initializeSchemaRegistry(jsonSchemas);
        expect(Array.isArray(result)).toBe(true);
        if (Array.isArray(result)) {
            expect(result.some(error => error.includes('Property "/core/InvalidType/invalidRef" refers to unknown type "/non-existent/Type".'))).toBe(true);
        }
    });

    test("T12: should return errors for schemas with invalid inverse property references", () => {
        const jsonSchemas = [
            {
                qName: "/core/TypeA",
                label: "TypeA",
                version: "1.0",
                types: {
                    "/core/TypeA": {
                        properties: {
                            "/core/TypeA/ref": {
                                type: "object",
                                inverseType: "/core/TypeB",
                                inverseProp: "/core/TypeB/missingRef" // Inverse property does not exist
                            }
                        }
                    }
                }
            },
            {
                qName: "/core/TypeB",
                label: "TypeB",
                version: "1.0",
                types: {
                    "/core/TypeB": {
                        properties: {
                            "/core/TypeB/actualRef": {
                                type: "object",
                                inverseType: "/core/TypeA",
                                inverseProp: "/core/TypeA/ref"
                            }
                        }
                    }
                }
            }
        ];
        const result = initializeSchemaRegistry(jsonSchemas);
        expect(Array.isArray(result)).toBe(true);
        if (Array.isArray(result)) {
            expect(result.some(error => error.includes('Property "/core/TypeA/ref" declares inverseProp "/core/TypeB/missingRef", but it does not exist in "/core/TypeB".'))).toBe(true);
        }
    });

    test("T13: should handle schemas with valid imports", () => {
        const jsonSchemas = [
            {
                qName: "/core/Document",
                label: "Document",
                version: "1.0",
                imports: ["/core/User"],
                types: {
                    "/core/Document": {
                        properties: {
                            "/core/Document/title": { type: "string" },
                            "/core/Document/author": { type: "/core/User" }
                        }
                    }
                }
            },
            {
                qName: "/core/User",
                label: "User",
                version: "1.0",
                types: {
                    "/core/User": {
                        properties: {
                            "/core/User/name": { type: "string" },
                            "/core/User/email": { type: "string" }
                        }
                    }
                }
            }
        ];
        const result = initializeSchemaRegistry(jsonSchemas);
        if (Array.isArray(result)) {
            throw new Error("Expected a SchemaRegistry, but got errors");
        }
        expect(result).toHaveProperty("schemas");
        expect(result.schemas.size).toBe(2);
        expect(result.schemas.has("/core/Document")).toBe(true);
        expect(result.schemas.has("/core/User")).toBe(true);
    });

    test("T14: should return errors for schemas with missing imports", () => {
        const jsonSchemas = [
            {
                qName: "/core/Document",
                label: "Document",
                version: "1.0",
                imports: ["/core/MissingUser"],
                types: {
                    "/core/Document": {
                        properties: {
                            "/core/Document/title": { type: "string" },
                            "/core/Document/author": { type: "/core/MissingUser" }
                        }
                    }
                }
            }
        ];
        const result = initializeSchemaRegistry(jsonSchemas);
        expect(Array.isArray(result)).toBe(true);
        if (Array.isArray(result)) {
            expect(result.some(error => error.includes('Schema "/core/Document" imports missing schema "/core/MissingUser".'))).toBe(true);
        }
    });

    test("T15: should return errors for schemas with duplicate exports", () => {
        const jsonSchemas = [
            {
                qName: "/core/Document",
                label: "Document",
                version: "1.0",
                exports: ["/core/TypeA"],
                types: {
                    "/core/Document": {
                        properties: {
                            "/core/Document/title": { type: "string" }
                        }
                    }
                }
            },
            {
                qName: "/core/User",
                label: "User",
                version: "1.0",
                exports: ["/core/TypeA"],
                types: {
                    "/core/User": {
                        properties: {
                            "/core/User/name": { type: "string" }
                        }
                    }
                }
            }
        ];
        const result = initializeSchemaRegistry(jsonSchemas);
        expect(Array.isArray(result)).toBe(true);
        if (Array.isArray(result)) {
            expect(result.some(error => error.includes('Schema "/core/User" exports type "/core/TypeA" which is already exported by "/core/Document".'))).toBe(true);
        }
    });

    test("T16: should return errors for schema with circular references over imported schema", () => {
        const jsonSchemas = [
            {
                qName: "/core/Document",
                label: "Document",
                version: "1.0",
                imports: ["/core/User"],
                types: {
                    "/core/Document": {
                        properties: {
                            "/core/Document/title": { type: "string" },
                            "/core/Document/author": { type: "/core/User" }
                        }
                    }
                }
            },
            {
                qName: "/core/User",
                label: "User",
                version: "1.0",
                types: {
                    "/core/User": {
                        properties: {
                            "/core/User/name": { type: "string" },
                            "/core/User/document": { type: "/core/Document" } // Circular reference
                        }
                    }
                }
            }
        ];
        const result = initializeSchemaRegistry(jsonSchemas);
        expect(Array.isArray(result)).toBe(true);
        if (Array.isArray(result)) {
            expect(result.some(error => error.includes('Schema "/core/User" has a circular reference.'))).toBe(true);
        }
    });

    test("T17: should return errors for schema with missing property references over imported schema", () => {
        const jsonSchemas = [
            {
                qName: "/core/Document",
                label: "Document",
                version: "1.0",
                imports: ["/core/User"],
                types: {
                    "/core/Document": {
                        properties: {
                            "/core/Document/title": { type: "string" },
                            "/core/Document/author": { type: "/core/User" }
                        }
                    }
                }
            },
            {
                qName: "/core/User",
                label: "User",
                version: "1.0",
                types: {
                    "/core/User": {
                        properties: {
                            "/core/User/name": { type: "string" },
                            "/core/User/missingRef": { type: "/non-existent/Type" } // Missing reference
                        }
                    }
                }
            }
        ];
        const result = initializeSchemaRegistry(jsonSchemas);
        expect(Array.isArray(result)).toBe(true);
        if (Array.isArray(result)) {
            expect(result.some(error => error.includes('Property "/core/User/missingRef" refers to unknown type "/non-existent/Type".'))).toBe(true);
        }
    });

    test("T18: should return errors for schema with invalid inverse property references over imported schema", () => {
        const jsonSchemas = [
            {
                qName: "/core/Document",
                label: "Document",
                version: "1.0",
                imports: ["/core/User"],
                types: {
                    "/core/Document": {
                        properties: {
                            "/core/Document/title": { type: "string" },
                            "/core/Document/author": { type: "/core/User" }
                        }
                    }
                }
            },
            {
                qName: "/core/User",
                label: "User",
                version: "1.0",
                types: {
                    "/core/User": {
                        properties: {
                            "/core/User/name": { type: "string" },
                            "/core/User/invalidRef": {
                                type: "object",
                                inverseType: "/core/Document",
                                inverseProp: "/core/Document/missingRef" // Invalid inverse property reference
                            }
                        }
                    }
                }
            }
        ];
        const result = initializeSchemaRegistry(jsonSchemas);
        expect(Array.isArray(result)).toBe(true);
        if (Array.isArray(result)) {
            expect(result.some(error => error.includes('Property "/core/User/invalidRef" declares inverseProp "/core/Document/missingRef", but it does not exist in "/core/Document".'))).toBe(true);
        }
    });
});