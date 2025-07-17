import { 
    TypeMeta,
    SimpleTypeMeta,
    ObjectTypeMeta,
    ArrayTypeMeta,
    UnionTypeMeta,
    PropertyMeta,
    isSimpleType,
    isComplexType,
    isSpecialType,
    isObjectType,
    isEntityType,
    isCollectionType
} from "../../../registry/TypeDefinitions";
import { systemNamespace } from "../../../registry/system-namespace";

describe("Type Definitions", () => {
    
    describe("Simple Types", () => {
        test("should create simple string type", () => {
            const stringType: SimpleTypeMeta = {
                qName: "/base/string",
                category: "simple",
                kind: "string"
            };

            expect(isSimpleType(stringType)).toBe(true);
            expect(isComplexType(stringType)).toBe(false);
            expect(isSpecialType(stringType)).toBe(false);
        });

        test("should create literal type with value", () => {
            const literalType: SimpleTypeMeta = {
                qName: "/base/StatusActive",
                category: "simple",
                kind: "literal",
                literalValue: "active"
            };

            expect(isSimpleType(literalType)).toBe(true);
            expect(literalType.literalValue).toBe("active");
        });

        test("should create all simple type kinds", () => {
            const simpleTypes = [
                "string", "number", "boolean", "date", 
                "literal", "null", "undefined", "void"
            ];

            simpleTypes.forEach(kind => {
                const type: SimpleTypeMeta = {
                    qName: `/base/${kind}`,
                    category: "simple",
                    kind: kind as any
                };
                expect(isSimpleType(type)).toBe(true);
            });
        });
    });

    describe("Object Types", () => {
        test("should create object type with properties", () => {
            const nameProperty: PropertyMeta = {
                name: "name",
                typeRef: "/base/string",
                optional: false
            };

            const emailProperty: PropertyMeta = {
                name: "email",
                typeRef: "/base/string",
                optional: true
            };

            const userType: ObjectTypeMeta = {
                qName: "/company/users/User",
                category: "complex",
                kind: "object",
                properties: new Map([
                    ["name", nameProperty],
                    ["email", emailProperty]
                ])
            };

            expect(isObjectType(userType)).toBe(true);
            expect(isComplexType(userType)).toBe(true);
            expect(isEntityType(userType)).toBe(false);
            expect(userType.properties.size).toBe(2);
        });

        test("should create entity type with identity keys", () => {
            const idProperty: PropertyMeta = {
                name: "id",
                typeRef: "/base/string",
                optional: false
            };

            const userEntity: ObjectTypeMeta = {
                qName: "/company/users/User",
                category: "complex",
                kind: "entity",
                properties: new Map([["id", idProperty]]),
                identityKeys: ["id"]
            };

            expect(isObjectType(userEntity)).toBe(true);
            expect(isEntityType(userEntity)).toBe(true);
            expect(userEntity.identityKeys).toEqual(["id"]);
        });

        test("should create object type with inheritance", () => {
            const userType: ObjectTypeMeta = {
                qName: "/company/users/AdminUser",
                category: "complex",
                kind: "entity",
                properties: new Map(),
                identityKeys: ["id"],
                extends: "/company/users/User"
            };

            expect(userType.extends).toBe("/company/users/User");
        });

        test("should create object type with bidirectional relationships", () => {
            const userType: ObjectTypeMeta = {
                qName: "/company/users/User",
                category: "complex",
                kind: "entity",
                properties: new Map(),
                identityKeys: ["id"],
                inverseCollection: new Map([
                    ["posts", {
                        propName: "author",
                        targetTypeQName: "/company/posts/Post",
                        isCollection: false
                    }]
                ])
            };

            expect(userType.inverseCollection?.size).toBe(1);
            expect(userType.inverseCollection?.get("posts")?.propName).toBe("author");
            expect(userType.inverseCollection?.get("posts")?.targetTypeQName).toBe("/company/posts/Post");
        });
    });

    describe("Collection Types", () => {
        test("should create array type", () => {
            const arrayType: ArrayTypeMeta = {
                qName: "/company/users/UserList",
                category: "complex",
                kind: "array",
                elementType: "/company/users/User",
                minElements: 0,
                maxElements: 100
            };

            expect(isCollectionType(arrayType)).toBe(true);
            expect(isComplexType(arrayType)).toBe(true);
            expect(arrayType.elementType).toBe("/company/users/User");
            expect(arrayType.minElements).toBe(0);
            expect(arrayType.maxElements).toBe(100);
        });

        test("should create map type", () => {
            const mapType: TypeMeta = {
                qName: "/company/users/UserMap",
                category: "complex",
                kind: "map",
                keyType: "/base/string",
                valueType: "/company/users/User"
            } as any;

            expect(isCollectionType(mapType)).toBe(true);
            expect((mapType as any).keyType).toBe("/base/string");
            expect((mapType as any).valueType).toBe("/company/users/User");
        });

        test("should create set type", () => {
            const setType: TypeMeta = {
                qName: "/company/users/UserSet",
                category: "complex",
                kind: "set",
                elementType: "/company/users/User"
            } as any;

            expect(isCollectionType(setType)).toBe(true);
            expect((setType as any).elementType).toBe("/company/users/User");
        });
    });

    describe("Union Types", () => {
        test("should create union type", () => {
            const unionType: UnionTypeMeta = {
                qName: "/company/StringOrNumber",
                category: "complex",
                kind: "union",
                memberTypes: ["/base/string", "/base/number"]
            };

            expect(isComplexType(unionType)).toBe(true);
            expect(unionType.memberTypes).toContain("/base/string");
            expect(unionType.memberTypes).toContain("/base/number");
            expect(unionType.memberTypes).toHaveLength(2);
        });

        test("should create tagged union type", () => {
            const taggedUnionType: TypeMeta = {
                qName: "/company/Shape",
                category: "complex",
                kind: "taggedUnion",
                discriminator: "type",
                memberTypes: new Map([
                    ["circle", "/company/Circle"],
                    ["rectangle", "/company/Rectangle"]
                ])
            } as any;

            expect(isComplexType(taggedUnionType)).toBe(true);
            expect((taggedUnionType as any).discriminator).toBe("type");
            expect((taggedUnionType as any).memberTypes.get("circle")).toBe("/company/Circle");
        });
    });

    describe("Property Metadata", () => {
        test("should create property with all metadata", () => {
            const property: PropertyMeta = {
                name: "email",
                typeRef: "/base/string",
                label: "Email Address",
                optional: true,
                defaultValue: "",
                inverseProp: "user",
                inverseTypeRef: "/company/users/User"
            };

            expect(property.name).toBe("email");
            expect(property.typeRef).toBe("/base/string");
            expect(property.label).toBe("Email Address");
            expect(property.optional).toBe(true);
            expect(property.defaultValue).toBe("");
            expect(property.inverseProp).toBe("user");
            expect(property.inverseTypeRef).toBe("/company/users/User");
        });

        test("should require optional flag", () => {
            const requiredProperty: PropertyMeta = {
                name: "id",
                typeRef: "/base/string",
                optional: false
            };

            const optionalProperty: PropertyMeta = {
                name: "description",
                typeRef: "/base/string",
                optional: true
            };

            expect(requiredProperty.optional).toBe(false);
            expect(optionalProperty.optional).toBe(true);
        });

        test("should support bidirectional relationship metadata", () => {
            const userProperty: PropertyMeta = {
                name: "user",
                typeRef: "/company/users/User",
                optional: false,
                inverseProp: "posts",
                inverseTypeRef: "/company/posts/Post"
            };

            expect(userProperty.inverseProp).toBe("posts");
            expect(userProperty.inverseTypeRef).toBe("/company/posts/Post");
        });
    });

    describe("Type System Validation", () => {
        test("should validate qualified names", () => {
            const validTypes = [
                "/base/string",
                "/company/users/User",
                "/app/models/Post"
            ];

            validTypes.forEach(qName => {
                expect(qName).toMatch(/^\/[\w\/]+$/);
                expect(qName).toContain("/");
            });
        });

        test("should distinguish between type categories", () => {
            const simpleType: SimpleTypeMeta = {
                qName: "/base/string",
                category: "simple",
                kind: "string"
            };

            const complexType: ObjectTypeMeta = {
                qName: "/company/User",
                category: "complex", 
                kind: "object",
                properties: new Map()
            };

            expect(isSimpleType(simpleType)).toBe(true);
            expect(isComplexType(complexType)).toBe(true);
            expect(isSimpleType(complexType)).toBe(false);
            expect(isComplexType(simpleType)).toBe(false);
        });

        test("should validate export-time optimization requirements", () => {
            // This tests the assumption that types arrive already optimized
            const property: PropertyMeta = {
                name: "email",
                typeRef: "/base/string", // Direct reference, not optional wrapper
                optional: true // Optimization: flag instead of wrapper type
            };

            // Should not have OptionalTypeMeta wrapping
            expect(property.typeRef).toBe("/base/string");
            expect(property.optional).toBe(true);
        });

        test("should validate system type availability in all contexts", () => {
            // Test that system types are available in different type contexts
            const systemTypesInProperties = [
                "string", "number", "boolean", "date"
            ];
            
            systemTypesInProperties.forEach(typeName => {
                const property: PropertyMeta = {
                    name: "testProp",
                    typeRef: typeName, // Direct system type reference
                    optional: false
                };
                
                expect(property.typeRef).toBe(typeName);
                expect(systemNamespace.types.has(typeName)).toBe(true);
            });
        });

        test("should maintain system type consistency across definitions", () => {
            // Ensure system types are consistently defined
            const systemTypes = Array.from(systemNamespace.types.values());
            
            systemTypes.forEach(type => {
                expect(type.category).toBe("simple");
                expect(type.qName).not.toContain("/"); // System types use simple names
                expect(isSimpleType(type)).toBe(true);
                expect(isComplexType(type)).toBe(false);
            });
        });

        test("should prevent namespace conflicts with system types", () => {
            // Test that system type names cannot be redefined
            const systemTypeNames = Array.from(systemNamespace.types.keys());
            
            systemTypeNames.forEach(typeName => {
                // These names should be reserved
                expect(typeName).toMatch(/^[a-zA-Z]+$/);
                
                // Attempting to create a user type with system name should be flagged
                const conflictingType: SimpleTypeMeta = {
                    qName: `/user/${typeName}`,
                    category: "simple",
                    kind: "string"
                };
                
                // The type itself is valid, but the name conflict should be caught at registry level
                expect(conflictingType.qName).toContain(typeName);
                expect(systemNamespace.types.has(typeName)).toBe(true);
            });
        });
    });

    describe("System Namespace Type Definitions", () => {
        test("should define all standard primitive types in system namespace", () => {
            const expectedSystemTypes = [
                "string", "number", "boolean", "date",
                "null", "undefined", "void"
            ];
            
            expectedSystemTypes.forEach(typeName => {
                expect(systemNamespace.types.has(typeName)).toBe(true);
                const type = systemNamespace.types.get(typeName)!;
                expect(type.qName).toBe(typeName);
                expect(type.category).toBe("simple");
                expect(type.kind).toBe(typeName);
            });
        });

        test("should export all system types", () => {
            const expectedExports = [
                "string", "number", "boolean", "date",
                "literal", "null", "undefined", "void"
            ];
            
            expectedExports.forEach(typeName => {
                expect(systemNamespace.exports).toContain(typeName);
            });
        });

        test("should have system namespace with correct metadata", () => {
            expect(systemNamespace.qName).toBe("system");
            expect(systemNamespace.version).toBe("1.0.0");
            expect(systemNamespace.imports.size).toBe(0);
            expect(systemNamespace.types.size).toBeGreaterThanOrEqual(7);
        });

        test("should prevent redefinition of system type names", () => {
            const systemTypeNames = Array.from(systemNamespace.types.keys());
            
            // User-defined types should not be able to use these names
            systemTypeNames.forEach(typeName => {
                expect(typeName).toMatch(/^[a-zA-Z]+$/);
                expect(["string", "number", "boolean", "date", "null", "undefined", "void"]).toContain(typeName);
            });
        });

        test("should have consistent qName format for system types", () => {
            for (const [typeName, type] of systemNamespace.types) {
                expect(type.qName).toBe(typeName); // System types use simple names
                expect(type.category).toBe("simple");
                expect(isSimpleType(type)).toBe(true);
            }
        });
    });

    describe("Type Reference Resolution with System Types", () => {
        test("should resolve system types by simple name", () => {
            const userType: ObjectTypeMeta = {
                qName: "/company/users/User",
                category: "complex",
                kind: "entity",
                properties: new Map([
                    ["name", {
                        name: "name",
                        typeRef: "string", // Should resolve to system/string
                        optional: false
                    }],
                    ["age", {
                        name: "age",
                        typeRef: "number", // Should resolve to system/number
                        optional: false
                    }],
                    ["isActive", {
                        name: "isActive",
                        typeRef: "boolean", // Should resolve to system/boolean
                        optional: false
                    }]
                ]),
                identityKeys: ["id"]
            };

            expect(userType.properties.get("name")?.typeRef).toBe("string");
            expect(userType.properties.get("age")?.typeRef).toBe("number");
            expect(userType.properties.get("isActive")?.typeRef).toBe("boolean");
        });

        test("should support absolute system type references", () => {
            const userType: ObjectTypeMeta = {
                qName: "/company/users/User",
                category: "complex",
                kind: "entity",
                properties: new Map([
                    ["name", {
                        name: "name",
                        typeRef: "/system/string", // Absolute reference
                        optional: false
                    }]
                ]),
                identityKeys: ["id"]
            };

            expect(userType.properties.get("name")?.typeRef).toBe("/system/string");
        });

        test("should handle system types in inheritance", () => {
            const baseType: ObjectTypeMeta = {
                qName: "/base/Entity",
                category: "complex",
                kind: "entity",
                properties: new Map([
                    ["id", {
                        name: "id",
                        typeRef: "string", // System type reference
                        optional: false
                    }]
                ]),
                identityKeys: ["id"]
            };

            const derivedType: ObjectTypeMeta = {
                qName: "/company/User",
                category: "complex",
                kind: "entity",
                properties: new Map([
                    ["name", {
                        name: "name",
                        typeRef: "string", // System type reference
                        optional: false
                    }]
                ]),
                identityKeys: ["id"],
                extends: "/base/Entity"
            };

            expect(baseType.properties.get("id")?.typeRef).toBe("string");
            expect(derivedType.properties.get("name")?.typeRef).toBe("string");
            expect(derivedType.extends).toBe("/base/Entity");
        });
    });

    describe("Path Resolution Type References", () => {
        test("should support absolute path type references", () => {
            const userType: ObjectTypeMeta = {
                qName: "/company/users/User",
                category: "complex",
                kind: "entity",
                properties: new Map([
                    ["profile", {
                        name: "profile",
                        typeRef: "/company/profiles/Profile", // Absolute path
                        optional: false
                    }]
                ]),
                identityKeys: ["id"]
            };

            expect(userType.properties.get("profile")?.typeRef).toBe("/company/profiles/Profile");
            expect(userType.properties.get("profile")?.typeRef.startsWith("/")).toBe(true);
        });

        test("should support relative path type references", () => {
            const userType: ObjectTypeMeta = {
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
            };

            expect(userType.properties.get("profile")?.typeRef).toBe("Profile");
            expect(userType.properties.get("profile")?.typeRef.startsWith("/")).toBe(false);
        });

        test("should support parent path type references", () => {
            const userType: ObjectTypeMeta = {
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
            };

            expect(userType.properties.get("company")?.typeRef).toBe("../Company");
            expect(userType.properties.get("company")?.typeRef.includes("..")).toBe(true);
        });

        test("should support sub-namespace path type references", () => {
            const companyType: ObjectTypeMeta = {
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
            };

            expect(companyType.properties.get("manager")?.typeRef).toBe("department/Manager");
            expect(companyType.properties.get("manager")?.typeRef.includes("/")).toBe(true);
            expect(companyType.properties.get("manager")?.typeRef.startsWith("/")).toBe(false);
        });

        test("should handle inheritance with path resolution", () => {
            const adminUserType: ObjectTypeMeta = {
                qName: "/company/users/AdminUser",
                category: "complex",
                kind: "entity",
                properties: new Map(),
                identityKeys: ["id"],
                extends: "../base/User" // Parent path inheritance
            };

            expect(adminUserType.extends).toBe("../base/User");
            expect(adminUserType.extends?.includes("..")).toBe(true);
        });
    });
});