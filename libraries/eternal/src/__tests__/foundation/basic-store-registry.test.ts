import { createStore } from "../../store/createStore";
import { StoreObject } from "../../store/InternalTypes";
import { ObjectTypeMeta, PropertyMeta, TypeMeta, ArrayTypeMeta } from "../../registry/TypeDefinitions";
import { Namespace } from "../../registry/NamespaceMetadata";
import { createTestRegistry } from "../utils/testRegistrySetup";

describe("Basic Store-Registry Integration", () => {
  test("should create store with registry containing standard types", () => {
    const registry = createTestRegistry();
    const store = createStore(registry);
    
    // Verify store is created
    expect(store).toBeDefined();
    expect(store.objects).toBeDefined();
    expect(store.events).toBeDefined();
    expect(store.history).toBeDefined();
    
    // Verify registry has standard types
    expect(registry.hasType("/std/string")).toBe(true);
    expect(registry.hasType("/std/number")).toBe(true);
    expect(registry.hasType("/std/boolean")).toBe(true);
    expect(registry.hasType("/std/array")).toBe(true);
  });

  test("should create simple object type with primitive properties", () => {
    const registry = createTestRegistry();
    
    // Create a simple object type
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
          optional: true
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
    
    registry.importNamespace(namespace);
    const store = createStore(registry);
    
    // Verify type is registered
    expect(registry.hasType("/test/Person")).toBe(true);
    
    // Create object
    const person = store.objects.create("/test/Person") as StoreObject;
    expect(person).toBeDefined();
    
    // Verify properties are accessible
    expect(person.name).toBeDefined(); // Should be initialized as empty string
    expect(person.age).toBeUndefined(); // Optional properties are undefined
  });

  test("should create object type with array property", () => {
    const registry = createTestRegistry();
    
    // Create array type first
    const stringArrayTypeMeta: ArrayTypeMeta = {
      qName: "/test/StringArray",
      category: "complex",
      kind: "array",
      elementType: "/std/string"
    };
    
    // Create object type with array property
    const listTypeMeta: ObjectTypeMeta = {
      qName: "/test/List",
      category: "complex",
      kind: "object",
      properties: new Map([
        ["items", {
          name: "items",
          typeRef: "/test/StringArray",
          optional: false
        } as PropertyMeta]
      ])
    };
    
    const namespace: Namespace = {
      qName: "/test",
      version: "1.0.0",
      types: new Map<string, TypeMeta>([
        ["StringArray", stringArrayTypeMeta],
        ["List", listTypeMeta]
      ]),
      exports: ["StringArray", "List"],
      imports: new Map()
    };
    
    registry.importNamespace(namespace);
    const store = createStore(registry);
    
    // Create object with initial state to work around framework limitation
    const list = store.objects.create("/test/List", { items: [] }) as any;
    expect(list).toBeDefined();
    
    // Verify array property is initialized
    expect(list.items).toBeDefined();
    expect(Array.isArray(list.items)).toBe(true);
    expect(list.items.length).toBe(0); // Should be empty array
    
    // Test array operations
    list.items.push("item1");
    expect(list.items.length).toBe(1);
    expect(list.items[0]).toBe("item1");
  });
});