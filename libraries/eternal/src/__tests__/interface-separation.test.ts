import { createStore } from "../store/createStore";
import { TypeMeta } from "../meta/InternalSchema";

describe("Interface Separation Tests", () => {
  const userTypeMeta: TypeMeta = {
    qName: "User",
    properties: new Map([
      ["name", { type: "string", qName: "name" }],
      ["age", { type: "number", qName: "age" }]
    ])
  };

  const metaInfo = new Map<string, TypeMeta>([["User", userTypeMeta]]);

  test("Store has all required interfaces", () => {
    const store = createStore(metaInfo);
    
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
    const store = createStore(metaInfo);
    
    // Create an object
    const user = store.objects.create("User", { name: "John", age: 30 });
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
    const users = store.objects.find("User");
    expect(users).toContain(user);
  });

  test("History interface basic functionality", () => {
    const store = createStore(metaInfo);
    
    // Check initial state
    expect(store.history.isInUpdateMode()).toBe(false);
    
    // Create an object (should create a new state)
    const user = store.objects.create("User", { name: "John", age: 30 });
    
    // Check state count
    expect(store.history.getStateCount()).toBeGreaterThan(0);
    
    // Check current state
    const currentState = store.history.getState();
    expect(currentState).toBeDefined();
    expect(currentState.index).toBeGreaterThanOrEqual(0);
  });

  test("Data interface basic functionality", () => {
    const store = createStore(metaInfo);
    
    // Create an object
    const user = store.objects.create("User", { name: "John", age: 30 });
    
    // Serialize
    const serialized = store.data.serialize(user);
    expect(serialized).toBeTruthy();
    expect(typeof serialized).toBe('string');
    
    // The serialized data should be valid JSON
    expect(() => JSON.parse(serialized)).not.toThrow();
  });

  test("Registry interface basic functionality", () => {
    const store = createStore(metaInfo);
    
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
    const store = createStore(metaInfo);
    
    // Subscribe to store changes
    let storeChanged = false;
    const unsubscribe = store.events.subscribeToStore(() => {
      storeChanged = true;
    });
    
    expect(typeof unsubscribe).toBe('function');
    
    // Create an object (should trigger store change)
    const user = store.objects.create("User", { name: "John", age: 30 });
    
    // Clean up
    unsubscribe();
  });
});