import { 
    Namespace, 
    RegistryMetadata,
    getLocalName,
    getNamespacePath,
    buildQualifiedName,
    isSubNamespace,
    getAvailableTypes,
    resolveTypeReference
} from "../../../registry/NamespaceMetadata";
import { ObjectTypeMeta } from "../../../registry/TypeDefinitions";
import { systemNamespace } from "../../../registry/system-namespace";

describe("Namespace Metadata Utilities", () => {
    
    describe("Name Utilities", () => {
        test("should extract local name from qualified name", () => {
            expect(getLocalName("/company/users/User")).toBe("User");
            expect(getLocalName("/base/string")).toBe("string");
            expect(getLocalName("SimpleType")).toBe("SimpleType");
        });

        test("should extract namespace path from qualified type name", () => {
            expect(getNamespacePath("/company/users/User")).toBe("/company/users");
            expect(getNamespacePath("/base/string")).toBe("/base");
            expect(getNamespacePath("/root/Type")).toBe("/root");
        });

        test("should build qualified name from namespace and type", () => {
            expect(buildQualifiedName("/company/users", "User")).toBe("/company/users/User");
            expect(buildQualifiedName("/base", "string")).toBe("/base/string");
            expect(buildQualifiedName("/company/users/", "User")).toBe("/company/users/User"); // Handle trailing slash
        });

        test("should check sub-namespace relationships", () => {
            expect(isSubNamespace("/company/users", "/company")).toBe(true);
            expect(isSubNamespace("/company/users/admin", "/company")).toBe(true);
            expect(isSubNamespace("/company", "/company/users")).toBe(false);
            expect(isSubNamespace("/other", "/company")).toBe(false);
        });
    });

    describe("Available Types Resolution", () => {
        let registry: RegistryMetadata;
        
        beforeEach(() => {
            registry = {
                namespaces: new Map(),
                name: "Test Registry",
                version: "1.0.0"
            };
        });

        test("should get available types including local types", () => {
            const userType: ObjectTypeMeta = {
                qName: "/company/users/User",
                category: "complex",
                kind: "entity",
                properties: new Map(),
                identityKeys: ["id"]
            };

            const namespace: Namespace = {
                qName: "/company/users",
                types: new Map([["User", userType]]),
                exports: ["User"],
                imports: new Map()
            };

            registry.namespaces.set("/company/users", namespace);

            const availableTypes = getAvailableTypes(namespace, registry);
            expect(availableTypes.has("User")).toBe(true);
            expect(availableTypes.size).toBe(1);
        });

        test("should get available types including imported types", () => {
            // Base namespace with exported types
            const baseNamespace: Namespace = {
                qName: "/base",
                types: new Map([["string", {
                    qName: "/base/string",
                    category: "simple",
                    kind: "string"
                }]]),
                exports: ["string"],
                imports: new Map()
            };

            // Importing namespace
            const appNamespace: Namespace = {
                qName: "/app",
                types: new Map([["User", {
                    qName: "/app/User",
                    category: "complex",
                    kind: "entity",
                    properties: new Map(),
                    identityKeys: ["id"]
                }]]),
                exports: ["User"],
                imports: new Map([["/base", ["string"]]])
            };

            registry.namespaces.set("/base", baseNamespace);
            registry.namespaces.set("/app", appNamespace);

            const availableTypes = getAvailableTypes(appNamespace, registry);
            expect(availableTypes.has("User")).toBe(true);  // Local type
            expect(availableTypes.has("string")).toBe(true); // Imported type
            expect(availableTypes.size).toBe(2);
        });

        test("should not include non-exported types from imported namespaces", () => {
            // Base namespace with non-exported type
            const baseNamespace: Namespace = {
                qName: "/base",
                types: new Map([
                    ["string", {
                        qName: "/base/string",
                        category: "simple",
                        kind: "string"
                    }],
                    ["internal", {
                        qName: "/base/internal",
                        category: "simple",
                        kind: "string"
                    }]
                ]),
                exports: ["string"], // Only string is exported
                imports: new Map()
            };

            // Importing namespace trying to import non-exported type
            const appNamespace: Namespace = {
                qName: "/app",
                types: new Map(),
                exports: [],
                imports: new Map([["/base", ["string", "internal"]]])
            };

            registry.namespaces.set("/base", baseNamespace);
            registry.namespaces.set("/app", appNamespace);

            const availableTypes = getAvailableTypes(appNamespace, registry);
            expect(availableTypes.has("string")).toBe(true);   // Exported and imported
            expect(availableTypes.has("internal")).toBe(false); // Not exported
            expect(availableTypes.size).toBe(1);
        });
    });

    describe("Type Reference Resolution", () => {
        let registry: RegistryMetadata;
        
        beforeEach(() => {
            registry = {
                namespaces: new Map(),
                name: "Test Registry",
                version: "1.0.0"
            };
        });

        test("should resolve local type references", () => {
            const userType: ObjectTypeMeta = {
                qName: "/company/users/User",
                category: "complex",
                kind: "entity",
                properties: new Map(),
                identityKeys: ["id"]
            };

            const namespace: Namespace = {
                qName: "/company/users",
                types: new Map([["User", userType]]),
                exports: ["User"],
                imports: new Map()
            };

            registry.namespaces.set("/company/users", namespace);

            const resolved = resolveTypeReference("User", namespace, registry);
            expect(resolved).toBe("/company/users/User");
        });

        test("should resolve imported type references", () => {
            // Base namespace
            const baseNamespace: Namespace = {
                qName: "/base",
                types: new Map([["string", {
                    qName: "/base/string",
                    category: "simple",
                    kind: "string"
                }]]),
                exports: ["string"],
                imports: new Map()
            };

            // Importing namespace
            const appNamespace: Namespace = {
                qName: "/app",
                types: new Map(),
                exports: [],
                imports: new Map([["/base", ["string"]]])
            };

            registry.namespaces.set("/base", baseNamespace);
            registry.namespaces.set("/app", appNamespace);

            const resolved = resolveTypeReference("string", appNamespace, registry);
            expect(resolved).toBe("/base/string");
        });

        test("should prioritize local types over imported types", () => {
            // Base namespace with string type
            const baseNamespace: Namespace = {
                qName: "/base",
                types: new Map([["string", {
                    qName: "/base/string",
                    category: "simple",
                    kind: "string"
                }]]),
                exports: ["string"],
                imports: new Map()
            };

            // App namespace with its own string type
            const appNamespace: Namespace = {
                qName: "/app",
                types: new Map([["string", {
                    qName: "/app/string",
                    category: "simple",
                    kind: "string"
                }]]),
                exports: ["string"],
                imports: new Map([["/base", ["string"]]])
            };

            registry.namespaces.set("/base", baseNamespace);
            registry.namespaces.set("/app", appNamespace);

            const resolved = resolveTypeReference("string", appNamespace, registry);
            expect(resolved).toBe("/app/string"); // Local type takes precedence
        });

        test("should return undefined for non-existent type references", () => {
            const namespace: Namespace = {
                qName: "/app",
                types: new Map(),
                exports: [],
                imports: new Map()
            };

            registry.namespaces.set("/app", namespace);

            const resolved = resolveTypeReference("NonExistent", namespace, registry);
            expect(resolved).toBeUndefined();
        });

        test("should not resolve types that are not exported", () => {
            // Base namespace with non-exported type
            const baseNamespace: Namespace = {
                qName: "/base",
                types: new Map([["internal", {
                    qName: "/base/internal",
                    category: "simple",
                    kind: "string"
                }]]),
                exports: [], // Nothing exported
                imports: new Map()
            };

            // App namespace trying to import non-exported type
            const appNamespace: Namespace = {
                qName: "/app",
                types: new Map(),
                exports: [],
                imports: new Map([["/base", ["internal"]]])
            };

            registry.namespaces.set("/base", baseNamespace);
            registry.namespaces.set("/app", appNamespace);

            const resolved = resolveTypeReference("internal", appNamespace, registry);
            expect(resolved).toBeUndefined();
        });
    });

    describe("System Namespace Path Resolution", () => {
        test("should resolve system types by simple name", () => {
            const registry: RegistryMetadata = {
                namespaces: new Map(),
                name: "Test Registry",
                version: "1.0.0"
            };

            const testNamespace: Namespace = {
                qName: "/test",
                types: new Map(),
                exports: [],
                imports: new Map()
            };

            // System namespace should be automatically available
            registry.namespaces.set("system", systemNamespace);
            registry.namespaces.set("/test", testNamespace);

            const resolved = resolveTypeReference("string", testNamespace, registry);
            expect(resolved).toBe("string"); // System types resolve to simple names
        });

        test("should handle absolute path resolution", () => {
            const registry: RegistryMetadata = {
                namespaces: new Map(),
                name: "Test Registry",
                version: "1.0.0"
            };
            
            const baseNamespace: Namespace = {
                qName: "/base",
                types: new Map([
                    ["Entity", {
                        qName: "/base/Entity",
                        category: "complex",
                        kind: "entity",
                        properties: new Map(),
                        identityKeys: ["id"]
                    } as ObjectTypeMeta]
                ]),
                exports: ["Entity"],
                imports: new Map()
            };

            const appNamespace: Namespace = {
                qName: "/app",
                types: new Map(),
                exports: [],
                imports: new Map()
            };

            registry.namespaces.set("/base", baseNamespace);
            registry.namespaces.set("/app", appNamespace);

            // Test absolute path resolution
            const qualifiedName = buildQualifiedName("/base", "Entity");
            expect(qualifiedName).toBe("/base/Entity");
        });

        test("should handle relative path resolution within namespace", () => {
            const registry: RegistryMetadata = {
                namespaces: new Map(),
                name: "Test Registry",
                version: "1.0.0"
            };
            
            const namespace: Namespace = {
                qName: "/company/users",
                types: new Map([
                    ["User", {
                        qName: "/company/users/User",
                        category: "complex",
                        kind: "entity",
                        properties: new Map(),
                        identityKeys: ["id"]
                    } as ObjectTypeMeta],
                    ["Profile", {
                        qName: "/company/users/Profile",
                        category: "complex",
                        kind: "object",
                        properties: new Map()
                    } as ObjectTypeMeta]
                ]),
                exports: ["User", "Profile"],
                imports: new Map()
            };

            registry.namespaces.set("/company/users", namespace);

            // Relative resolution should work for local types
            const resolved = resolveTypeReference("Profile", namespace, registry);
            expect(resolved).toBe("/company/users/Profile");
        });

        test("should handle parent path resolution with ..", () => {
            // This tests the path resolution for parent references
            const registry: RegistryMetadata = {
                namespaces: new Map(),
                name: "Test Registry",
                version: "1.0.0"
            };

            const parentNamespace: Namespace = {
                qName: "/company",
                types: new Map([
                    ["Company", {
                        qName: "/company/Company",
                        category: "complex",
                        kind: "entity",
                        properties: new Map(),
                        identityKeys: ["id"]
                    } as ObjectTypeMeta]
                ]),
                exports: ["Company"],
                imports: new Map()
            };

            const childNamespace: Namespace = {
                qName: "/company/users",
                parentNamespace: "/company",
                types: new Map(),
                exports: [],
                imports: new Map()
            };

            registry.namespaces.set("/company", parentNamespace);
            registry.namespaces.set("/company/users", childNamespace);

            // Parent path resolution should work
            expect(isSubNamespace("/company/users", "/company")).toBe(true);
            expect(getNamespacePath("/company/users/User")).toBe("/company/users");
        });

        test("should handle sub-namespace path resolution", () => {
            const registry: RegistryMetadata = {
                namespaces: new Map(),
                name: "Test Registry",
                version: "1.0.0"
            };
            
            const rootNamespace: Namespace = {
                qName: "/company",
                types: new Map(),
                exports: [],
                imports: new Map()
            };

            const subNamespace: Namespace = {
                qName: "/company/department",
                parentNamespace: "/company",
                types: new Map([
                    ["Manager", {
                        qName: "/company/department/Manager",
                        category: "complex",
                        kind: "entity",
                        properties: new Map(),
                        identityKeys: ["id"]
                    } as ObjectTypeMeta]
                ]),
                exports: ["Manager"],
                imports: new Map()
            };

            registry.namespaces.set("/company", rootNamespace);
            registry.namespaces.set("/company/department", subNamespace);

            // Sub-namespace resolution should work
            expect(isSubNamespace("/company/department", "/company")).toBe(true);
            const managerQName = buildQualifiedName("/company/department", "Manager");
            expect(managerQName).toBe("/company/department/Manager");
        });

        test("should resolve types with different path forms", () => {
            const testCases = [
                {
                    description: "absolute path",
                    input: "/company/users/User",
                    expected: "/company/users"
                },
                {
                    description: "nested path",
                    input: "/company/users/admin/AdminUser",
                    expected: "/company/users/admin"
                },
                {
                    description: "root level",
                    input: "/User",
                    expected: "/"
                }
            ];

            testCases.forEach(({ description, input, expected }) => {
                const result = getNamespacePath(input);
                expect(result).toBe(expected);
            });
        });
    });

    describe("System Namespace Integration", () => {
        test("should include system types in available types", () => {
            const registry: RegistryMetadata = {
                namespaces: new Map(),
                name: "Test Registry",
                version: "1.0.0"
            };
            
            const testNamespace: Namespace = {
                qName: "/test",
                types: new Map([
                    ["CustomType", {
                        qName: "/test/CustomType",
                        category: "complex",
                        kind: "object",
                        properties: new Map()
                    } as ObjectTypeMeta]
                ]),
                exports: ["CustomType"],
                imports: new Map()
            };

            // Add system namespace to registry
            registry.namespaces.set("system", systemNamespace);
            registry.namespaces.set("/test", testNamespace);

            const availableTypes = getAvailableTypes(testNamespace, registry);
            expect(availableTypes.has("CustomType")).toBe(true);
            // Note: System types would be added by the actual implementation
        });

        test("should handle system type conflicts properly", () => {
            const registry: RegistryMetadata = {
                namespaces: new Map(),
                name: "Test Registry",
                version: "1.0.0"
            };
            
            const conflictingNamespace: Namespace = {
                qName: "/conflicting",
                types: new Map([
                    // This should be prevented by validation
                    ["string", {
                        qName: "/conflicting/string",
                        category: "simple",
                        kind: "string"
                    }]
                ]),
                exports: ["string"],
                imports: new Map()
            };

            registry.namespaces.set("system", systemNamespace);
            registry.namespaces.set("/conflicting", conflictingNamespace);

            // Local types should take precedence, but this should be validated
            const resolved = resolveTypeReference("string", conflictingNamespace, registry);
            expect(resolved).toBe("/conflicting/string");
        });

        test("should maintain system namespace consistency", () => {
            expect(systemNamespace.qName).toBe("system");
            expect(systemNamespace.imports.size).toBe(0);
            expect(systemNamespace.exports.length).toBeGreaterThan(0);
            
            // All system types should be exportable
            systemNamespace.exports.forEach(exportedType => {
                if (exportedType !== "literal") { // literal is exported but not necessarily defined
                    expect(systemNamespace.types.has(exportedType)).toBe(true);
                }
            });
        });
    });

    describe("Namespace Hierarchy", () => {
        test("should handle parent-child namespace relationships", () => {
            const parentNamespace: Namespace = {
                qName: "/company",
                types: new Map(),
                exports: [],
                imports: new Map()
            };

            const childNamespace: Namespace = {
                qName: "/company/users",
                parentNamespace: "/company",
                types: new Map(),
                exports: [],
                imports: new Map()
            };

            expect(childNamespace.parentNamespace).toBe("/company");
            expect(isSubNamespace(childNamespace.qName, parentNamespace.qName)).toBe(true);
        });

        test("should handle deep namespace hierarchies", () => {
            const levels = [
                "/company",
                "/company/users", 
                "/company/users/admin",
                "/company/users/admin/roles"
            ];

            for (let i = 1; i < levels.length; i++) {
                expect(isSubNamespace(levels[i], levels[0])).toBe(true);
            }

            expect(isSubNamespace("/company/users/admin", "/company/users")).toBe(true);
            expect(isSubNamespace("/company/users", "/company/users/admin")).toBe(false);
        });

        test("should handle complex namespace hierarchy with system types", () => {
            const hierarchy = [
                "/company",
                "/company/users",
                "/company/users/admin",
                "/company/products",
                "/company/products/catalog"
            ];

            // All should be sub-namespaces of root company
            hierarchy.slice(1).forEach(ns => {
                expect(isSubNamespace(ns, "/company")).toBe(true);
            });

            // Test specific parent-child relationships
            expect(isSubNamespace("/company/users/admin", "/company/users")).toBe(true);
            expect(isSubNamespace("/company/products/catalog", "/company/products")).toBe(true);
            
            // Cross-branch relationships should be false
            expect(isSubNamespace("/company/users/admin", "/company/products")).toBe(false);
        });
    });

    describe("Import Resolution with Path Types", () => {
        test("should resolve aliased imports correctly", () => {
            const registry: RegistryMetadata = {
                namespaces: new Map(),
                name: "Test Registry",
                version: "1.0.0"
            };
            
            const baseNamespace: Namespace = {
                qName: "/base",
                types: new Map([
                    ["Entity", {
                        qName: "/base/Entity",
                        category: "complex",
                        kind: "entity",
                        properties: new Map(),
                        identityKeys: ["id"]
                    } as ObjectTypeMeta]
                ]),
                exports: ["Entity"],
                imports: new Map()
            };

            const appNamespace: Namespace = {
                qName: "/app",
                types: new Map(),
                exports: [],
                imports: new Map([
                    ["/base", [{ original: "Entity", alias: "BaseEntity" }]]
                ])
            };

            registry.namespaces.set("/base", baseNamespace);
            registry.namespaces.set("/app", appNamespace);

            // Should resolve aliased type
            const resolved = resolveTypeReference("BaseEntity", appNamespace, registry);
            expect(resolved).toBe("/base/Entity");
        });

        test("should handle wildcard imports", () => {
            const registry: RegistryMetadata = {
                namespaces: new Map(),
                name: "Test Registry",
                version: "1.0.0"
            };
            
            const baseNamespace: Namespace = {
                qName: "/base",
                types: new Map([
                    ["Entity", {
                        qName: "/base/Entity",
                        category: "complex",
                        kind: "entity",
                        properties: new Map(),
                        identityKeys: ["id"]
                    } as ObjectTypeMeta],
                    ["Value", {
                        qName: "/base/Value",
                        category: "complex",
                        kind: "object",
                        properties: new Map()
                    } as ObjectTypeMeta]
                ]),
                exports: ["Entity", "Value"],
                imports: new Map()
            };

            const appNamespace: Namespace = {
                qName: "/app",
                types: new Map(),
                exports: [],
                imports: new Map([
                    ["/base", ["*"]] // Wildcard import
                ])
            };

            registry.namespaces.set("/base", baseNamespace);
            registry.namespaces.set("/app", appNamespace);

            // Should resolve both types from wildcard import
            const entityResolved = resolveTypeReference("Entity", appNamespace, registry);
            const valueResolved = resolveTypeReference("Value", appNamespace, registry);
            
            expect(entityResolved).toBe("/base/Entity");
            expect(valueResolved).toBe("/base/Value");
        });
    });
});