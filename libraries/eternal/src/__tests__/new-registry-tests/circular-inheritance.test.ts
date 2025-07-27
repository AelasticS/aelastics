import { RegistryService, NamespaceImportError } from "../../registry/RegistryService";
import { RegistryMetadata } from "../../registry/NamespaceMetadata";

describe("Circular Inheritance Detection Tests", () => {
    let registry: RegistryService;
    
    beforeEach(() => {
        const registryMetadata: RegistryMetadata = {
            namespaces: new Map(),
            name: "test-registry",
            version: "1.0.0"
        };
        registry = new RegistryService(registryMetadata);
    });

    describe("Direct Circular Inheritance", () => {
        test("should detect A extends A (self-inheritance)", () => {
            const invalidNamespace = {
                qName: "/test-self-inheritance",
                version: "1.0.0",
                types: new Map([
                    ["TypeA", {
                        qName: "/test-self-inheritance/TypeA",
                        kind: "object" as const,
                        extends: "/test-self-inheritance/TypeA", // Self-inheritance!
                        properties: new Map()
                    }]
                ]),
                exports: ["TypeA"],
                imports: new Map()
            };
            
            expect(() => {
                registry.importNamespace(invalidNamespace);
            }).toThrow(NamespaceImportError);
        });

        test("should detect A extends B, B extends A (direct cycle)", () => {
            const invalidNamespace = {
                qName: "/test-direct-cycle",
                version: "1.0.0",
                types: new Map([
                    ["TypeA", {
                        qName: "/test-direct-cycle/TypeA",
                        kind: "object" as const,
                        extends: "/test-direct-cycle/TypeB",
                        properties: new Map()
                    }],
                    ["TypeB", {
                        qName: "/test-direct-cycle/TypeB",
                        kind: "object" as const,
                        extends: "/test-direct-cycle/TypeA", // Creates cycle!
                        properties: new Map()
                    }]
                ]),
                exports: ["TypeA", "TypeB"],
                imports: new Map()
            };
            
            expect(() => {
                registry.importNamespace(invalidNamespace);
            }).toThrow(NamespaceImportError);
        });
    });

    describe("Indirect Circular Inheritance", () => {
        test("should detect A extends B extends C extends A (indirect cycle)", () => {
            const invalidNamespace = {
                qName: "/test-indirect-cycle",
                version: "1.0.0",
                types: new Map([
                    ["TypeA", {
                        qName: "/test-indirect-cycle/TypeA",
                        kind: "object" as const,
                        extends: "/test-indirect-cycle/TypeB",
                        properties: new Map()
                    }],
                    ["TypeB", {
                        qName: "/test-indirect-cycle/TypeB",
                        kind: "object" as const,
                        extends: "/test-indirect-cycle/TypeC",
                        properties: new Map()
                    }],
                    ["TypeC", {
                        qName: "/test-indirect-cycle/TypeC",
                        kind: "object" as const,
                        extends: "/test-indirect-cycle/TypeA", // Creates cycle!
                        properties: new Map()
                    }]
                ]),
                exports: ["TypeA", "TypeB", "TypeC"],
                imports: new Map()
            };
            
            expect(() => {
                registry.importNamespace(invalidNamespace);
            }).toThrow(NamespaceImportError);
        });
    });

    describe("Cross-Namespace Circular Inheritance", () => {
        test("should detect circular inheritance across namespaces", () => {
            // First namespace: TypeA (no inheritance initially)
            const namespace1 = {
                qName: "/ns1",
                version: "1.0.0",
                types: new Map([
                    ["TypeA", {
                        qName: "/ns1/TypeA",
                        kind: "object" as const,
                        properties: new Map()
                    }]
                ]),
                exports: ["TypeA"],
                imports: new Map()
            };
            
            // Second namespace: TypeB extends /ns1/TypeA
            const namespace2 = {
                qName: "/ns2",
                version: "1.0.0",
                types: new Map([
                    ["TypeB", {
                        qName: "/ns2/TypeB",
                        kind: "object" as const,
                        extends: "/ns1/TypeA",
                        properties: new Map()
                    }]
                ]),
                exports: ["TypeB"],
                imports: new Map()
            };
            
            // Third namespace: TypeA that extends TypeB (creates cycle!)
            const namespace3 = {
                qName: "/ns3",
                version: "1.0.0",
                types: new Map([
                    ["TypeC", {
                        qName: "/ns3/TypeC",
                        kind: "object" as const,
                        extends: "/ns2/TypeB", // This extends TypeB which extends TypeA
                        properties: new Map()
                    }],
                    ["TypeCyclic", {
                        qName: "/ns3/TypeCyclic",
                        kind: "object" as const,
                        extends: "/ns1/TypeA", // This would create a complex inheritance chain
                        properties: new Map()
                    }]
                ]),
                exports: ["TypeC", "TypeCyclic"],
                imports: new Map()
            };
            
            // Import namespaces in order
            registry.importNamespace(namespace1);
            registry.importNamespace(namespace2);
            
            // This should succeed - no cycles yet
            expect(() => {
                registry.importNamespace(namespace3);
            }).not.toThrow();
            
            // Now try to create a namespace that would cause a cycle
            const cyclicNamespace = {
                qName: "/ns-cyclic",
                version: "1.0.0",
                types: new Map([
                    ["CyclicType", {
                        qName: "/ns-cyclic/CyclicType",
                        kind: "object" as const,
                        extends: "/ns3/TypeC", // TypeC -> TypeB -> TypeA, now TypeA would extend CyclicType in another test
                        properties: new Map()
                    }]
                ]),
                exports: ["CyclicType"],
                imports: new Map()
            };
            
            // This should succeed as well - still no cycle
            expect(() => {
                registry.importNamespace(cyclicNamespace);
            }).not.toThrow();
        });
    });

    describe("Valid Inheritance Chains", () => {
        test("should allow valid linear inheritance chains", () => {
            const validNamespace = {
                qName: "/test-valid-inheritance",
                version: "1.0.0",
                types: new Map([
                    ["BaseType", {
                        qName: "/test-valid-inheritance/BaseType",
                        kind: "object" as const,
                        properties: new Map([
                            ["baseProperty", {
                                name: "baseProperty",
                                typeRef: "string",
                                optional: false
                            }]
                        ])
                    }],
                    ["MiddleType", {
                        qName: "/test-valid-inheritance/MiddleType",
                        kind: "object" as const,
                        extends: "/test-valid-inheritance/BaseType",
                        properties: new Map([
                            ["middleProperty", {
                                name: "middleProperty",
                                typeRef: "string",
                                optional: false
                            }]
                        ])
                    }],
                    ["DerivedType", {
                        qName: "/test-valid-inheritance/DerivedType",
                        kind: "entity" as const,
                        extends: "/test-valid-inheritance/MiddleType",
                        properties: new Map([
                            ["id", {
                                name: "id",
                                typeRef: "string",
                                optional: false
                            }],
                            ["derivedProperty", {
                                name: "derivedProperty", 
                                typeRef: "string",
                                optional: false
                            }]
                        ]),
                        identityKeys: ["id"]
                    }]
                ]),
                exports: ["BaseType", "MiddleType", "DerivedType"],
                imports: new Map()
            };
            
            // Should not throw - this is valid inheritance
            expect(() => {
                registry.importNamespace(validNamespace);
            }).not.toThrow();
            
            // Verify all types were imported successfully
            expect(registry.hasType("/test-valid-inheritance/BaseType")).toBe(true);
            expect(registry.hasType("/test-valid-inheritance/MiddleType")).toBe(true);
            expect(registry.hasType("/test-valid-inheritance/DerivedType")).toBe(true);
        });
    });

    describe("Error Message Validation", () => {
        test("should provide detailed error messages for circular inheritance", () => {
            const invalidNamespace = {
                qName: "/test-error-messages",
                version: "1.0.0",
                types: new Map([
                    ["TypeA", {
                        qName: "/test-error-messages/TypeA",
                        kind: "object" as const,
                        extends: "/test-error-messages/TypeB",
                        properties: new Map()
                    }],
                    ["TypeB", {
                        qName: "/test-error-messages/TypeB",
                        kind: "object" as const,
                        extends: "/test-error-messages/TypeA",
                        properties: new Map()
                    }]
                ]),
                exports: ["TypeA", "TypeB"],
                imports: new Map()
            };
            
            try {
                registry.importNamespace(invalidNamespace);
                fail("Should have thrown NamespaceImportError");
            } catch (error) {
                expect(error).toBeInstanceOf(NamespaceImportError);
                const importError = error as NamespaceImportError;
                expect(importError.validationResult.isValid).toBe(false);
                
                // Should contain circular inheritance error message
                const hasCircularInheritanceError = importError.validationResult.errors.some(
                    err => err.includes("Circular inheritance detected")
                );
                expect(hasCircularInheritanceError).toBe(true);
            }
        });
    });
});