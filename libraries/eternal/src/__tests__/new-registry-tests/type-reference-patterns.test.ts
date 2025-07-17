import { RegistryService } from "../../registry/RegistryService";
import { RegistryMetadata } from "../../registry/NamespaceMetadata";

describe("Type Reference Pattern Tests", () => {
    let registry: RegistryService;
    
    beforeEach(() => {
        const registryMetadata: RegistryMetadata = {
            namespaces: new Map(),
            name: "test-registry",
            version: "1.0.0"
        };
        registry = new RegistryService(registryMetadata);
        
        // Create test namespace hierarchy for pattern testing
        const rootNamespace = {
            qName: "/root",
            version: "1.0.0",
            types: new Map([
                ["RootType", {
                    qName: "/root/RootType",
                    category: "complex" as const,
                    kind: "object" as const,
                    properties: new Map()
                }]
            ]),
            exports: ["RootType"],
            imports: new Map()
        };
        
        const childNamespace = {
            qName: "/root/child",
            version: "1.0.0", 
            types: new Map([
                ["ChildType", {
                    qName: "/root/child/ChildType",
                    category: "complex" as const,
                    kind: "object" as const,
                    properties: new Map([
                        // Test all reference patterns in properties
                        ["absoluteRef", {
                            name: "absoluteRef",
                            typeRef: "/root/RootType", // Absolute path
                            optional: false
                        }],
                        ["parentRef", {
                            name: "parentRef", 
                            typeRef: "../RootType", // Parent path
                            optional: false
                        }],
                        ["localRef", {
                            name: "localRef",
                            typeRef: "ChildType", // Local reference
                            optional: false
                        }],
                        ["systemRef", {
                            name: "systemRef",
                            typeRef: "string", // System type
                            optional: false
                        }],
                        ["importedRef", {
                            name: "importedRef",
                            typeRef: "ImportedType", // Via import
                            optional: false
                        }]
                    ])
                }]
            ]),
            exports: ["ChildType"],
            imports: new Map([
                ["/external", ["ImportedType"]]
            ])
        };
        
        const externalNamespace = {
            qName: "/external",
            version: "1.0.0",
            types: new Map([
                ["ImportedType", {
                    qName: "/external/ImportedType",
                    category: "simple" as const,
                    kind: "string" as const
                }]
            ]),
            exports: ["ImportedType"],
            imports: new Map()
        };
        
        // Import in dependency order
        registry.importNamespace(rootNamespace);
        registry.importNamespace(externalNamespace);
        registry.importNamespace(childNamespace);
    });

    describe("Resolution API Tests", () => {
        test("should resolve all reference patterns via public API", () => {
            const childNs = registry.getNamespace("/root/child")!;
            
            // Test all patterns
            expect(registry.resolveAndValidateTypeReference("/root/RootType", childNs)).toBe("/root/RootType");
            expect(registry.resolveAndValidateTypeReference("../RootType", childNs)).toBe("/root/RootType");
            expect(registry.resolveAndValidateTypeReference("ChildType", childNs)).toBe("/root/child/ChildType");
            expect(registry.resolveAndValidateTypeReference("string", childNs)).toBe("/system/string");
            expect(registry.resolveAndValidateTypeReference("ImportedType", childNs)).toBe("/external/ImportedType");
        });

        test("should provide convenience method for store operations", () => {
            // Convenience method for store operations
            expect(registry.resolveTypeReference("/root/RootType", "/root/child")).toBe("/root/RootType");
            expect(registry.resolveTypeReference("../RootType", "/root/child")).toBe("/root/RootType");
            expect(registry.resolveTypeReference("ChildType", "/root/child")).toBe("/root/child/ChildType");
            expect(registry.resolveTypeReference("string", "/root/child")).toBe("/system/string");
            expect(registry.resolveTypeReference("ImportedType", "/root/child")).toBe("/external/ImportedType");
        });

        test("should return undefined for invalid references", () => {
            expect(registry.resolveTypeReference("NonExistent", "/root/child")).toBeUndefined();
            expect(registry.resolveTypeReference("../NonExistent", "/root/child")).toBeUndefined();
            expect(registry.resolveTypeReference("/invalid/path", "/root/child")).toBeUndefined();
        });
    });

    describe("Validation Integration Tests", () => {
        test("should validate namespace with all reference patterns", () => {
            // Verify the child namespace imported successfully with all patterns
            expect(registry.hasNamespace("/root/child")).toBe(true);
            
            const childType = registry.getType("/root/child/ChildType");
            expect(childType).toBeDefined();
            expect(childType?.category).toBe("complex");
            expect(childType?.kind).toBe("object");
            
            if (childType && childType.category === "complex" && childType.kind === "object") {
                // All property references should have been validated successfully
                expect(childType.properties.size).toBe(5);
                expect(childType.properties.has("absoluteRef")).toBe(true);
                expect(childType.properties.has("parentRef")).toBe(true);
                expect(childType.properties.has("localRef")).toBe(true);
                expect(childType.properties.has("systemRef")).toBe(true);
                expect(childType.properties.has("importedRef")).toBe(true);
            }
        });

        test("should provide resolved references for all pattern types", () => {
            const childNs = registry.getNamespace("/root/child")!;
            const childType = registry.getType("/root/child/ChildType")!;
            
            if (childType.category === "complex" && childType.kind === "object") {
                // Test that all references can be resolved
                for (const [propName, propMeta] of childType.properties) {
                    const resolved = registry.resolveAndValidateTypeReference(propMeta.typeRef, childNs);
                    expect(resolved).toBeDefined();
                    expect(typeof resolved).toBe("string");
                    expect(resolved!.startsWith("/")).toBe(true);
                }
            }
        });
    });

    describe("Store Operation Readiness", () => {
        test("should support store type resolution workflows", () => {
            // Simulate store operations that need type resolution
            const contextNamespace = "/root/child";
            
            // Property access: obj.someProperty (need to resolve property type)
            const propertyType = registry.resolveTypeReference("string", contextNamespace);
            expect(propertyType).toBe("/system/string");
            
            // Collection element access: array[0] (need to resolve element type) 
            const elementType = registry.resolveTypeReference("ChildType", contextNamespace);
            expect(elementType).toBe("/root/child/ChildType");
            
            // Cross-reference navigation: obj.relatedEntity (need to resolve target type)
            const relatedType = registry.resolveTypeReference("../RootType", contextNamespace);
            expect(relatedType).toBe("/root/RootType");
            
            // Dynamic type checking: instanceof checks
            const systemType = registry.resolveTypeReference("number", contextNamespace);
            expect(systemType).toBe("/system/number");
        });
    });
});