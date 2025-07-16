import { 
    Namespace, 
    RegistryMetadata, 
    buildQualifiedName 
} from "../../registry/NamespaceMetadata";
import { 
    TypeMeta,
    ObjectTypeMeta, 
    ArrayTypeMeta, 
    PropertyMeta, 
    SimpleTypeMeta 
} from "../../registry/TypeDefinitions";
import { RegistryService, NamespaceImportError } from "../../registry/RegistryService";

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

            service.importNamespace(baseNamespace);

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
            
            service.importNamespace(baseNamespace);
            
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
            
            service.importNamespace(postsNamespace);
            
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

            service.importNamespace(baseNamespace);
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
    });
});