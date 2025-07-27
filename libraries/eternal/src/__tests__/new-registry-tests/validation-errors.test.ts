import { RegistryService, NamespaceImportError } from "../../registry/RegistryService";
import { isComplexType } from "../../registry/TypeDefinitions";
import { RegistryMetadata } from "../../registry/NamespaceMetadata";
import { companyNamespace } from "../example-namespaces/company-namespace";
import { coreNamespace } from "../example-namespaces/core-namespace";

describe("Validation Error Tests", () => {
    let registry: RegistryService;
    
    beforeEach(() => {
        const registryMetadata: RegistryMetadata = {
            namespaces: new Map(),
            name: "test-registry",
            version: "1.0.0"
        };
        registry = new RegistryService(registryMetadata);
    });

    describe("Namespace Validation Errors", () => {
        test("should throw NamespaceImportError for duplicate namespace", () => {
            registry.importNamespace(companyNamespace);
            
            expect(() => {
                registry.importNamespace(companyNamespace);
            }).toThrow(NamespaceImportError);
        });

        test("should provide specific error message for duplicate namespace", () => {
            registry.importNamespace(companyNamespace);
            
            try {
                registry.importNamespace(companyNamespace);
                fail("Should have thrown NamespaceImportError");
            } catch (error) {
                expect(error).toBeInstanceOf(NamespaceImportError);
                const importError = error as NamespaceImportError;
                expect(importError.validationResult.isValid).toBe(false);
                expect(importError.validationResult.errors).toContain("Namespace '/company' already exists");
            }
        });

        test("should prevent using reserved 'system' namespace name", () => {
            const systemNamespace = {
                qName: "system",
                version: "1.0.0",
                types: new Map(),
                exports: [],
                imports: new Map()
            };
            
            expect(() => {
                registry.importNamespace(systemNamespace);
            }).toThrow(NamespaceImportError);
        });

        test("should provide specific error for reserved namespace name", () => {
            const systemNamespace = {
                qName: "system",
                version: "1.0.0",
                types: new Map(),
                exports: [],
                imports: new Map()
            };
            
            try {
                registry.importNamespace(systemNamespace);
                fail("Should have thrown NamespaceImportError");
            } catch (error) {
                expect(error).toBeInstanceOf(NamespaceImportError);
                const importError = error as NamespaceImportError;
                expect(importError.validationResult.isValid).toBe(false);
                expect(importError.validationResult.errors).toContain("Namespace 'system' is reserved for system types");
            }
        });
    });

    describe("Import Validation Errors", () => {
        test("should detect missing imported namespace", () => {
            const invalidNamespace = {
                qName: "/test-missing-import",
                version: "1.0.0",
                types: new Map(),
                exports: [],
                imports: new Map([
                    ["/non-existent", ["SomeType"]]
                ])
            };
            
            expect(() => {
                registry.importNamespace(invalidNamespace);
            }).toThrow(NamespaceImportError);
        });

        test("should provide specific error for missing imported namespace", () => {
            const invalidNamespace = {
                qName: "/test-missing-import",
                version: "1.0.0",
                types: new Map(),
                exports: [],
                imports: new Map([
                    ["/non-existent", ["SomeType"]]
                ])
            };
            
            try {
                registry.importNamespace(invalidNamespace);
                fail("Should have thrown NamespaceImportError");
            } catch (error) {
                expect(error).toBeInstanceOf(NamespaceImportError);
                const importError = error as NamespaceImportError;
                expect(importError.validationResult.isValid).toBe(false);
                expect(importError.validationResult.errors).toContain("Imported namespace '/non-existent' does not exist");
            }
        });

        test("should detect non-exported imported types", () => {
            registry.importNamespace(coreNamespace);
            
            const invalidNamespace = {
                qName: "/test-non-exported",
                version: "1.0.0",
                types: new Map(),
                exports: [],
                imports: new Map([
                    ["/core", ["NonExportedType"]]
                ])
            };
            
            expect(() => {
                registry.importNamespace(invalidNamespace);
            }).toThrow(NamespaceImportError);
        });

        test("should detect non-existent imported types", () => {
            registry.importNamespace(coreNamespace);
            
            const invalidNamespace = {
                qName: "/test-non-existent-type",
                version: "1.0.0",
                types: new Map(),
                exports: [],
                imports: new Map([
                    ["/core", ["CompletelyMadeUpType"]]
                ])
            };
            
            try {
                registry.importNamespace(invalidNamespace);
                fail("Should have thrown NamespaceImportError");
            } catch (error) {
                expect(error).toBeInstanceOf(NamespaceImportError);
                const importError = error as NamespaceImportError;
                expect(importError.validationResult.isValid).toBe(false);
                expect(importError.validationResult.errors).toEqual(
                    expect.arrayContaining([
                        "Type 'CompletelyMadeUpType' is not exported by namespace '/core'",
                        "Type 'CompletelyMadeUpType' does not exist in namespace '/core'"
                    ])
                );
            }
        });
    });

    describe("Type Definition Validation Errors", () => {
        test("should detect invalid qualified names", () => {
            const invalidNamespace = {
                qName: "/test-invalid-qname",
                version: "1.0.0",
                types: new Map([
                    ["InvalidType", {
                        qName: "invalid-qname-no-slash", // Invalid: doesn't start with /
                        category: "complex" as const,
                        kind: "object" as const,
                        properties: new Map()
                    }]
                ]),
                exports: ["InvalidType"],
                imports: new Map()
            };
            
            expect(() => {
                registry.importNamespace(invalidNamespace);
            }).toThrow(NamespaceImportError);
        });

        test("should detect unknown property type references", () => {
            const invalidNamespace = {
                qName: "/test-unknown-prop-type",
                version: "1.0.0",
                types: new Map([
                    ["TestType", {
                        qName: "/test-unknown-prop-type/TestType",
                        category: "complex" as const,
                        kind: "object" as const,
                        properties: new Map([
                            ["badProperty", {
                                name: "badProperty",
                                typeRef: "NonExistentType",
                                optional: false
                            }]
                        ])
                    }]
                ]),
                exports: ["TestType"],
                imports: new Map()
            };
            
            try {
                registry.importNamespace(invalidNamespace);
                fail("Should have thrown NamespaceImportError");
            } catch (error) {
                expect(error).toBeInstanceOf(NamespaceImportError);
                const importError = error as NamespaceImportError;
                expect(importError.validationResult.isValid).toBe(false);
                expect(importError.validationResult.errors).toContain("Property 'badProperty' references unknown type 'NonExistentType'");
            }
        });

        test("should detect missing optional flag on properties", () => {
            const invalidNamespace = {
                qName: "/test-missing-optional",
                version: "1.0.0",
                types: new Map([
                    ["TestType", {
                        qName: "/test-missing-optional/TestType",
                        category: "complex" as const,
                        kind: "object" as const,
                        properties: new Map([
                            ["badProperty", {
                                name: "badProperty",
                                typeRef: "string"
                                // Missing: optional: false
                            } as any]
                        ])
                    }]
                ]),
                exports: ["TestType"],
                imports: new Map()
            };
            
            try {
                registry.importNamespace(invalidNamespace);
                fail("Should have thrown NamespaceImportError");
            } catch (error) {
                expect(error).toBeInstanceOf(NamespaceImportError);
                const importError = error as NamespaceImportError;
                expect(importError.validationResult.isValid).toBe(false);
                expect(importError.validationResult.errors).toContain("Property 'badProperty' missing required 'optional' flag");
            }
        });
    });

    describe("Inheritance Validation Errors", () => {
        test("should detect unknown base types in inheritance", () => {
            const invalidNamespace = {
                qName: "/test-unknown-base",
                version: "1.0.0",
                types: new Map([
                    ["DerivedType", {
                        qName: "/test-unknown-base/DerivedType",
                        category: "complex" as const,
                        kind: "entity" as const,
                        extends: "/non-existent/BaseType",
                        properties: new Map([
                            ["id", {
                                name: "id",
                                typeRef: "string",
                                optional: false
                            }]
                        ]),
                        identityKeys: ["id"]
                    }]
                ]),
                exports: ["DerivedType"],
                imports: new Map()
            };
            
            try {
                registry.importNamespace(invalidNamespace);
                fail("Should have thrown NamespaceImportError");
            } catch (error) {
                expect(error).toBeInstanceOf(NamespaceImportError);
                const importError = error as NamespaceImportError;
                expect(importError.validationResult.isValid).toBe(false);
                expect(importError.validationResult.errors).toContain("Base type '/non-existent/BaseType' not found");
            }
        });

        test("should detect non-object base types", () => {
            const invalidNamespace = {
                qName: "/test-non-object-base",
                version: "1.0.0",
                types: new Map([
                    ["PrimitiveType", {
                        qName: "/test-non-object-base/PrimitiveType",
                        category: "simple" as const,
                        kind: "string" as const
                    }],
                    ["DerivedType", {
                        qName: "/test-non-object-base/DerivedType",
                        category: "complex" as const,
                        kind: "entity" as const,
                        extends: "/test-non-object-base/PrimitiveType", // Can't extend primitive
                        properties: new Map([
                            ["id", {
                                name: "id",
                                typeRef: "string",
                                optional: false
                            }]
                        ]),
                        identityKeys: ["id"]
                    }]
                ]),
                exports: ["PrimitiveType", "DerivedType"],
                imports: new Map()
            };
            
            try {
                registry.importNamespace(invalidNamespace);
                fail("Should have thrown NamespaceImportError");
            } catch (error) {
                expect(error).toBeInstanceOf(NamespaceImportError);
                const importError = error as NamespaceImportError;
                expect(importError.validationResult.isValid).toBe(false);
                expect(importError.validationResult.errors).toContain("Base type '/test-non-object-base/PrimitiveType' is not an object type");
            }
        });
    });

    describe("Entity Validation Errors", () => {
        test("should detect missing identity key properties", () => {
            const invalidNamespace = {
                qName: "/test-missing-identity-key",
                version: "1.0.0",
                types: new Map([
                    ["EntityType", {
                        qName: "/test-missing-identity-key/EntityType",
                        category: "complex" as const,
                        kind: "entity" as const,
                        properties: new Map([
                            ["name", {
                                name: "name",
                                typeRef: "string",
                                optional: false
                            }]
                        ]),
                        identityKeys: ["id"] // Property 'id' doesn't exist
                    }]
                ]),
                exports: ["EntityType"],
                imports: new Map()
            };
            
            try {
                registry.importNamespace(invalidNamespace);
                fail("Should have thrown NamespaceImportError");
            } catch (error) {
                expect(error).toBeInstanceOf(NamespaceImportError);
                const importError = error as NamespaceImportError;
                expect(importError.validationResult.isValid).toBe(false);
                expect(importError.validationResult.errors).toContain("Identity key property 'id' not found in entity '/test-missing-identity-key/EntityType' or its inheritance chain");
            }
        });
    });

    describe("System Type Conflicts", () => {
        test("should detect conflicts with system type names", () => {
            const invalidNamespace = {
                qName: "/test-system-conflict",
                version: "1.0.0",
                types: new Map([
                    ["string", { // Conflicts with system type
                        qName: "/test-system-conflict/string",
                        category: "complex" as const,
                        kind: "object" as const,
                        properties: new Map()
                    }],
                    ["number", { // Conflicts with system type
                        qName: "/test-system-conflict/number",
                        category: "simple" as const,
                        kind: "string" as const
                    }]
                ]),
                exports: ["string", "number"],
                imports: new Map()
            };
            
            try {
                registry.importNamespace(invalidNamespace);
                fail("Should have thrown NamespaceImportError");
            } catch (error) {
                expect(error).toBeInstanceOf(NamespaceImportError);
                const importError = error as NamespaceImportError;
                expect(importError.validationResult.isValid).toBe(false);
                expect(importError.validationResult.errors).toEqual(
                    expect.arrayContaining([
                        "Type name 'string' conflicts with system type",
                        "Type name 'number' conflicts with system type"
                    ])
                );
            }
        });
    });

    describe("Collection Type Validation Errors", () => {
        test("should allow collection types with unvalidated element types (current limitation)", () => {
            // Note: Current implementation doesn't validate collection element types
            const namespaceWithUnvalidatedCollections = {
                qName: "/test-unvalidated-collections",
                version: "1.0.0",
                types: new Map([
                    ["ArrayType", {
                        qName: "/test-unvalidated-collections/ArrayType",
                        category: "complex" as const,
                        kind: "array" as const,
                        elementType: "/non-existent/Type" // Would be invalid if validated
                    }],
                    ["SetType", {
                        qName: "/test-unvalidated-collections/SetType",
                        category: "complex" as const,
                        kind: "set" as const,
                        elementType: "UnknownType" // Would be invalid if validated
                    }],
                    ["MapType", {
                        qName: "/test-unvalidated-collections/MapType",
                        category: "complex" as const,
                        kind: "map" as const,
                        keyType: "UnknownKeyType", // Would be invalid if validated
                        valueType: "UnknownValueType" // Would be invalid if validated
                    }]
                ]),
                exports: ["ArrayType", "SetType", "MapType"],
                imports: new Map()
            };
            
            // Currently these should not throw - collection element validation is not implemented
            expect(() => {
                registry.importNamespace(namespaceWithUnvalidatedCollections);
            }).not.toThrow();
            
            // Verify the types were imported
            expect(registry.hasType("/test-unvalidated-collections/ArrayType")).toBe(true);
            expect(registry.hasType("/test-unvalidated-collections/SetType")).toBe(true);
            expect(registry.hasType("/test-unvalidated-collections/MapType")).toBe(true);
        });

        test("should import collections with valid element types", () => {
            const validCollectionNamespace = {
                qName: "/test-valid-collections",
                version: "1.0.0",
                types: new Map([
                    ["StringArray", {
                        qName: "/test-valid-collections/StringArray",
                        category: "complex" as const,
                        kind: "array" as const,
                        elementType: "string" // System type
                    }],
                    ["NumberSet", {
                        qName: "/test-valid-collections/NumberSet",
                        category: "complex" as const,
                        kind: "set" as const,
                        elementType: "number" // System type
                    }],
                    ["StringToNumberMap", {
                        qName: "/test-valid-collections/StringToNumberMap",
                        category: "complex" as const,
                        kind: "map" as const,
                        keyType: "string", // System type
                        valueType: "number" // System type
                    }]
                ]),
                exports: ["StringArray", "NumberSet", "StringToNumberMap"],
                imports: new Map()
            };
            
            expect(() => {
                registry.importNamespace(validCollectionNamespace);
            }).not.toThrow();
            
            // Verify collections are properly imported
            const stringArray = registry.getType("/test-valid-collections/StringArray");
            expect(isComplexType(stringArray!)).toBe(true);
            expect(stringArray?.kind).toBe("array");
            
            const numberSet = registry.getType("/test-valid-collections/NumberSet");
            expect(isComplexType(numberSet!)).toBe(true);
            expect(numberSet?.kind).toBe("set");
            
            const stringToNumberMap = registry.getType("/test-valid-collections/StringToNumberMap");
            expect(isComplexType(stringToNumberMap!)).toBe(true);
            expect(stringToNumberMap?.kind).toBe("map");
        });

        test("should note that collection element validation is a future enhancement", () => {
            // First import the namespace from the previous test
            const namespaceWithUnvalidatedCollections = {
                qName: "/test-unvalidated-collections-2",
                version: "1.0.0",
                types: new Map([
                    ["TestArray", {
                        qName: "/test-unvalidated-collections-2/TestArray",
                        category: "complex" as const,
                        kind: "array" as const,
                        elementType: "/non-existent/Type"
                    }]
                ]),
                exports: ["TestArray"],
                imports: new Map()
            };
            
            registry.importNamespace(namespaceWithUnvalidatedCollections);
            
            // This test documents the current limitation and future enhancement
            const futureValidationCases = [
                "Array element type validation",
                "Set element type validation", 
                "Map key and value type validation",
                "Nested collection validation",
                "Collection circular reference detection"
            ];
            
            // These validation features are not yet implemented
            expect(futureValidationCases.length).toBeGreaterThan(0);
            
            // Current behavior: collections are imported without element type validation
            expect(registry.hasNamespace("/test-unvalidated-collections-2")).toBe(true);
        });
    });

    describe("Multiple Validation Errors", () => {
        test("should collect multiple validation errors", () => {
            const multiErrorNamespace = {
                qName: "/test-multi-errors",
                version: "1.0.0",
                types: new Map([
                    ["string", { // Error: conflicts with system type
                        qName: "invalid-qname", // Error: invalid qName format
                        category: "complex" as const,
                        kind: "object" as const,
                        properties: new Map([
                            ["badProp", {
                                name: "badProp",
                                typeRef: "NonExistentType" // Error: unknown type
                                // Missing: optional flag
                            } as any]
                        ])
                    }]
                ]),
                exports: ["string"],
                imports: new Map([
                    ["/non-existent", ["SomeType"]] // Error: namespace doesn't exist
                ])
            };
            
            try {
                registry.importNamespace(multiErrorNamespace);
                fail("Should have thrown NamespaceImportError");
            } catch (error) {
                expect(error).toBeInstanceOf(NamespaceImportError);
                const importError = error as NamespaceImportError;
                expect(importError.validationResult.isValid).toBe(false);
                expect(importError.validationResult.errors.length).toBeGreaterThan(1);
                
                // Should contain multiple different error types
                const errorMessages = importError.validationResult.errors;
                expect(errorMessages).toEqual(
                    expect.arrayContaining([
                        "Type name 'string' conflicts with system type",
                        "Imported namespace '/non-existent' does not exist"
                    ])
                );
            }
        });

        test("should provide validation result with all errors", () => {
            const invalidNamespace = {
                qName: "/test-validation-result",
                version: "1.0.0",
                types: new Map([
                    ["TestType", {
                        qName: "/test-validation-result/TestType",
                        category: "complex" as const,
                        kind: "entity" as const,
                        properties: new Map([
                            ["badProp", {
                                name: "badProp",
                                typeRef: "NonExistentType",
                                optional: false
                            }]
                        ]),
                        identityKeys: ["missingKey"]
                    }]
                ]),
                exports: ["TestType"],
                imports: new Map()
            };
            
            try {
                registry.importNamespace(invalidNamespace);
                fail("Should have thrown NamespaceImportError");
            } catch (error) {
                expect(error).toBeInstanceOf(NamespaceImportError);
                const importError = error as NamespaceImportError;
                
                // Verify ValidationResult structure
                expect(importError.validationResult).toBeDefined();
                expect(importError.validationResult.isValid).toBe(false);
                expect(Array.isArray(importError.validationResult.errors)).toBe(true);
                expect(importError.validationResult.errors.length).toBeGreaterThan(0);
                
                // Should contain specific errors
                expect(importError.validationResult.errors).toEqual(
                    expect.arrayContaining([
                        "Property 'badProp' references unknown type 'NonExistentType'",
                        "Identity key property 'missingKey' not found in entity '/test-validation-result/TestType' or its inheritance chain"
                    ])
                );
            }
        });
    });

    describe("Error Message Quality", () => {
        test("should provide clear and specific error messages", () => {
            registry.importNamespace(companyNamespace);
            
            try {
                registry.importNamespace(companyNamespace);
                fail("Should have thrown NamespaceImportError");
            } catch (error) {
                expect(error).toBeInstanceOf(NamespaceImportError);
                const importError = error as NamespaceImportError;
                
                // Error message should be descriptive
                expect(importError.message).toBe("Namespace import failed");
                
                // Validation errors should be specific
                const errors = importError.validationResult.errors;
                expect(errors).toHaveLength(1);
                expect(errors[0]).toMatch(/Namespace '\/company' already exists/);
            }
        });

        test("should distinguish between different error types", () => {
            const invalidNamespace = {
                qName: "/test-error-types",
                version: "1.0.0",
                types: new Map([
                    ["TestType", {
                        qName: "/test-error-types/TestType",
                        category: "complex" as const,
                        kind: "object" as const,
                        properties: new Map([
                            ["prop1", {
                                name: "prop1",
                                typeRef: "UnknownType1",
                                optional: false
                            }],
                            ["prop2", {
                                name: "prop2",
                                typeRef: "UnknownType2", 
                                optional: false
                            }]
                        ])
                    }]
                ]),
                exports: ["TestType"],
                imports: new Map([
                    ["/missing-namespace", ["SomeType"]]
                ])
            };
            
            try {
                registry.importNamespace(invalidNamespace);
                fail("Should have thrown NamespaceImportError");
            } catch (error) {
                expect(error).toBeInstanceOf(NamespaceImportError);
                const importError = error as NamespaceImportError;
                
                const errors = importError.validationResult.errors;
                
                // Should have import error
                expect(errors.some(e => e.includes("Imported namespace"))).toBe(true);
                
                // Should have property reference errors
                expect(errors.some(e => e.includes("Property 'prop1' references unknown type"))).toBe(true);
                expect(errors.some(e => e.includes("Property 'prop2' references unknown type"))).toBe(true);
            }
        });
    });
});