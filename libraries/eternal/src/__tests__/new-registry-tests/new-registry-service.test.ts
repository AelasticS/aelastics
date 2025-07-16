import { RegistryService } from "../../registry/RegistryService";
import { Namespace, RegistryMetadata } from "../../registry/NamespaceMetadata";
import { TypeMeta, ObjectTypeMeta, ArrayTypeMeta, PropertyMeta } from "../../registry/TypeDefinitions";

describe("RegistryService", () => {
    let registry: RegistryMetadata;
    let service: RegistryService;

    beforeEach(() => {
        registry = {
            namespaces: new Map(),
            name: "Test Registry",
            version: "1.0.0",
            created: new Date(),
            lastModified: new Date()
        };
        service = new RegistryService(registry);
    });

    describe("Namespace Operations", () => {
        test("should import and retrieve namespace", () => {
            const namespace: Namespace = {
                qName: "/company/users",
                version: "1.0.0",
                types: new Map(),
                exports: [],
                imports: new Map()
            };

            const result = service.importNamespace(namespace);
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);

            const retrieved = service.getNamespace("/company/users");
            expect(retrieved).toEqual(namespace);
        });

        test("should list all namespaces", () => {
            const namespace1: Namespace = {
                qName: "/company/users",
                version: "1.0.0",
                types: new Map(),
                exports: [],
                imports: new Map()
            };
            const namespace2: Namespace = {
                qName: "/company/products",
                version: "1.0.0",
                types: new Map(),
                exports: [],
                imports: new Map()
            };

            service.importNamespace(namespace1);
            service.importNamespace(namespace2);

            const namespaces = service.listNamespaces();
            expect(namespaces).toContain("/company/users");
            expect(namespaces).toContain("/company/products");
        });

        test("should get child namespaces", () => {
            const parent: Namespace = {
                qName: "/company",
                version: "1.0.0",
                types: new Map(),
                exports: [],
                imports: new Map()
            };
            const child1: Namespace = {
                qName: "/company/users",
                version: "1.0.0",
                types: new Map(),
                exports: [],
                imports: new Map()
            };
            const child2: Namespace = {
                qName: "/company/products",
                version: "1.0.0",
                types: new Map(),
                exports: [],
                imports: new Map()
            };

            service.importNamespace(parent);
            service.importNamespace(child1);
            service.importNamespace(child2);

            const children = service.getChildNamespaces("/company");
            expect(children).toContain("/company/users");
            expect(children).toContain("/company/products");
            expect(children).toHaveLength(2);
        });
    });

    describe("Type Operations", () => {
        test("should store and retrieve types by qualified name", () => {
            // First create a string type in the same namespace
            const stringType: TypeMeta = {
                qName: "/company/users/String",
                category: "simple",
                kind: "string"
            };

            const userType: ObjectTypeMeta = {
                qName: "/company/users/User",
                category: "complex",
                kind: "entity",
                properties: new Map([
                    ["id", {
                        name: "id",
                        typeRef: "/company/users/String",
                        optional: false
                    }]
                ]),
                identityKeys: ["id"]
            };

            const namespace: Namespace = {
                qName: "/company/users",
                version: "1.0.0",
                types: new Map<string, TypeMeta>([["String", stringType], ["User", userType]]),
                exports: ["String", "User"],
                imports: new Map()
            };

            service.importNamespace(namespace);

            const retrieved = service.getType("/company/users/User");
            expect(retrieved).toEqual(userType);
        });

        test("should list types in namespace", () => {
            const stringType: TypeMeta = {
                qName: "/company/users/String",
                category: "simple",
                kind: "string"
            };

            const userType: ObjectTypeMeta = {
                qName: "/company/users/User",
                category: "complex",
                kind: "entity",
                properties: new Map([
                    ["id", {
                        name: "id",
                        typeRef: "/company/users/String",
                        optional: false
                    }]
                ]),
                identityKeys: ["id"]
            };

            const roleType: ObjectTypeMeta = {
                qName: "/company/users/Role",
                category: "complex",
                kind: "object",
                properties: new Map()
            };

            const namespace: Namespace = {
                qName: "/company/users",
                version: "1.0.0",
                types: new Map<string, TypeMeta>([["String", stringType], ["User", userType], ["Role", roleType]]),
                exports: ["String", "User", "Role"],
                imports: new Map()
            };

            service.importNamespace(namespace);

            const types = service.listTypesInNamespace("/company/users");
            expect(types).toContain("String");
            expect(types).toContain("User");
            expect(types).toContain("Role");
            expect(types).toHaveLength(3);
        });

        test("should get type in namespace context with imports", () => {
            // Create base namespace with User type
            const baseNamespace: Namespace = {
                qName: "/base",
                version: "1.0.0",
                types: new Map<string, TypeMeta>([
                    ["String", {
                        qName: "/base/String",
                        category: "simple",
                        kind: "string"
                    }],
                    ["User", {
                        qName: "/base/User",
                        category: "complex",
                        kind: "entity",
                        properties: new Map([
                            ["id", {
                                name: "id",
                                typeRef: "/base/String",
                                optional: false
                            }]
                        ]),
                        identityKeys: ["id"]
                    } as ObjectTypeMeta]
                ]),
                exports: ["String", "User"],
                imports: new Map()
            };

            // Create importing namespace
            const importingNamespace: Namespace = {
                qName: "/app",
                version: "1.0.0",
                types: new Map(),
                exports: [],
                imports: new Map([["/base", ["User"]]])
            };

            service.importNamespace(baseNamespace);
            service.importNamespace(importingNamespace);

            const userType = service.getTypeInNamespace("User", "/app");
            expect(userType).toBeDefined();
            expect(userType?.qName).toBe("/base/User");
        });
    });

    describe("Import/Export Validation", () => {
        test("should validate namespace imports", () => {
            const baseNamespace: Namespace = {
                qName: "/base",
                version: "1.0.0",
                types: new Map([["User", {
                    qName: "/base/User",
                    category: "complex",
                    kind: "entity",
                    properties: new Map(),
                    identityKeys: ["id"]
                } as ObjectTypeMeta]]),
                exports: ["User"],
                imports: new Map()
            };

            const invalidImportNamespace: Namespace = {
                qName: "/app",
                version: "1.0.0",
                types: new Map(),
                exports: [],
                imports: new Map([["/nonexistent", ["User"]]])
            };

            service.importNamespace(baseNamespace);
            const result = service.importNamespace(invalidImportNamespace);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Imported namespace '/nonexistent' does not exist");
        });

        test("should validate exported types exist", () => {
            const baseNamespace: Namespace = {
                qName: "/base",
                version: "1.0.0",
                types: new Map<string, TypeMeta>([
                    ["String", {
                        qName: "/base/String",
                        category: "simple",
                        kind: "string"
                    }],
                    ["User", {
                        qName: "/base/User",
                        category: "complex",
                        kind: "entity",
                        properties: new Map([
                            ["id", {
                                name: "id",
                                typeRef: "/base/String",
                                optional: false
                            }]
                        ]),
                        identityKeys: ["id"]
                    } as ObjectTypeMeta]
                ]),
                exports: ["User"],
                imports: new Map()
            };

            const invalidImportNamespace: Namespace = {
                qName: "/app",
                version: "1.0.0",
                types: new Map(),
                exports: [],
                imports: new Map([["/base", ["NonExistentType"]]])
            };

            service.importNamespace(baseNamespace);
            const result = service.importNamespace(invalidImportNamespace);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Type 'NonExistentType' is not exported by namespace '/base'");
        });

        test("should prevent duplicate namespace imports", () => {
            const namespace: Namespace = {
                qName: "/company/users",
                version: "1.0.0",
                types: new Map(),
                exports: [],
                imports: new Map()
            };

            service.importNamespace(namespace);
            const result = service.importNamespace(namespace);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Namespace '/company/users' already exists");
        });
    });

    describe("Type Validation", () => {
        test("should validate property optional flag is required", () => {
            const invalidPropertyMeta: PropertyMeta = {
                name: "email",
                typeRef: "/base/string",
                optional: undefined as any // Missing required flag
            };

            const userType: ObjectTypeMeta = {
                qName: "/company/users/User",
                category: "complex",
                kind: "entity",
                properties: new Map([["email", invalidPropertyMeta]]),
                identityKeys: ["id"]
            };

            const namespace: Namespace = {
                qName: "/company/users",
                version: "1.0.0",
                types: new Map([["User", userType]]),
                exports: ["User"],
                imports: new Map()
            };

            const result = service.importNamespace(namespace);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Property 'email' missing required 'optional' flag");
        });

        test("should validate inverse collection target types are objects", () => {
            const userType: ObjectTypeMeta = {
                qName: "/company/users/User",
                category: "complex",
                kind: "entity",
                properties: new Map(),
                identityKeys: ["id"],
                inverseCollection: new Map([["posts", {
                    propName: "author",
                    targetTypeQName: "/company/posts/Post",
                    isCollection: false
                }]])
            };

            const namespace: Namespace = {
                qName: "/company/users",
                version: "1.0.0",
                types: new Map([["User", userType]]),
                exports: ["User"],
                imports: new Map()
            };

            const result = service.importNamespace(namespace);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Inverse property 'posts' references unknown target type '/company/posts/Post'");
        });

        test("should validate entity identity keys exist as properties", () => {
            const userType: ObjectTypeMeta = {
                qName: "/company/users/User",
                category: "complex",
                kind: "entity",
                properties: new Map([["name", {
                    name: "name",
                    typeRef: "/base/string",
                    optional: false
                }]]),
                identityKeys: ["id"] // id property doesn't exist
            };

            const namespace: Namespace = {
                qName: "/company/users",
                version: "1.0.0",
                types: new Map([["User", userType]]),
                exports: ["User"],
                imports: new Map()
            };

            const result = service.importNamespace(namespace);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Identity key property 'id' not found in entity '/company/users/User'");
        });
    });

    describe("Registry Statistics", () => {
        test("should provide registry statistics", () => {
            const stringType: TypeMeta = {
                qName: "/company/users/String",
                category: "simple",
                kind: "string"
            };

            const userType: ObjectTypeMeta = {
                qName: "/company/users/User",
                category: "complex",
                kind: "entity",
                properties: new Map([
                    ["id", {
                        name: "id",
                        typeRef: "/company/users/String",
                        optional: false
                    }]
                ]),
                identityKeys: ["id"]
            };

            const arrayType: ArrayTypeMeta = {
                qName: "/company/users/UserList",
                category: "complex",
                kind: "array",
                elementType: "/company/users/User"
            };

            const namespace: Namespace = {
                qName: "/company/users",
                version: "1.0.0",
                types: new Map<string, TypeMeta>([["String", stringType], ["User", userType], ["UserList", arrayType]]),
                exports: ["String", "User", "UserList"],
                imports: new Map()
            };

            service.importNamespace(namespace);

            const stats = service.getRegistryStats();
            expect(stats.namespaceCount).toBe(1);
            expect(stats.totalTypeCount).toBe(3);
            expect(stats.typesByCategory.get("simple")).toBe(1);
            expect(stats.typesByCategory.get("complex")).toBe(2);
        });
    });
});