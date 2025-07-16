import { createStore } from "../store/createStore";
import { RegistryService } from "../registry/RegistryService";
import { Namespace, RegistryMetadata } from "../registry/NamespaceMetadata";
import { ObjectTypeMeta, PropertyMeta } from "../registry/TypeDefinitions";

// Create user schema using the new registry system
function createUserNamespace(): Namespace {
  const userTypeMeta: ObjectTypeMeta = {
    qName: "/test/User",
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
      } as PropertyMeta]
    ])
  };

  return {
    qName: "/test",
    version: "1.0.0",
    types: new Map([
      ["User", userTypeMeta]
    ]),
    exports: ["User"],
    imports: new Map()
  };
}

function createTestStore() {
  const registryMetadata: RegistryMetadata = {
    namespaces: new Map(),
    name: "Test Registry",
    version: "1.0.0",
    created: new Date(),
    lastModified: new Date()
  };
  
  const registry = new RegistryService(registryMetadata);
  const namespace = createUserNamespace();
  
  registry.importNamespace(namespace);
  return createStore(registry);
}

describe("Interface Separation Tests", () => {

  test("Store has all required interfaces", () => {
    const store = createTestStore();
    
    // Check that all interface accessors exist
    expect(store.objects).toBeDefined();
    expect(store.history).toBeDefined();
    expect(store.registry).toBeDefined();
    expect(store.data).toBeDefined();
    expect(store.events).toBeDefined();
    
    // Check that each interface has expected methods
    expect(typeof store.objects.create).toBe('function');
    expect(typeof store.objects.find).toBe('function');
    expect(typeof store.objects.findByUUID).toBe('function');
    expect(typeof store.objects.getUUID).toBe('function');
    
    expect(typeof store.history.undo).toBe('function');
    expect(typeof store.history.redo).toBe('function');
    expect(typeof store.history.getState).toBe('function');
    
    expect(typeof store.registry.getNamespace).toBe('function');
    expect(typeof store.registry.listNamespaces).toBe('function');
    
    expect(typeof store.data.serialize).toBe('function');
    expect(typeof store.data.deserialize).toBe('function');
    
    expect(typeof store.events.subscribe).toBe('function');
    expect(typeof store.events.subscribeToObject).toBe('function');
    expect(typeof store.events.subscribeToStore).toBe('function');
  });

  test("Objects interface basic functionality", () => {
    const store = createTestStore();
    
    // Create an object
    const user = store.objects.create("/test/User", { name: "John", age: 30 });
    expect(user).toBeDefined();
    expect((user as any).name).toBe("John");
    expect((user as any).age).toBe(30);
    
    // Get UUID
    const uuid = store.objects.getUUID(user);
    expect(uuid).toBeTruthy();
    
    // Find by UUID
    const foundUser = store.objects.findByUUID(uuid);
    expect(foundUser).toBe(user);
    
    // Find by type
    const users = store.objects.find("/test/User");
    expect(users).toContain(user);
  });

  test("History interface basic functionality", () => {
    const store = createTestStore();
    
    // Check initial state
    expect(store.history.isInUpdateMode()).toBe(false);
    
    // Create an object (should create a new state)
    const user = store.objects.create("/test/User", { name: "John", age: 30 });
    
    // Check state count
    expect(store.history.getStateCount()).toBeGreaterThan(0);
    
    // Check current state
    const currentState = store.history.getState();
    expect(currentState).toBeDefined();
    expect(currentState.index).toBeGreaterThanOrEqual(0);
  });

  test("Data interface basic functionality", () => {
    const store = createTestStore();
    
    // Create an object
    const user = store.objects.create("/test/User", { name: "John", age: 30 });
    
    // Serialize
    const serialized = store.data.serialize(user);
    expect(serialized).toBeTruthy();
    expect(typeof serialized).toBe('string');
    
    // The serialized data should be valid JSON
    expect(() => JSON.parse(serialized)).not.toThrow();
  });

  test("Registry interface basic functionality", () => {
    const store = createTestStore();
    
    // Check registry info
    const registryInfo = store.registry.getInfo();
    expect(registryInfo).toBeDefined();
    expect(registryInfo.name).toBeTruthy();
    expect(registryInfo.version).toBeTruthy();
    
    // List namespaces
    const namespaces = store.registry.listNamespaces();
    expect(Array.isArray(namespaces)).toBe(true);
  });

  test("Events interface basic functionality", () => {
    const store = createTestStore();
    
    // Subscribe to store changes
    let storeChanged = false;
    const unsubscribe = store.events.subscribeToStore(() => {
      storeChanged = true;
    });
    
    expect(typeof unsubscribe).toBe('function');
    
    // Create an object (should trigger store change)
    const user = store.objects.create("/test/User", { name: "John", age: 30 });
    
    // Clean up
    unsubscribe();
  });
});