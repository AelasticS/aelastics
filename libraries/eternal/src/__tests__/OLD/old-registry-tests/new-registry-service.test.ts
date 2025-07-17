import { RegistryService } from "../../../registry/RegistryService";
import { Namespace, RegistryMetadata } from "../../../registry/NamespaceMetadata";
import { TypeMeta, ObjectTypeMeta, ArrayTypeMeta, PropertyMeta, SimpleTypeMeta } from "../../../registry/TypeDefinitions";
import { NamespaceImportError } from "../../../registry/RegistryService";
import { systemNamespace } from "../../../registry/system-namespace";

describe("RegistryService", () => {1
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

            let errorCaught = false;
            try {
                service.importNamespace(namespace);
            } catch (err) {
                errorCaught = true;
            }
            expect(errorCaught).toBe(false);

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

            let error: NamespaceImportError | undefined;
            try {
                service.importNamespace(namespace1);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeUndefined();

            try {
                service.importNamespace(namespace2);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeUndefined();

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

            let error: NamespaceImportError | undefined;
            try {
                service.importNamespace(parent);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeUndefined();

            try {
                service.importNamespace(child1);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeUndefined();

            try {
                service.importNamespace(child2);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeUndefined();

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

            let error: NamespaceImportError | undefined;
            try {
                service.importNamespace(namespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeUndefined();

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

            let error: NamespaceImportError | undefined;
            try {
                service.importNamespace(namespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeUndefined();

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

            let error: NamespaceImportError | undefined;
            try {
                service.importNamespace(baseNamespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeUndefined();

            try {
                service.importNamespace(importingNamespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeUndefined();

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

            let error: NamespaceImportError | undefined;
            try {
                service.importNamespace(baseNamespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeUndefined();
            try {
                service.importNamespace(invalidImportNamespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeDefined();
            expect(error!.name).toBe("NamespaceImportError");
            expect(error!.validationResult.errors).toContain("Imported namespace '/nonexistent' does not exist");
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

            let error: NamespaceImportError | undefined;
            try {
                service.importNamespace(baseNamespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeUndefined();
            try {
                service.importNamespace(invalidImportNamespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeDefined();
            expect(error!.name).toBe("NamespaceImportError");
            expect(error!.validationResult.errors).toContain("Type 'NonExistentType' is not exported by namespace '/base'");
        });

        test("should prevent duplicate namespace imports", () => {
            const namespace: Namespace = {
                qName: "/company/users",
                version: "1.0.0",
                types: new Map(),
                exports: [],
                imports: new Map()
            };

            let error: NamespaceImportError | undefined;
            try {
                service.importNamespace(namespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeUndefined();
            
            error = undefined;
            try {
                service.importNamespace(namespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeDefined();
            expect(error!.name).toBe("NamespaceImportError");
            expect(error!.validationResult.errors).toContain("Namespace '/company/users' already exists");
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

            let error: NamespaceImportError | undefined;
            try {
                service.importNamespace(namespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeDefined();
            expect(error!.name).toBe("NamespaceImportError");
            expect(error!.validationResult.errors).toContain("Property 'email' missing required 'optional' flag");
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

            let error: NamespaceImportError | undefined;
            try {
                service.importNamespace(namespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeDefined();
            expect(error!.name).toBe("NamespaceImportError");
            expect(error!.validationResult.errors).toContain("Inverse property 'posts' references unknown target type '/company/posts/Post'");
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

            let error: NamespaceImportError | undefined;
            try {
                service.importNamespace(namespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeDefined();
            expect(error!.name).toBe("NamespaceImportError");
            expect(error!.validationResult.errors).toContain("Identity key property 'id' not found in entity '/company/users/User'");
        });
    });

    describe("System Namespace Rules", () => {
        test("should always have system namespace present in registry", () => {
            expect(service.hasNamespace("system")).toBe(true);
            const sysNamespace = service.getNamespace("system");
            expect(sysNamespace).toBeDefined();
            expect(sysNamespace?.qName).toBe("system");
        });

        test("should prevent creating namespace named 'system'", () => {
            const userSystemNamespace: Namespace = {
                qName: "system",
                version: "1.0.0",
                types: new Map(),
                exports: [],
                imports: new Map()
            };

            let error: NamespaceImportError | undefined;
            try {
                service.importNamespace(userSystemNamespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeDefined();
            expect(error!.validationResult.errors).toContain("Namespace 'system' is reserved for system types");
        });

        test("should prevent redefining system type names", () => {
            const namespaceWithSystemTypeNames: Namespace = {
                qName: "/company/users",
                version: "1.0.0",
                types: new Map([
                    ["string", {
                        qName: "/company/users/string",
                        category: "simple",
                        kind: "string"
                    }],
                    ["number", {
                        qName: "/company/users/number",
                        category: "simple",
                        kind: "number"
                    }]
                ]),
                exports: ["string", "number"],
                imports: new Map()
            };

            let error: NamespaceImportError | undefined;
            try {
                service.importNamespace(namespaceWithSystemTypeNames);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeDefined();
            expect(error!.validationResult.errors).toContain("Type name 'string' conflicts with system type");
            expect(error!.validationResult.errors).toContain("Type name 'number' conflicts with system type");
        });

        test("should automatically import system namespace when importing any namespace", () => {
            const userNamespace: Namespace = {
                qName: "/company/users",
                version: "1.0.0",
                types: new Map([
                    ["User", {
                        qName: "/company/users/User",
                        category: "complex",
                        kind: "entity",
                        properties: new Map([
                            ["id", {
                                name: "id",
                                typeRef: "string", // Should resolve to system/string
                                optional: false
                            }]
                        ]),
                        identityKeys: ["id"]
                    } as ObjectTypeMeta]
                ]),
                exports: ["User"],
                imports: new Map()
            };

            let error: NamespaceImportError | undefined;
            try {
                service.importNamespace(userNamespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeUndefined();
            
            // System types should be available by simple name
            const stringType = service.getTypeInNamespace("string", "/company/users");
            expect(stringType).toBeDefined();
            expect(stringType?.qName).toBe("string");
            
            const numberType = service.getTypeInNamespace("number", "/company/users");
            expect(numberType).toBeDefined();
            expect(numberType?.qName).toBe("number");
        });

        test("should resolve system types by simple name in any namespace", () => {
            const userNamespace: Namespace = {
                qName: "/company/users",
                version: "1.0.0",
                types: new Map(),
                exports: [],
                imports: new Map()
            };

            let error: NamespaceImportError | undefined;
            try {
                service.importNamespace(userNamespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeUndefined();
            
            // All system types should be available by simple name
            const availableTypes = service.getAvailableTypesInNamespace("/company/users");
            expect(availableTypes.has("string")).toBe(true);
            expect(availableTypes.has("number")).toBe(true);
            expect(availableTypes.has("boolean")).toBe(true);
            expect(availableTypes.has("date")).toBe(true);
        });
    });

    describe("Path Resolution Rules", () => {
        test("should resolve absolute paths starting with /", () => {
            const baseNamespace: Namespace = {
                qName: "/base",
                version: "1.0.0",
                types: new Map<string, TypeMeta>([
                    ["User", {
                        qName: "/base/User",
                        category: "complex",
                        kind: "entity",
                        properties: new Map([
                            ["id", {
                                name: "id",
                                typeRef: "/base/String", // Absolute path
                                optional: false
                            }]
                        ]),
                        identityKeys: ["id"]
                    } as ObjectTypeMeta],
                    ["String", {
                        qName: "/base/String",
                        category: "simple",
                        kind: "string"
                    } as SimpleTypeMeta]
                ]),
                exports: ["User", "String"],
                imports: new Map()
            };

            let error: NamespaceImportError | undefined;
            try {
                service.importNamespace(baseNamespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeUndefined();

            const userType = service.getType("/base/User");
            expect(userType).toBeDefined();
            expect(userType?.qName).toBe("/base/User");
        });

        test("should resolve relative paths within namespace", () => {
            const userNamespace: Namespace = {
                qName: "/company/users",
                version: "1.0.0",
                types: new Map([
                    ["User", {
                        qName: "/company/users/User",
                        category: "complex",
                        kind: "entity",
                        properties: new Map([
                            ["profile", {
                                name: "profile",
                                typeRef: "Profile", // Relative path
                                optional: false
                            }]
                        ]),
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

            let error: NamespaceImportError | undefined;
            try {
                service.importNamespace(userNamespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeUndefined();

            const userType = service.getType("/company/users/User");
            expect(userType).toBeDefined();
        });

        test("should resolve parent paths with ..", () => {
            const companyNamespace: Namespace = {
                qName: "/company",
                version: "1.0.0",
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

            const userNamespace: Namespace = {
                qName: "/company/users",
                version: "1.0.0",
                types: new Map([
                    ["User", {
                        qName: "/company/users/User",
                        category: "complex",
                        kind: "entity",
                        properties: new Map([
                            ["company", {
                                name: "company",
                                typeRef: "../Company", // Parent path
                                optional: false
                            }]
                        ]),
                        identityKeys: ["id"]
                    } as ObjectTypeMeta]
                ]),
                exports: ["User"],
                imports: new Map()
            };

            let error: NamespaceImportError | undefined;
            try {
                service.importNamespace(companyNamespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeUndefined();

            // This should work when parent path resolution is implemented
            try {
                service.importNamespace(userNamespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeUndefined();
        });

        test("should resolve sub-namespace paths", () => {
            const departmentNamespace: Namespace = {
                qName: "/company/department",
                version: "1.0.0",
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

            const companyNamespace: Namespace = {
                qName: "/company",
                version: "1.0.0",
                types: new Map([
                    ["Company", {
                        qName: "/company/Company",
                        category: "complex",
                        kind: "entity",
                        properties: new Map([
                            ["manager", {
                                name: "manager",
                                typeRef: "department/Manager", // Sub-namespace path
                                optional: false
                            }]
                        ]),
                        identityKeys: ["id"]
                    } as ObjectTypeMeta]
                ]),
                exports: ["Company"],
                imports: new Map()
            };

            let error: NamespaceImportError | undefined;
            try {
                service.importNamespace(departmentNamespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeUndefined();

            // This should work when sub-namespace path resolution is implemented
            try {
                service.importNamespace(companyNamespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeUndefined();
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

            let error: NamespaceImportError | undefined;
            try {
                service.importNamespace(namespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeUndefined();

            const stats = service.getRegistryStats();
            expect(stats.namespaceCount).toBe(1);
            expect(stats.totalTypeCount).toBe(3);
            expect(stats.typesByCategory.get("simple")).toBe(1);
            expect(stats.typesByCategory.get("complex")).toBe(2);
        });

        test("should count system namespace types in statistics", () => {
            const stats = service.getRegistryStats();
            expect(stats.namespaceCount).toBeGreaterThanOrEqual(1); // At least system namespace
            expect(stats.totalTypeCount).toBeGreaterThanOrEqual(7); // At least system types
            expect(stats.typesByCategory.get("simple")).toBeGreaterThanOrEqual(7); // System types are simple
        });
    });
});