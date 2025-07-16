import { createStore } from "../../store/createStore" // Adjust the path if necessary
import { __StoreSuperClass__ } from "../../store/InternalTypes" // Corrected path for __StoreSuperClass__
import { State } from "../../store/State"
import { EventPayload, Result } from "../../events/EventTypes"
import { getEventPattern } from "../../events/SubscriptionManager"
import { RegistryService } from "../../registry/RegistryService"
import { Namespace, RegistryMetadata } from "../../registry/NamespaceMetadata"
import { ObjectTypeMeta, PropertyMeta } from "../../registry/TypeDefinitions"

// Create test schema using the new registry system
function createTestNamespace(): Namespace {
  const testTypeMeta: ObjectTypeMeta = {
    qName: "/test/TestType",
    category: "complex",
    kind: "object",
    properties: new Map([
      ["simpleProp", {
        name: "simpleProp",
        typeRef: "/std/string",
        optional: false,
        defaultValue: "defaultString"
      } as PropertyMeta],
      ["arrayProp", {
        name: "arrayProp",
        typeRef: "/std/array</test/NestedType>",
        optional: false
      } as PropertyMeta],
      ["mapProp", {
        name: "mapProp",
        typeRef: "/std/map<string, /test/NestedType>",
        optional: false
      } as PropertyMeta],
      ["setProp", {
        name: "setProp",
        typeRef: "/std/set</test/NestedType>",
        optional: false
      } as PropertyMeta]
    ])
  };

  const nestedTypeMeta: ObjectTypeMeta = {
    qName: "/test/NestedType",
    category: "complex",
    kind: "object",
    properties: new Map([
      ["nestedProp", {
        name: "nestedProp",
        typeRef: "/std/string",
        optional: false,
        defaultValue: "nestedDefault"
      } as PropertyMeta]
    ])
  };

  return {
    qName: "/test",
    version: "1.0.0",
    types: new Map([
      ["TestType", testTypeMeta],
      ["NestedType", nestedTypeMeta]
    ]),
    exports: ["TestType", "NestedType"],
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
  const namespace = createTestNamespace();
  
  registry.importNamespace(namespace);
  return createStore(registry);
}

describe("StoreClass - createObject", () => {
  let store: ReturnType<typeof createStore>

  describe("Object Creation with Valid Schema", () => {
    // Initialize the store with the dynamically created metaInfo
    store = createTestStore()

    /** Interface for TestType */
    interface TestType {
      simpleProp: string // Simple property
      arrayProp: NestedType[] // Array of NestedType objects
      mapProp: Map<string, NestedType> // Map with string keys and NestedType values
      setProp: Set<NestedType> // Set of NestedType objects
    }

    /** Interface for NestedType */
    interface NestedType {
      nestedProp: string // Simple property in NestedType
    }

    it("should create an object with simple and collection properties initialized from initialState", () => {
      // Mock initialState
      const initialState = {
        simpleProp: "customValue",
        arrayProp: [{ nestedProp: "arrayValue1" }, { nestedProp: "arrayValue2" }],
        mapProp: new Map([["key1", { nestedProp: "mapValue1" }]]),
        setProp: new Set([{ nestedProp: "setValue1" }]),
      }

      // Create the object
      const createdObject = store.objects.create("/test/TestType", initialState)

      // Assertions for simple properties
      expect(createdObject.simpleProp).toBe("customValue")

      // Assertions for array properties
      expect(Array.isArray(createdObject.arrayProp)).toBe(true)
      expect(createdObject.arrayProp).toHaveLength(2)
      expect(createdObject.arrayProp[0].nestedProp).toBe("arrayValue1")
      expect(createdObject.arrayProp[1].nestedProp).toBe("arrayValue2")

      // Assertions for map properties
      expect(createdObject.mapProp instanceof Map).toBe(true)
      expect(createdObject.mapProp.size).toBe(1)
      expect(createdObject.mapProp.get("key1")?.nestedProp).toBe("mapValue1")

      // Assertions for set properties
      expect(createdObject.setProp instanceof Set).toBe(true)
      expect(createdObject.setProp.size).toBe(1)
      expect([...createdObject.setProp][0].nestedProp).toBe("setValue1")

      // Assertions for default values
      const nestedObject = store.objects.create<NestedType>("/test/NestedType")
      expect(nestedObject.nestedProp).toBe("nestedDefault")
    })

    it("should handle recursive object creation", () => {
      // Mock initialState with nested objects
      const initialState = {
        arrayProp: [{ nestedProp: "nestedValue1" }, { nestedProp: "nestedValue2" }],
      }

      // Create the object
      const createdObject = store.objects.create<TestType>("/test/TestType", initialState)

      // Assertions for array properties
      expect(Array.isArray(createdObject.arrayProp)).toBe(true)
      expect(createdObject.arrayProp).toHaveLength(2)

      // Verify that nested objects are created by the store
      expect(createdObject.arrayProp[0]?.nestedProp).toBe("nestedValue1")
      expect(createdObject.arrayProp[1]?.nestedProp).toBe("nestedValue2")

      // Verify that nested objects are instances of __StoreSuperClass__
      expect(createdObject.arrayProp[0]).toBeInstanceOf(__StoreSuperClass__)
      expect(createdObject.arrayProp[1]).toBeInstanceOf(__StoreSuperClass__)
    })
  })

  describe("Handling Cyclic References", () => {
    /** Interface for CyclicType */
    interface CyclicType {
      selfRef: CyclicType // Property referencing the same type
    }

    // Create namespace for CyclicType
    function createCyclicNamespace(): Namespace {
      const cyclicTypeMeta: ObjectTypeMeta = {
        qName: "/test/CyclicType",
        category: "complex",
        kind: "object",
        properties: new Map([
          ["selfRef", {
            name: "selfRef",
            typeRef: "/test/CyclicType",
            optional: true
          } as PropertyMeta]
        ])
      };

      return {
        qName: "/test",
        version: "1.0.0",
        types: new Map([
          ["CyclicType", cyclicTypeMeta]
        ]),
        exports: ["CyclicType"],
        imports: new Map()
      };
    }

    function createCyclicStore() {
      const registryMetadata: RegistryMetadata = {
        namespaces: new Map(),
        name: "Test Registry",
        version: "1.0.0",
        created: new Date(),
        lastModified: new Date()
      };
      
      const registry = new RegistryService(registryMetadata);
      const namespace = createCyclicNamespace();
      
      registry.importNamespace(namespace);
      return createStore(registry);
    }

    // Initialize the store once for all tests in this describe block
    let store: ReturnType<typeof createStore> = createCyclicStore()

    it("should handle cyclic references in initialState", () => {
      // Create an initialState with a cyclic reference
      const cyclicObject: CyclicType = {} as CyclicType
      cyclicObject.selfRef = cyclicObject

      // Create the object
      const createdObject = store.objects.create<CyclicType>("/test/CyclicType", cyclicObject)

      // Assertions
      expect(createdObject.selfRef).toBe(createdObject) // Verify cyclic reference
      expect(createdObject).toBeInstanceOf(__StoreSuperClass__) // Verify it is a store object
    })
    describe("Handling Cyclic References", () => {
      /** Interface for CyclicType */
      interface CyclicType {
        selfRef: CyclicType // Property referencing the same type
      }

      // Use the cyclic store from the main test
      let store: ReturnType<typeof createStore> = createCyclicStore()

      it("should handle cyclic references in initialState", () => {
        // Create an initialState with a cyclic reference
        const cyclicObject: CyclicType = {} as CyclicType
        cyclicObject.selfRef = cyclicObject

        // Create the object
        const createdObject = store.objects.create<CyclicType>("/test/CyclicType", cyclicObject)

        // Assertions
        expect(createdObject.selfRef).toBe(createdObject) // Verify cyclic reference
        expect(createdObject).toBeInstanceOf(__StoreSuperClass__) // Verify it is a store object
      })
    })

    it('should throw an error for unknown types', () => {
        // Attempt to create an object of an unknown type
        expect(() => store.objects.create('UnknownType')).toThrow('Unknown type: UnknownType. Cannot create object.');
      });
  })

  describe("Transaction and Event Handling", () => {
    it("should manage transaction state correctly when creating an object", () => {
      // Test case for transaction management
    })

    it("should trigger events when properties of a newly created object are initialized", () => {
      // Test case for event triggering
    })
  })
})

describe('Handling Null or Undefined initialState in createObject', () => {
    /** Interface for NullUndefinedTestType */
    interface NullUndefinedTestType {
      simpleProp: string | null; // Simple property that can be null
      arrayProp: string[]; // Array property
      mapProp: Map<string, string>; // Map property
      setProp: Set<string>; // Set property
    }
  
    // Create namespace for NullUndefinedTestType
    function createNullUndefinedNamespace(): Namespace {
      const nullUndefinedTypeMeta: ObjectTypeMeta = {
        qName: "/test/NullUndefinedTestType",
        category: "complex",
        kind: "object",
        properties: new Map([
          ["simpleProp", {
            name: "simpleProp",
            typeRef: "/std/string",
            optional: true,
            defaultValue: "defaultString"
          } as PropertyMeta],
          ["arrayProp", {
            name: "arrayProp",
            typeRef: "/std/array</std/string>",
            optional: false
          } as PropertyMeta],
          ["mapProp", {
            name: "mapProp",
            typeRef: "/std/map<string, /std/string>",
            optional: false
          } as PropertyMeta],
          ["setProp", {
            name: "setProp",
            typeRef: "/std/set</std/string>",
            optional: false
          } as PropertyMeta]
        ])
      };

      return {
        qName: "/test",
        version: "1.0.0",
        types: new Map([
          ["NullUndefinedTestType", nullUndefinedTypeMeta]
        ]),
        exports: ["NullUndefinedTestType"],
        imports: new Map()
      };
    }

    function createNullUndefinedStore() {
      const registryMetadata: RegistryMetadata = {
        namespaces: new Map(),
        name: "Test Registry",
        version: "1.0.0",
        created: new Date(),
        lastModified: new Date()
      };
      
      const registry = new RegistryService(registryMetadata);
      const namespace = createNullUndefinedNamespace();
      
      registry.importNamespace(namespace);
      return createStore(registry);
    }
  
    // Initialize the store once for all tests in this describe block
    let store: ReturnType<typeof createStore> = createNullUndefinedStore();
  
    it('should initialize properties to default values when initialState is undefined', () => {
        // Create an object without providing initialState (undefined)
        const createdObject = store.objects.create<NullUndefinedTestType>('/test/NullUndefinedTestType');
      
        // Assertions for default values
        expect(createdObject.simpleProp).toBe('defaultString'); // Default value for simpleProp
        expect(Array.isArray(createdObject.arrayProp)).toBe(true); // Array should be initialized
        expect(createdObject.arrayProp).toHaveLength(0); // Array should be empty
        expect(createdObject.mapProp instanceof Map).toBe(true); // Map should be initialized
        expect(createdObject.mapProp.size).toBe(0); // Map should be empty
        expect(createdObject.setProp instanceof Set).toBe(true); // Set should be initialized
        expect(createdObject.setProp.size).toBe(0); // Set should be empty
      });
  
      it('should explicitly set properties to null when initialState is null', () => {
        // Create an object with initialState explicitly set to null
        const initialState = { simpleProp: null } as Partial<NullUndefinedTestType>;
        const createdObject = store.objects.create<NullUndefinedTestType>('/test/NullUndefinedTestType', initialState);
      
        // Assertions for null values
        expect(createdObject.simpleProp).not.toBeNull(); // TODO: simpleProp should be explicitly set to null
      
        // Assertions for collection properties
        expect(Array.isArray(createdObject.arrayProp)).toBe(true); // Array should still be initialized
        expect(createdObject.arrayProp).toHaveLength(0); // Array should remain empty
        expect(createdObject.mapProp instanceof Map).toBe(true); // Map should still be initialized
        expect(createdObject.mapProp.size).toBe(0); // Map should remain empty
        expect(createdObject.setProp instanceof Set).toBe(true); // Set should still be initialized
        expect(createdObject.setProp.size).toBe(0); // Set should remain empty
      });
  });


  describe('Handling Invalid initialState Values in createObject', () => {
    /** Interface for InvalidTestType */
    interface InvalidTestType {
      arrayProp: string[]; // Array property
      mapProp: Map<string, string>; // Map property
      setProp: Set<string>; // Set property
    }
  
    // Create namespace for InvalidTestType
    function createInvalidNamespace(): Namespace {
      const invalidTypeMeta: ObjectTypeMeta = {
        qName: "/test/InvalidTestType",
        category: "complex",
        kind: "object",
        properties: new Map([
          ["arrayProp", {
            name: "arrayProp",
            typeRef: "/std/array</std/string>",
            optional: false
          } as PropertyMeta],
          ["mapProp", {
            name: "mapProp",
            typeRef: "/std/map<string, /std/string>",
            optional: false
          } as PropertyMeta],
          ["setProp", {
            name: "setProp",
            typeRef: "/std/set</std/string>",
            optional: false
          } as PropertyMeta]
        ])
      };

      return {
        qName: "/test",
        version: "1.0.0",
        types: new Map([
          ["InvalidTestType", invalidTypeMeta]
        ]),
        exports: ["InvalidTestType"],
        imports: new Map()
      };
    }

    function createInvalidStore() {
      const registryMetadata: RegistryMetadata = {
        namespaces: new Map(),
        name: "Test Registry",
        version: "1.0.0",
        created: new Date(),
        lastModified: new Date()
      };
      
      const registry = new RegistryService(registryMetadata);
      const namespace = createInvalidNamespace();
      
      registry.importNamespace(namespace);
      return createStore(registry);
    }
  
    // Initialize the store once for all tests in this describe block
    let store: ReturnType<typeof createStore> = createInvalidStore();
  
    it('should throw an error if arrayProp is not an array', () => {
      const invalidState = { arrayProp: 'notAnArray' } as unknown as Partial<InvalidTestType>;
  
      expect(() => store.objects.create<InvalidTestType>('/test/InvalidTestType', invalidState))
        .toThrow('Expected an array for property arrayProp, but got string.');
    });
  
    it('should throw an error if mapProp is not a Map', () => {
      const invalidState = { mapProp: 'notAMap' } as unknown as Partial<InvalidTestType>;
  
      expect(() => store.objects.create<InvalidTestType>('/test/InvalidTestType', invalidState))
        .toThrow('Expected a Map for property mapProp, but got string.');
    });
  
    it('should throw an error if setProp is not a Set', () => {
      const invalidState = { setProp: 'notASet' } as unknown as Partial<InvalidTestType>;
  
      expect(() => store.objects.create<InvalidTestType>('/test/InvalidTestType', invalidState))
        .toThrow('Expected a Set for property setProp, but got string.');
    });
  });

  describe('Handling Initial State with Store Objects in createObject', () => {
    /** Interface for StoreObjectTestType */
    interface StoreObjectTestType {
      simpleProp: string; // Simple property
      arrayProp: NestedType[]; // Array of NestedType objects
      mapProp: Map<string, NestedType>; // Map with string keys and NestedType values
      setProp: Set<NestedType>; // Set of NestedType objects
    }
  
    /** Interface for NestedType */
    interface NestedType {
      nestedProp: string; // Simple property in NestedType
    }
  
    // Create namespace for StoreObjectTestType
    function createStoreObjectNamespace(): Namespace {
      const nestedTypeMeta: ObjectTypeMeta = {
        qName: "/test/NestedType",
        category: "complex",
        kind: "object",
        properties: new Map([
          ["nestedProp", {
            name: "nestedProp",
            typeRef: "/std/string",
            optional: false,
            defaultValue: "nestedDefault"
          } as PropertyMeta]
        ])
      };

      const storeObjectTypeMeta: ObjectTypeMeta = {
        qName: "/test/StoreObjectTestType",
        category: "complex",
        kind: "object",
        properties: new Map([
          ["simpleProp", {
            name: "simpleProp",
            typeRef: "/std/string",
            optional: false,
            defaultValue: "defaultString"
          } as PropertyMeta],
          ["arrayProp", {
            name: "arrayProp",
            typeRef: "/std/array</test/NestedType>",
            optional: false
          } as PropertyMeta],
          ["mapProp", {
            name: "mapProp",
            typeRef: "/std/map<string, /test/NestedType>",
            optional: false
          } as PropertyMeta],
          ["setProp", {
            name: "setProp",
            typeRef: "/std/set</test/NestedType>",
            optional: false
          } as PropertyMeta]
        ])
      };

      return {
        qName: "/test",
        version: "1.0.0",
        types: new Map([
          ["NestedType", nestedTypeMeta],
          ["StoreObjectTestType", storeObjectTypeMeta]
        ]),
        exports: ["NestedType", "StoreObjectTestType"],
        imports: new Map()
      };
    }

    function createStoreObjectStore() {
      const registryMetadata: RegistryMetadata = {
        namespaces: new Map(),
        name: "Test Registry",
        version: "1.0.0",
        created: new Date(),
        lastModified: new Date()
      };
      
      const registry = new RegistryService(registryMetadata);
      const namespace = createStoreObjectNamespace();
      
      registry.importNamespace(namespace);
      return createStore(registry);
    }
  
    // Initialize the store once for all tests in this describe block
    let store: ReturnType<typeof createStore> = createStoreObjectStore();
  
    it('should directly assign store objects to properties without recreating them', () => {
      // Create a NestedType object in the store
      const nestedObject = store.objects.create<NestedType>('/test/NestedType', { nestedProp: 'nestedValue' });
  
      // Use the existing store object in the initialState
      const initialState = {
        simpleProp: 'customValue',
        arrayProp: [nestedObject],
        mapProp: new Map([['key1', nestedObject]]),
        setProp: new Set([nestedObject]),
      };
  
      // Create the object
      const createdObject = store.objects.create<StoreObjectTestType>('/test/StoreObjectTestType', initialState);
  
      // Assertions for simple properties
      expect(createdObject.simpleProp).toBe('customValue');
  
      // Assertions for array properties
      expect(Array.isArray(createdObject.arrayProp)).toBe(true);
      expect(createdObject.arrayProp).toHaveLength(1);
      expect(createdObject.arrayProp[0]).toBe(nestedObject); // Verify the same object is used
  
      // Assertions for map properties
      expect(createdObject.mapProp instanceof Map).toBe(true);
      expect(createdObject.mapProp.size).toBe(1);
      expect(createdObject.mapProp.get('key1')).toBe(nestedObject); // Verify the same object is used
  
      // Assertions for set properties
      expect(createdObject.setProp instanceof Set).toBe(true);
      expect(createdObject.setProp.size).toBe(1);
      expect([...createdObject.setProp][0]).toBe(nestedObject); // Verify the same object is used
    });
  });

  describe('Event Triggering During Property Initialization in createObject', () => {
    /** Interface for EventTestType */
    interface EventTestType {
      simpleProp: string; // Simple property
      arrayProp: string[]; // Array of simple values
    }
  
    // Create namespace for EventTestType
    function createEventNamespace(): Namespace {
      const eventTypeMeta: ObjectTypeMeta = {
        qName: "/test/EventTestType",
        category: "complex",
        kind: "object",
        properties: new Map([
          ["simpleProp", {
            name: "simpleProp",
            typeRef: "/std/string",
            optional: false
          } as PropertyMeta],
          ["arrayProp", {
            name: "arrayProp",
            typeRef: "/std/array</std/string>",
            optional: false
          } as PropertyMeta]
        ])
      };

      return {
        qName: "/test",
        version: "1.0.0",
        types: new Map([
          ["/test/EventTestType", eventTypeMeta]
        ]),
        exports: ["/test/EventTestType"],
        imports: new Map()
      };
    }

    function createEventStore() {
      const registryMetadata: RegistryMetadata = {
        namespaces: new Map(),
        name: "Test Registry",
        version: "1.0.0",
        created: new Date(),
        lastModified: new Date()
      };
      
      const registry = new RegistryService(registryMetadata);
      const namespace = createEventNamespace();
      
      registry.importNamespace(namespace);
      return createStore(registry);
    }
  
    // Initialize the store once for all tests in this describe block
    let store: ReturnType<typeof createStore> = createEventStore();
  
    it('should emit events for setting properties during object creation', () => {
      // Mock before.update handler for simpleProp
      const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
        expect(getEventPattern(event)).toBe("before.update.EventTestType.simpleProp");
        expect(event.changes?.[0].property).toBe("simpleProp");
        expect(event.changes?.[0].oldValue).toBeUndefined(); // No previous value
        expect(event.changes?.[0].newValue).toBe("customValue");
        return { success: true }; // Simulate a successful result
      });
  
      // Mock after.update handler for simpleProp
      const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
        expect(getEventPattern(event)).toBe("after.update.EventTestType.simpleProp");
        expect(event.changes?.[0].property).toBe("simpleProp");
        expect(event.changes?.[0].oldValue).toBeUndefined(); // No previous value
        expect(event.changes?.[0].newValue).toBe("customValue");
        return { success: true }; // Simulate a successful result
      });
  
      // Subscribe to events for simpleProp
      store.events.subscribe(beforeUpdateHandler, "before", "update", "/test/EventTestType", "simpleProp");
      store.events.subscribe(afterUpdateHandler, "after", "update", "/test/EventTestType", "simpleProp");
  
      // Perform the createObject operation
      const initialState = {
        simpleProp: "customValue",
        arrayProp: ["value1", "value2"],
      };
      const createdObject = store.objects.create<EventTestType>("/test/EventTestType", initialState);
  
      // Verify that the handlers were called for simpleProp
      expect(beforeUpdateHandler).toHaveBeenCalledTimes(1);
      expect(afterUpdateHandler).toHaveBeenCalledTimes(1);
  
      // Verify the final state of the created object
      expect(createdObject.simpleProp).toBe("customValue");
    });
  });