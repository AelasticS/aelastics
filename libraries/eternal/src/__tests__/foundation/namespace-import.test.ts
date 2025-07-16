import { ObjectTypeMeta, PropertyMeta, TypeMeta } from "../../registry/TypeDefinitions";
import { Namespace } from "../../registry/NamespaceMetadata";
import { createTestRegistry } from "../utils/testRegistrySetup";

describe("Namespace Import & Validation", () => {
  test("should import namespace with simple types", () => {
    const registry = createTestRegistry();
    
    // Create a simple object type with basic properties
    const personTypeMeta: ObjectTypeMeta = {
      qName: "/test/Person",
      category: "complex",
      kind: "object",
      properties: new Map([
        ["name", {
          name: "name",
          typeRef: "/std/string",
          optional: false
        } as PropertyMeta],
        ["age", {
          name: "age", 
          typeRef: "/std/number",
          optional: false
        } as PropertyMeta],
        ["isActive", {
          name: "isActive",
          typeRef: "/std/boolean",
          optional: false
        } as PropertyMeta]
      ])
    };
    
    const namespace: Namespace = {
      qName: "/test",
      version: "1.0.0",
      types: new Map<string, TypeMeta>([
        ["Person", personTypeMeta]
      ]),
      exports: ["Person"],
      imports: new Map()
    };
    
    // Import the namespace
    registry.importNamespace(namespace);
    
    // Verify namespace was imported
    expect(registry.hasNamespace("/test")).toBe(true);
    expect(registry.hasType("/test/Person")).toBe(true);
    
    // Verify type can be retrieved
    const retrievedType = registry.getType("/test/Person");
    expect(retrievedType).toBeDefined();
    expect(retrievedType?.qName).toBe("/test/Person");
  });

  test("should validate namespace structure", () => {
    const registry = createTestRegistry();
    
    const validNamespace: Namespace = {
      qName: "/company/users",
      version: "1.0.0",
      types: new Map<string, TypeMeta>([
        ["User", {
          qName: "/company/users/User",
          category: "complex",
          kind: "object",
          properties: new Map([
            ["email", {
              name: "email",
              typeRef: "/std/string",
              optional: false
            } as PropertyMeta]
          ])
        } as ObjectTypeMeta]
      ]),
      exports: ["User"],
      imports: new Map()
    };
    
    registry.importNamespace(validNamespace);
    
    expect(registry.hasNamespace("/company/users")).toBe(true);
    expect(registry.hasType("/company/users/User")).toBe(true);
  });

  test("should handle type lookup by qualified name", () => {
    const registry = createTestRegistry();
    
    const userTypeMeta: ObjectTypeMeta = {
      qName: "/auth/User",
      category: "complex",
      kind: "object",
      properties: new Map([
        ["username", {
          name: "username",
          typeRef: "/std/string",
          optional: false
        } as PropertyMeta]
      ])
    };
    
    const namespace: Namespace = {
      qName: "/auth",
      version: "1.0.0",
      types: new Map<string, TypeMeta>([
        ["User", userTypeMeta]
      ]),
      exports: ["User"],
      imports: new Map()
    };
    
    registry.importNamespace(namespace);
    
    // Test type lookup by qualified name
    expect(registry.hasType("/auth/User")).toBe(true);
    expect(registry.hasType("/auth/NonExistent")).toBe(false);
    
    const retrievedType = registry.getType("/auth/User");
    expect(retrievedType).toBeDefined();
    expect(retrievedType?.qName).toBe("/auth/User");
    expect(retrievedType?.category).toBe("complex");
  });
});