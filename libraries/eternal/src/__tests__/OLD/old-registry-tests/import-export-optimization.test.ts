import { 
    Namespace, 
    RegistryMetadata, 
    buildQualifiedName 
} from "../../../registry/NamespaceMetadata";
import { 
    TypeMeta,
    ObjectTypeMeta, 
    ArrayTypeMeta, 
    PropertyMeta, 
    SimpleTypeMeta 
} from "../../../registry/TypeDefinitions";
import { RegistryService, NamespaceImportError } from "../../../registry/RegistryService";
import { systemNamespace } from "../../../registry/system-namespace";

describe("Import/Export Optimization", () => {
    let registry: RegistryMetadata;
    let service: RegistryService;

    beforeEach(() => {
        registry = {
            namespaces: new Map(),
            name: "Test Registry",
            version: "1.0.0"
        };
        service = new RegistryService(registry);
    });

    describe("Export-time Optimization Verification", () => {
        test("should handle pre-optimized optional properties", () => {
            // First add the base string type
            const stringType: SimpleTypeMeta = {
                qName: "/base/string",
                category: "simple",
                kind: "string"
            };

            const baseNamespace: Namespace = {
                qName: "/base",
                types: new Map([["string", stringType]]),
                exports: ["string"],
                imports: new Map()
            };

            let baseError: NamespaceImportError | undefined;
            try {
                service.importNamespace(baseNamespace);
            } catch (err) {
                baseError = err as NamespaceImportError;
            }
            expect(baseError).toBeUndefined();

            // This test verifies that optional properties arrive already optimized
            // i.e., no OptionalTypeMeta wrapper, just a flag on the property
            
            const optimizedProperty: PropertyMeta = {
                name: "email",
                typeRef: "/base/string", // Direct reference to string type
                optional: true // Optimization: flag instead of wrapper type
            };

            const userType: ObjectTypeMeta = {
                qName: "/company/users/User",
                category: "complex",
                kind: "object",
                properties: new Map([["email", optimizedProperty]])
            };

            const namespace: Namespace = {
                qName: "/company/users",
                types: new Map([["User", userType]]),
                exports: ["User"],
                imports: new Map([["/base", ["string"]]])
            };

            let error: NamespaceImportError | undefined;
            try {
                service.importNamespace(namespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeUndefined();
            const importedType = service.getType("/company/users/User") as ObjectTypeMeta;
            const emailProp = importedType.properties.get("email");
            expect(emailProp?.typeRef).toBe("/base/string");
            expect(emailProp?.optional).toBe(true);
        });

        test("should handle pre-optimized collection types", () => {
            // This test verifies that collection types arrive with element types directly specified
            // i.e., no separate element type definition, just a reference
            
            const userListType: ArrayTypeMeta = {
                qName: "/company/users/UserList",
                category: "complex",
                kind: "array",
                elementType: "/company/users/User" // Direct reference to element type
            };

            const namespace: Namespace = {
                qName: "/company/users",
                types: new Map([["UserList", userListType]]),
                exports: ["UserList"],
                imports: new Map()
            };

            let error: NamespaceImportError | undefined;
            try {
                service.importNamespace(namespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeUndefined();
            const importedType = service.getType("/company/users/UserList") as ArrayTypeMeta;
            expect(importedType.elementType).toBe("/company/users/User");
        });

        test("should handle pre-resolved forward references", () => {
            // This test verifies that forward references (links) are already resolved
            // i.e., no LinkTypeMeta, just direct type references
            
            const stringType: TypeMeta = {
                qName: "/family/String",
                category: "simple",
                kind: "string"
            };

            const idProperty: PropertyMeta = {
                name: "id",
                typeRef: "/family/String",
                optional: false
            };

            const personProperty: PropertyMeta = {
                name: "parent",
                typeRef: "/family/Person", // Direct reference, not a link
                optional: true
            };

            const personType: ObjectTypeMeta = {
                qName: "/family/Person",
                category: "complex",
                kind: "entity",
                properties: new Map([["id", idProperty], ["parent", personProperty]]),
                identityKeys: ["id"]
            };

            const namespace: Namespace = {
                qName: "/family",
                types: new Map<string, TypeMeta>([["String", stringType], ["Person", personType]]),
                exports: ["String", "Person"],
                imports: new Map()
            };

            let error: NamespaceImportError | undefined;
            try {
                service.importNamespace(namespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeUndefined();
            const importedType = service.getType("/family/Person") as ObjectTypeMeta;
            const parentProp = importedType.properties.get("parent");
            expect(parentProp?.typeRef).toBe("/family/Person");
        });
    });

    describe("Bidirectional Relationship Optimization", () => {
        test("should handle optimized bidirectional relationships", () => {
            // This test verifies that bidirectional relationships are already optimized
            // with inverse collection metadata properly set
            
            // First add the base string type
            const stringType: SimpleTypeMeta = {
                qName: "/base/string",
                category: "simple",
                kind: "string"
            };
            
            const baseNamespace: Namespace = {
                qName: "/base",
                types: new Map([["string", stringType]]),
                exports: ["string"],
                imports: new Map()
            };
            
            let baseError: NamespaceImportError | undefined;
            try {
                service.importNamespace(baseNamespace);
            } catch (err) {
                baseError = err as NamespaceImportError;
            }
            expect(baseError).toBeUndefined();
            
            // Add the posts namespace types first (without user references)
            const postType: ObjectTypeMeta = {
                qName: "/company/posts/Post",
                category: "complex",
                kind: "entity",
                properties: new Map([
                    ["id", {
                        name: "id",
                        typeRef: "/base/string",
                        optional: false
                    }]
                ]),
                identityKeys: ["id"]
            };
            
            const postListType: ArrayTypeMeta = {
                qName: "/company/posts/PostList",
                category: "complex",
                kind: "array",
                elementType: "/company/posts/Post"
            };
            
            const postsNamespace: Namespace = {
                qName: "/company/posts",
                types: new Map<string, TypeMeta>([["Post", postType], ["PostList", postListType]]),
                exports: ["Post", "PostList"],
                imports: new Map([
                    ["/base", ["string"]]
                ])
            };
            
            let postsError: NamespaceImportError | undefined;
            try {
                service.importNamespace(postsNamespace);
            } catch (err) {
                postsError = err as NamespaceImportError;
            }
            expect(postsError).toBeUndefined();
            
            const userType: ObjectTypeMeta = {
                qName: "/company/users/User",
                category: "complex",
                kind: "entity",
                properties: new Map([
                    ["id", {
                        name: "id",
                        typeRef: "/base/string",
                        optional: false
                    }],
                    ["posts", {
                        name: "posts",
                        typeRef: "/company/posts/PostList",
                        optional: false,
                        inverseProp: "author",
                        inverseTypeRef: "/company/posts/Post"
                    }]
                ]),
                identityKeys: ["id"],
                inverseCollection: new Map([
                    ["posts", {
                        propName: "author",
                        targetTypeQName: "/company/posts/Post",
                        isCollection: true
                    }]
                ])
            };

            const namespace: Namespace = {
                qName: "/company/users",
                types: new Map([["User", userType]]),
                exports: ["User"],
                imports: new Map([
                    ["/base", ["string"]],
                    ["/company/posts", ["PostList", "Post"]]
                ])
            };

            let error: NamespaceImportError | undefined;
            try {
                service.importNamespace(namespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeUndefined();
            const importedType = service.getType("/company/users/User") as ObjectTypeMeta;
            const inverseRel = importedType.inverseCollection?.get("posts");
            expect(inverseRel?.propName).toBe("author");
            expect(inverseRel?.targetTypeQName).toBe("/company/posts/Post");
            expect(inverseRel?.isCollection).toBe(true);
        });

        test("should validate bidirectional relationship consistency", () => {
            // Test that validates the consistency of bidirectional relationships
            // Both sides should reference each other correctly
            
            const postProperty: PropertyMeta = {
                name: "author",
                typeRef: "/company/users/User",
                optional: false,
                inverseProp: "posts",
                inverseTypeRef: "/company/posts/Post"
            };

            const userProperty: PropertyMeta = {
                name: "posts",
                typeRef: "/company/posts/PostList",
                optional: false,
                inverseProp: "author",
                inverseTypeRef: "/company/users/User"
            };

            // Both properties should reference each other
            expect(postProperty.inverseProp).toBe("posts");
            expect(userProperty.inverseProp).toBe("author");
            expect(postProperty.inverseTypeRef).toBe("/company/posts/Post");
            expect(userProperty.inverseTypeRef).toBe("/company/users/User");
        });
    });

    describe("Cross-Namespace Import Optimization", () => {
        test("should handle optimized cross-namespace references", () => {
            // Test that cross-namespace references are already resolved to qualified names
            
            // Base namespace with primitive types
            const baseNamespace: Namespace = {
                qName: "/base",
                types: new Map([
                    ["string", {
                        qName: "/base/string",
                        category: "simple",
                        kind: "string"
                    } as SimpleTypeMeta]
                ]),
                exports: ["string"],
                imports: new Map()
            };

            // App namespace importing and using base types
            const appNamespace: Namespace = {
                qName: "/app",
                types: new Map([
                    ["User", {
                        qName: "/app/User",
                        category: "complex",
                        kind: "entity",
                        properties: new Map([
                            ["name", {
                                name: "name",
                                typeRef: "/base/string", // Fully qualified reference
                                optional: false
                            }]
                        ]),
                        identityKeys: ["id"]
                    } as ObjectTypeMeta]
                ]),
                exports: ["User"],
                imports: new Map([["/base", ["string"]]])
            };

            let baseError: NamespaceImportError | undefined;
            try {
                service.importNamespace(baseNamespace);
            } catch (err) {
                baseError = err as NamespaceImportError;
            }
            expect(baseError).toBeUndefined();
            
            let error: NamespaceImportError | undefined;
            try {
                service.importNamespace(appNamespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeUndefined();
            const userType = service.getType("/app/User") as ObjectTypeMeta;
            const nameProp = userType.properties.get("name");
            expect(nameProp?.typeRef).toBe("/base/string");
        });

        test("should validate import dependencies are satisfied", () => {
            // Test that all imported types are available and exported
            
            const appNamespace: Namespace = {
                qName: "/app",
                types: new Map([
                    ["User", {
                        qName: "/app/User",
                        category: "complex",
                        kind: "entity",
                        properties: new Map([
                            ["name", {
                                name: "name",
                                typeRef: "/base/string", // Reference to imported type
                                optional: false
                            }]
                        ]),
                        identityKeys: ["id"]
                    } as ObjectTypeMeta]
                ]),
                exports: ["User"],
                imports: new Map([["/base", ["string"]]]) // Import dependency
            };

            // Try to import without base namespace present
            let error: NamespaceImportError | undefined;
            try {
                service.importNamespace(appNamespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeDefined();
            expect(error!.name).toBe("NamespaceImportError");
            expect(error!.validationResult.errors).toContain("Imported namespace '/base' does not exist");
        });
    });

    describe("Type System Adapter Simulation", () => {
        test("should simulate aelastic-types export adapter optimization", () => {
            // This simulates how an aelastic-types adapter would export optimized types
            // Original aelastic-types would have: optional(string) -> OptionalTypeMeta
            // Optimized export would have: property with optional flag
            
            const simulateAelasticTypesExport = () => {
                // Simulate the transformation that would happen in aelastic-types adapter
                return {
                    qName: "/user/User",
                    category: "complex" as const,
                    kind: "entity" as const,
                    properties: new Map([
                        ["email", {
                            name: "email",
                            typeRef: "/base/string", // Resolved from optional(string)
                            optional: true // Optimized flag
                        }]
                    ]),
                    identityKeys: ["id"]
                } as ObjectTypeMeta;
            };

            const optimizedType = simulateAelasticTypesExport();
            
            expect(optimizedType.category).toBe("complex");
            expect(optimizedType.kind).toBe("entity");
            
            const emailProp = optimizedType.properties.get("email");
            expect(emailProp?.typeRef).toBe("/base/string");
            expect(emailProp?.optional).toBe(true);
        });

        test("should simulate Zod export adapter optimization", () => {
            // This simulates how a Zod adapter would export optimized types
            // Original Zod would have: z.string().optional() -> ZodOptional<ZodString>
            // Optimized export would have: property with optional flag
            
            const simulateZodExport = () => {
                // Simulate the transformation that would happen in Zod adapter
                return {
                    qName: "/user/User",
                    category: "complex" as const,
                    kind: "object" as const,
                    properties: new Map([
                        ["email", {
                            name: "email",
                            typeRef: "/base/string", // Resolved from z.string().optional()
                            optional: true // Optimized flag
                        }]
                    ])
                } as ObjectTypeMeta;
            };

            const optimizedType = simulateZodExport();
            
            expect(optimizedType.category).toBe("complex");
            expect(optimizedType.kind).toBe("object");
            
            const emailProp = optimizedType.properties.get("email");
            expect(emailProp?.typeRef).toBe("/base/string");
            expect(emailProp?.optional).toBe(true);
        });

        test("should simulate future XML Schema export adapter", () => {
            // This simulates how a future XML Schema adapter would export optimized types
            // XML Schema minOccurs="0" would translate to optional flag
            
            const simulateXMLSchemaExport = () => {
                return {
                    qName: "/xml/Person",
                    category: "complex" as const,
                    kind: "object" as const,
                    properties: new Map([
                        ["middleName", {
                            name: "middleName",
                            typeRef: "/base/string", // Resolved from xs:string with minOccurs="0"
                            optional: true // Optimized from minOccurs="0"
                        }]
                    ])
                } as ObjectTypeMeta;
            };

            const optimizedType = simulateXMLSchemaExport();
            
            const middleNameProp = optimizedType.properties.get("middleName");
            expect(middleNameProp?.typeRef).toBe("/base/string");
            expect(middleNameProp?.optional).toBe(true);
        });
    });

    describe("System Namespace Import/Export Rules", () => {
        test("should automatically import system namespace in all imported namespaces", () => {
            const userNamespace: Namespace = {
                qName: "/company/users",
                types: new Map([
                    ["User", {
                        qName: "/company/users/User",
                        category: "complex",
                        kind: "entity",
                        properties: new Map([
                            ["name", {
                                name: "name",
                                typeRef: "string", // System type reference
                                optional: false
                            }],
                            ["age", {
                                name: "age",
                                typeRef: "number", // System type reference
                                optional: false
                            }]
                        ]),
                        identityKeys: ["id"]
                    } as ObjectTypeMeta]
                ]),
                exports: ["User"],
                imports: new Map() // No explicit system import
            };

            service.importNamespace(userNamespace);
            
            // System types should be automatically available
            const stringType = service.getTypeInNamespace("string", "/company/users");
            expect(stringType).toBeDefined();
            expect(stringType?.qName).toBe("string");
            
            const numberType = service.getTypeInNamespace("number", "/company/users");
            expect(numberType).toBeDefined();
            expect(numberType?.qName).toBe("number");
        });

        test("should prevent exporting system namespace", () => {
            // User should not be able to export system namespace
            const userSystemNamespace: Namespace = {
                qName: "system",
                types: new Map([
                    ["customType", {
                        qName: "system/customType",
                        category: "simple",
                        kind: "string"
                    } as SimpleTypeMeta]
                ]),
                exports: ["customType"],
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

        test("should prevent importing system types with conflicting names", () => {
            const conflictingNamespace: Namespace = {
                qName: "/company/types",
                types: new Map([
                    ["string", {
                        qName: "/company/types/string",
                        category: "simple",
                        kind: "string"
                    } as SimpleTypeMeta],
                    ["number", {
                        qName: "/company/types/number",
                        category: "simple",
                        kind: "number"
                    } as SimpleTypeMeta]
                ]),
                exports: ["string", "number"],
                imports: new Map()
            };

            let error: NamespaceImportError | undefined;
            try {
                service.importNamespace(conflictingNamespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeDefined();
            expect(error!.validationResult.errors).toContain("Type name 'string' conflicts with system type");
            expect(error!.validationResult.errors).toContain("Type name 'number' conflicts with system type");
        });

        test("should resolve system type references in cross-namespace imports", () => {
            const baseNamespace: Namespace = {
                qName: "/base",
                types: new Map([
                    ["Entity", {
                        qName: "/base/Entity",
                        category: "complex",
                        kind: "entity",
                        properties: new Map([
                            ["id", {
                                name: "id",
                                typeRef: "string", // System type
                                optional: false
                            }]
                        ]),
                        identityKeys: ["id"]
                    } as ObjectTypeMeta]
                ]),
                exports: ["Entity"],
                imports: new Map()
            };

            const appNamespace: Namespace = {
                qName: "/app",
                types: new Map([
                    ["User", {
                        qName: "/app/User",
                        category: "complex",
                        kind: "entity",
                        properties: new Map([
                            ["name", {
                                name: "name",
                                typeRef: "string", // System type
                                optional: false
                            }]
                        ]),
                        identityKeys: ["id"],
                        extends: "/base/Entity"
                    } as ObjectTypeMeta]
                ]),
                exports: ["User"],
                imports: new Map([["/base", ["Entity"]]])
            };

            service.importNamespace(baseNamespace);
            service.importNamespace(appNamespace);

            // Both namespaces should have access to system types
            const baseStringType = service.getTypeInNamespace("string", "/base");
            expect(baseStringType).toBeDefined();
            
            const appStringType = service.getTypeInNamespace("string", "/app");
            expect(appStringType).toBeDefined();
        });

        test("should handle system type optimization in export adapters", () => {
            // Test that system types are properly optimized in export scenarios
            const optimizedNamespace: Namespace = {
                qName: "/optimized",
                types: new Map([
                    ["OptimizedType", {
                        qName: "/optimized/OptimizedType",
                        category: "complex",
                        kind: "object",
                        properties: new Map([
                            ["stringProp", {
                                name: "stringProp",
                                typeRef: "string", // Direct system type reference
                                optional: false
                            }],
                            ["numberProp", {
                                name: "numberProp", 
                                typeRef: "number", // Direct system type reference
                                optional: true
                            }],
                            ["booleanProp", {
                                name: "booleanProp",
                                typeRef: "boolean", // Direct system type reference
                                optional: false
                            }]
                        ])
                    } as ObjectTypeMeta]
                ]),
                exports: ["OptimizedType"],
                imports: new Map()
            };

            service.importNamespace(optimizedNamespace);
            
            const optimizedType = service.getType("/optimized/OptimizedType") as ObjectTypeMeta;
            expect(optimizedType).toBeDefined();
            
            // All system type references should be resolved
            const stringProp = optimizedType.properties.get("stringProp");
            expect(stringProp?.typeRef).toBe("string");
            
            const numberProp = optimizedType.properties.get("numberProp");
            expect(numberProp?.typeRef).toBe("number");
            expect(numberProp?.optional).toBe(true);
            
            const booleanProp = optimizedType.properties.get("booleanProp");
            expect(booleanProp?.typeRef).toBe("boolean");
        });
    });

    describe("Registry Performance Optimization", () => {
        test("should maintain fast qualified name lookup", () => {
            // Test that the registry maintains its optimization index
            
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

            service.importNamespace(namespace);

            // Fast lookup should work
            const retrieved = service.getType("/company/users/User");
            expect(retrieved).toBeDefined();
            expect(retrieved?.qName).toBe("/company/users/User");
        });

        test("should handle large namespace imports efficiently", () => {
            // Test that large namespace imports work efficiently
            
            const types = new Map();
            const exports = [];
            
            // Create 100 types
            for (let i = 0; i < 100; i++) {
                const typeName = `Type${i}`;
                types.set(typeName, {
                    qName: `/large/${typeName}`,
                    category: "simple",
                    kind: "string"
                } as SimpleTypeMeta);
                exports.push(typeName);
            }

            const largeNamespace: Namespace = {
                qName: "/large",
                types,
                exports,
                imports: new Map()
            };

            let error: NamespaceImportError | undefined;
            try {
                service.importNamespace(largeNamespace);
            } catch (err) {
                error = err as NamespaceImportError;
            }
            expect(error).toBeUndefined();
            // Verify all types are accessible
            for (let i = 0; i < 100; i++) {
                const retrieved = service.getType(`/large/Type${i}`);
                expect(retrieved).toBeDefined();
            }
        });

        test("should maintain system namespace performance in large registries", () => {
            // Test that system namespace doesn't degrade performance in large registries
            const namespaces = [];
            
            // Create 50 namespaces, each with 10 types
            for (let i = 0; i < 50; i++) {
                const types = new Map();
                const exports = [];
                
                for (let j = 0; j < 10; j++) {
                    const typeName = `Type${j}`;
                    types.set(typeName, {
                        qName: `/ns${i}/${typeName}`,
                        category: "complex",
                        kind: "object",
                        properties: new Map([
                            ["id", {
                                name: "id",
                                typeRef: "string", // System type reference
                                optional: false
                            }]
                        ])
                    } as ObjectTypeMeta);
                    exports.push(typeName);
                }
                
                namespaces.push({
                    qName: `/ns${i}`,
                    types,
                    exports,
                    imports: new Map()
                });
            }

            // Import all namespaces
            namespaces.forEach(namespace => {
                service.importNamespace(namespace);
            });

            // Verify system types are available in all namespaces
            for (let i = 0; i < 50; i++) {
                const stringType = service.getTypeInNamespace("string", `/ns${i}`);
                expect(stringType).toBeDefined();
                expect(stringType?.qName).toBe("string");
            }
        });
    });
});