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
} from "../../registry/TypeDefinitions";

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
    });
});