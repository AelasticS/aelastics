import { RegistryService, NamespaceImportError } from "../../registry/RegistryService";
import { RegistryMetadata } from "../../registry/NamespaceMetadata";

describe("Batch Import Tests", () => {
    let registry: RegistryService;
    
    beforeEach(() => {
        const registryMetadata: RegistryMetadata = {
            namespaces: new Map(),
            name: "test-registry",
            version: "1.0.0"
        };
        registry = new RegistryService(registryMetadata);
    });

    describe("Basic Batch Import", () => {
        test("should import multiple independent namespaces", () => {
            const namespaceA = {
                qName: "/test-a",
                version: "1.0.0",
                types: new Map([
                    ["TypeA", {
                        qName: "/test-a/TypeA",
                        kind: "string" as const
                    }]
                ]),
                exports: ["TypeA"],
                imports: new Map()
            };

            const namespaceB = {
                qName: "/test-b", 
                version: "1.0.0",
                types: new Map([
                    ["TypeB", {
                        qName: "/test-b/TypeB",
                        kind: "number" as const
                    }]
                ]),
                exports: ["TypeB"],
                imports: new Map()
            };

            // Should successfully import both
            expect(() => {
                registry.importNamespaceBatch([namespaceA, namespaceB]);
            }).not.toThrow();

            // Verify both namespaces are imported
            expect(registry.hasNamespace("/test-a")).toBe(true);
            expect(registry.hasNamespace("/test-b")).toBe(true);
            expect(registry.hasType("/test-a/TypeA")).toBe(true);
            expect(registry.hasType("/test-b/TypeB")).toBe(true);
        });

        test("should handle empty batch gracefully", () => {
            expect(() => {
                registry.importNamespaceBatch([]);
            }).not.toThrow();
        });

        test("should import single namespace via batch", () => {
            const namespace = {
                qName: "/single",
                version: "1.0.0",
                types: new Map([
                    ["SingleType", {
                        qName: "/single/SingleType",
                        kind: "string" as const
                    }]
                ]),
                exports: ["SingleType"],
                imports: new Map()
            };

            expect(() => {
                registry.importNamespaceBatch([namespace]);
            }).not.toThrow();

            expect(registry.hasNamespace("/single")).toBe(true);
            expect(registry.hasType("/single/SingleType")).toBe(true);
        });
    });

    describe("Circular Import Support", () => {
        test("should allow circular imports within batch", () => {
            const namespaceA = {
                qName: "/circular-a",
                version: "1.0.0",
                types: new Map([
                    ["TypeA", {
                        qName: "/circular-a/TypeA",
                        kind: "object" as const,
                        properties: new Map([
                            ["refToB", {
                                name: "refToB",
                                typeRef: "TypeB", // References type in circular-b
                                optional: false
                            }]
                        ])
                    }]
                ]),
                exports: ["TypeA"],
                imports: new Map([
                    ["/circular-b", ["TypeB"]]
                ])
            };

            const namespaceB = {
                qName: "/circular-b",
                version: "1.0.0", 
                types: new Map([
                    ["TypeB", {
                        qName: "/circular-b/TypeB",
                        kind: "object" as const,
                        properties: new Map([
                            ["refToA", {
                                name: "refToA",
                                typeRef: "TypeA", // References type in circular-a
                                optional: false
                            }]
                        ])
                    }]
                ]),
                exports: ["TypeB"],
                imports: new Map([
                    ["/circular-a", ["TypeA"]]
                ])
            };

            // Should succeed with batch import (circular imports allowed)
            try {
                registry.importNamespaceBatch([namespaceA, namespaceB]);
            } catch (error) {
                if (error instanceof NamespaceImportError) {
                    console.log("Batch import errors:", error.validationResult.errors);
                }
                throw error;
            }

            expect(registry.hasNamespace("/circular-a")).toBe(true);
            expect(registry.hasNamespace("/circular-b")).toBe(true);
        });

        test("should reject circular imports in single import", () => {
            const namespaceA = {
                qName: "/circular-a",
                version: "1.0.0",
                types: new Map([
                    ["TypeA", {
                        qName: "/circular-a/TypeA",
                        kind: "string" as const
                    }]
                ]),
                exports: ["TypeA"],
                imports: new Map([
                    ["/circular-b", ["TypeB"]]
                ])
            };

            // Single import should fail because /circular-b doesn't exist yet
            expect(() => {
                registry.importNamespace(namespaceA);
            }).toThrow(NamespaceImportError);
        });
    });

    describe("Batch Validation", () => {
        test("should reject duplicate namespaces in batch", () => {
            const namespace1 = {
                qName: "/duplicate",
                version: "1.0.0",
                types: new Map(),
                exports: [],
                imports: new Map()
            };

            const namespace2 = {
                qName: "/duplicate", // Same qName!
                version: "2.0.0",
                types: new Map(),
                exports: [],
                imports: new Map()
            };

            expect(() => {
                registry.importNamespaceBatch([namespace1, namespace2]);
            }).toThrow(NamespaceImportError);
        });

        test("should reject if namespace already exists in registry", () => {
            const existingNamespace = {
                qName: "/existing",
                version: "1.0.0",
                types: new Map(),
                exports: [],
                imports: new Map()
            };

            // Import first namespace
            registry.importNamespace(existingNamespace);

            const newNamespace = {
                qName: "/new",
                version: "1.0.0",
                types: new Map(),
                exports: [],
                imports: new Map()
            };

            const duplicateNamespace = {
                qName: "/existing", // Already exists!
                version: "2.0.0",
                types: new Map(),
                exports: [],
                imports: new Map()
            };

            // Batch should fail because /existing already exists
            expect(() => {
                registry.importNamespaceBatch([newNamespace, duplicateNamespace]);
            }).toThrow(NamespaceImportError);

            // /new should not be imported either (all-or-nothing)
            expect(registry.hasNamespace("/new")).toBe(false);
        });

        test("should validate cross-references within batch", () => {
            const namespaceA = {
                qName: "/ref-a",
                version: "1.0.0",
                types: new Map([
                    ["TypeA", {
                        qName: "/ref-a/TypeA",
                        kind: "object" as const,
                        properties: new Map([
                            ["refToB", {
                                name: "refToB",
                                typeRef: "/ref-b/TypeB", // Absolute reference to other namespace in batch
                                optional: false
                            }]
                        ])
                    }]
                ]),
                exports: ["TypeA"],
                imports: new Map([
                    ["/ref-b", ["TypeB"]]
                ])
            };

            const namespaceB = {
                qName: "/ref-b",
                version: "1.0.0",
                types: new Map([
                    ["TypeB", {
                        qName: "/ref-b/TypeB",
                        kind: "string" as const
                    }]
                ]),
                exports: ["TypeB"],
                imports: new Map()
            };

            // Should succeed - cross-references are valid within batch
            expect(() => {
                registry.importNamespaceBatch([namespaceA, namespaceB]);
            }).not.toThrow();

            expect(registry.hasNamespace("/ref-a")).toBe(true);
            expect(registry.hasNamespace("/ref-b")).toBe(true);
        });

        test("should reject invalid cross-references in batch", () => {
            const namespaceA = {
                qName: "/invalid-ref-a",
                version: "1.0.0",
                types: new Map([
                    ["TypeA", {
                        qName: "/invalid-ref-a/TypeA",
                        kind: "object" as const,
                        properties: new Map([
                            ["refToNonExistent", {
                                name: "refToNonExistent",
                                typeRef: "NonExistentType", // This type doesn't exist!
                                optional: false
                            }]
                        ])
                    }]
                ]),
                exports: ["TypeA"],
                imports: new Map()
            };

            const namespaceB = {
                qName: "/invalid-ref-b",
                version: "1.0.0",
                types: new Map([
                    ["TypeB", {
                        qName: "/invalid-ref-b/TypeB",
                        kind: "string" as const
                    }]
                ]),
                exports: ["TypeB"],
                imports: new Map()
            };

            // Should fail due to invalid type reference
            expect(() => {
                registry.importNamespaceBatch([namespaceA, namespaceB]);
            }).toThrow(NamespaceImportError);

            // Neither namespace should be imported (all-or-nothing)
            expect(registry.hasNamespace("/invalid-ref-a")).toBe(false);
            expect(registry.hasNamespace("/invalid-ref-b")).toBe(false);
        });
    });

    describe("All-or-Nothing Behavior", () => {
        test("should import nothing if any namespace fails validation", () => {
            const validNamespace = {
                qName: "/valid",
                version: "1.0.0",
                types: new Map([
                    ["ValidType", {
                        qName: "/valid/ValidType",
                        kind: "string" as const
                    }]
                ]),
                exports: ["ValidType"],
                imports: new Map()
            };

            const invalidNamespace = {
                qName: "invalid-qname", // Invalid qName format!
                version: "1.0.0",
                types: new Map(),
                exports: [],
                imports: new Map()
            };

            // Batch should fail due to invalid namespace
            expect(() => {
                registry.importNamespaceBatch([validNamespace, invalidNamespace]);
            }).toThrow(NamespaceImportError);

            // Valid namespace should not be imported either
            expect(registry.hasNamespace("/valid")).toBe(false);
            expect(registry.hasType("/valid/ValidType")).toBe(false);
        });
    });

    describe("System Namespace Auto-Import", () => {
        test("should auto-add system namespace import to batch namespaces", () => {
            const namespace = {
                qName: "/test-system",
                version: "1.0.0",
                types: new Map([
                    ["TestType", {
                        qName: "/test-system/TestType",
                        kind: "object" as const,
                        properties: new Map([
                            ["stringProp", {
                                name: "stringProp",
                                typeRef: "string", // System type
                                optional: false
                            }]
                        ])
                    }]
                ]),
                exports: ["TestType"],
                imports: new Map() // No system import initially
            };

            // Should succeed - system namespace is auto-imported
            expect(() => {
                registry.importNamespaceBatch([namespace]);
            }).not.toThrow();

            expect(registry.hasNamespace("/test-system")).toBe(true);
            
            // Verify system import was added
            const importedNamespace = registry.getNamespace("/test-system")!;
            expect(importedNamespace.imports.has("/system")).toBe(true);
        });
    });
});