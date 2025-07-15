import { 
    Namespace, 
    RegistryMetadata,
    getLocalName,
    getNamespacePath,
    buildQualifiedName,
    isSubNamespace,
    getAvailableTypes,
    resolveTypeReference
} from "../../registry/NamespaceMetadata";
import { ObjectTypeMeta } from "../../registry/TypeDefinitions";

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
    });
});