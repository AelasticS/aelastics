import { createStore } from "../../store/createStore";
import { StoreObject, uuid } from "../../store/InternalTypes";
import { EventPayload, Result } from "../../events/EventTypes";
import { getEventPattern } from "../../events/SubscriptionManager";
import { RegistryService } from "../../registry/RegistryService";
import { Namespace, RegistryMetadata } from "../../registry/NamespaceMetadata";
import { ObjectTypeMeta, PropertyMeta } from "../../registry/TypeDefinitions";

// Create test schema using the new registry system
function createTestNamespace(): Namespace {
  const simpleArrayTypeMeta: ObjectTypeMeta = {
    qName: "/test/SimpleArrayType",
    category: "complex",
    kind: "object",
    properties: new Map([
      ["numbers", {
        name: "numbers",
        typeRef: "/std/array</std/number>",
        optional: false
      } as PropertyMeta]
    ])
  };

  return {
    qName: "/test",
    version: "1.0.0",
    types: new Map([
      ["SimpleArrayType", simpleArrayTypeMeta]
    ]),
    exports: ["SimpleArrayType"],
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

describe("ArrayHandler Events", () => {
  let store: ReturnType<typeof createStore>;
  let simpleArrayObject: StoreObject;

  beforeEach(() => {
    // Initialize the store with the new registry system
    store = createTestStore();

    // Create an object of type SimpleArrayType
    simpleArrayObject = store.objects.create("/test/SimpleArrayType") as StoreObject;

    // Retrieve the latest version of the object
    simpleArrayObject = store.objects.findByUUID<StoreObject>((simpleArrayObject as StoreObject)[uuid])!;
  });

  test("should emit events and track changes for push operation on array of simple values", () => {
    // Mock before.update handler
    const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("before.update.SimpleArrayType.numbers");
      expect(event.changes?.[0].changeType).toBe("add");
      expect(event.changes?.[0].index).toBe(0);
      expect(event.changes?.[0].newValue).toBe(42);
      return { success: true }; // Simulate a successful result
    });

    // Mock after.update handler
    const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("after.update.SimpleArrayType.numbers");
      expect(event.changes?.[0].changeType).toBe("add");
      expect(event.changes?.[0].index).toBe(0);
      expect(event.changes?.[0].newValue).toBe(42);
      return { success: true }; // Simulate a successful result
    });

    // Subscribe to events
    store.events.subscribe(beforeUpdateHandler, "before", "update", "SimpleArrayType", "numbers");
    store.events.subscribe(afterUpdateHandler, "after", "update", "SimpleArrayType", "numbers");

    // Perform the push operation using updateObject
    simpleArrayObject = store.objects.update((obj) => {
      obj.numbers.push(42);
    }, simpleArrayObject);

    // Verify that the handlers were called
    expect(beforeUpdateHandler).toHaveBeenCalledTimes(1);
    expect(afterUpdateHandler).toHaveBeenCalledTimes(1);

    // Verify the final state of the array
    expect(simpleArrayObject.numbers).toEqual([42]);
  });

  
  test("should emit events and track changes for pop operation on array of simple values", () => {
    // Initialize the array with values
    simpleArrayObject = store.objects.update((obj) => {
      obj.numbers.push(10, 20, 30);
    }, simpleArrayObject);

    // Mock before.update handler
    const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("before.update.SimpleArrayType.numbers");
      expect(event.changes?.[0].changeType).toBe("remove");
      expect(event.changes?.[0].index).toBe(2); // Last index
      expect(event.changes?.[0].oldValue).toBe(30); // Last value
      return { success: true }; // Simulate a successful result
    });

    // Mock after.update handler
    const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("after.update.SimpleArrayType.numbers");
      expect(event.changes?.[0].changeType).toBe("remove");
      expect(event.changes?.[0].index).toBe(2); // Last index
      expect(event.changes?.[0].oldValue).toBe(30); // Last value
      return { success: true }; // Simulate a successful result
    });

    // Subscribe to events
    store.events.subscribe(beforeUpdateHandler, "before", "update", "SimpleArrayType", "numbers");
    store.events.subscribe(afterUpdateHandler, "after", "update", "SimpleArrayType", "numbers");

    // Perform the pop operation using updateObject
    simpleArrayObject = store.objects.update((obj) => {
      obj.numbers.pop();
    }, simpleArrayObject);

    // Verify that the handlers were called
    expect(beforeUpdateHandler).toHaveBeenCalledTimes(1);
    expect(afterUpdateHandler).toHaveBeenCalledTimes(1);

    // Verify the final state of the array
    expect(simpleArrayObject.numbers).toEqual([10, 20]);
  });

  test("should emit events and track changes for pop operation on array of simple values", () => {
    // Initialize the array with values
    simpleArrayObject = store.objects.update((obj) => {
      obj.numbers.push(10, 20, 30);
    }, simpleArrayObject);

    // Mock before.update handler
    const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("before.update.SimpleArrayType.numbers");
      expect(event.changes?.[0].changeType).toBe("remove");
      expect(event.changes?.[0].index).toBe(2); // Last index
      expect(event.changes?.[0].oldValue).toBe(30); // Last value
      return { success: true }; // Simulate a successful result
    });

    // Mock after.update handler
    const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("after.update.SimpleArrayType.numbers");
      expect(event.changes?.[0].changeType).toBe("remove");
      expect(event.changes?.[0].index).toBe(2); // Last index
      expect(event.changes?.[0].oldValue).toBe(30); // Last value
      return { success: true }; // Simulate a successful result
    });

    // Subscribe to events
    store.events.subscribe(beforeUpdateHandler, "before", "update", "SimpleArrayType", "numbers");
    store.events.subscribe(afterUpdateHandler, "after", "update", "SimpleArrayType", "numbers");

    // Perform the pop operation using updateObject
    simpleArrayObject = store.objects.update((obj) => {
      obj.numbers.pop();
    }, simpleArrayObject);

    // Verify that the handlers were called
    expect(beforeUpdateHandler).toHaveBeenCalledTimes(1);
    expect(afterUpdateHandler).toHaveBeenCalledTimes(1);

    // Verify the final state of the array
    expect(simpleArrayObject.numbers).toEqual([10, 20]);
  });

  test("should emit events and track changes for unshift operation on array of simple values", () => {
    // Initialize the array with values
    simpleArrayObject = store.objects.update((obj) => {
      obj.numbers.push(20, 30);
    }, simpleArrayObject);

    // Mock before.update handler
    const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("before.update.SimpleArrayType.numbers");
      expect(event.changes?.[0].changeType).toBe("add");
      expect(event.changes?.[0].index).toBe(0); // First index
      expect(event.changes?.[0].newValue).toBe(10); // New first value
      return { success: true }; // Simulate a successful result
    });

    // Mock after.update handler
    const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("after.update.SimpleArrayType.numbers");
      expect(event.changes?.[0].changeType).toBe("add");
      expect(event.changes?.[0].index).toBe(0); // First index
      expect(event.changes?.[0].newValue).toBe(10); // New first value
      return { success: true }; // Simulate a successful result
    });

    // Subscribe to events
    store.events.subscribe(beforeUpdateHandler, "before", "update", "SimpleArrayType", "numbers");
    store.events.subscribe(afterUpdateHandler, "after", "update", "SimpleArrayType", "numbers");

    // Perform the unshift operation using updateObject
    simpleArrayObject = store.objects.update((obj) => {
      obj.numbers.unshift(10);
    }, simpleArrayObject);

    // Verify that the handlers were called
    expect(beforeUpdateHandler).toHaveBeenCalledTimes(1);
    expect(afterUpdateHandler).toHaveBeenCalledTimes(1);

    // Verify the final state of the array
    expect(simpleArrayObject.numbers).toEqual([10, 20, 30]);
  });

  test("should emit events and track changes for splice operation on array of simple values", () => {
    // Initialize the array with values
    simpleArrayObject = store.objects.update((obj) => {
      obj.numbers.push(10, 20, 30, 40);
    }, simpleArrayObject);

    // Mock before.update handler
    const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("before.update.SimpleArrayType.numbers");
      expect(event.changes?.[0].changeType).toBe("remove");
      expect(event.changes?.[0].index).toBe(1); // Index of the removed element
      expect(event.changes?.[0].oldValue).toBe(20); // Removed value
      expect(event.changes?.[1].changeType).toBe("remove");
      expect(event.changes?.[1].index).toBe(2); // Index of the removed element
      expect(event.changes?.[1].oldValue).toBe(30); // Removed value
      return { success: true }; // Simulate a successful result
    });

    // Mock after.update handler
    const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("after.update.SimpleArrayType.numbers");
      expect(event.changes?.[0].changeType).toBe("remove");
      expect(event.changes?.[0].index).toBe(1); // Index of the removed element
      expect(event.changes?.[0].oldValue).toBe(20); // Removed value
      expect(event.changes?.[1].changeType).toBe("remove");
      expect(event.changes?.[1].index).toBe(2); // Index of the removed element
      expect(event.changes?.[1].oldValue).toBe(30); // Removed value
      return { success: true }; // Simulate a successful result
    });

    // Subscribe to events
    store.events.subscribe(beforeUpdateHandler, "before", "update", "SimpleArrayType", "numbers");
    store.events.subscribe(afterUpdateHandler, "after", "update", "SimpleArrayType", "numbers");

    // Perform the splice operation using updateObject
    simpleArrayObject = store.objects.update((obj) => {
      obj.numbers.splice(1, 2); // Remove 2 elements starting from index 1
    }, simpleArrayObject);

    // Verify that the handlers were called
    expect(beforeUpdateHandler).toHaveBeenCalledTimes(1);
    expect(afterUpdateHandler).toHaveBeenCalledTimes(1);

    // Verify the final state of the array
    expect(simpleArrayObject.numbers).toEqual([10, 40]);
  });

  test("should emit events and track changes for sort operation on array of simple values", () => {
    // Initialize the array with values
    simpleArrayObject = store.objects.update((obj) => {
      obj.numbers.push(30, 10, 20);
    }, simpleArrayObject);

    // Mock before.update handler
    const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("before.update.SimpleArrayType.numbers");
      expect(event.changes?.[0].changeType).toBe("reorder");
      return { success: true }; // Simulate a successful result
    });

    // Mock after.update handler
    const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("after.update.SimpleArrayType.numbers");
      expect(event.changes?.[0].changeType).toBe("reorder");
      return { success: true }; // Simulate a successful result
    });

    // Subscribe to events
    store.events.subscribe(beforeUpdateHandler, "before", "update", "SimpleArrayType", "numbers");
    store.events.subscribe(afterUpdateHandler, "after", "update", "SimpleArrayType", "numbers");

    // Perform the sort operation using updateObject
    simpleArrayObject = store.objects.update((obj) => {
      obj.numbers.sort((a:number, b:number) => a - b); // Sort in ascending order
    }, simpleArrayObject);

    // Verify that the handlers were called
    expect(beforeUpdateHandler).toHaveBeenCalledTimes(1);
    expect(afterUpdateHandler).toHaveBeenCalledTimes(1);

    // Verify the final state of the array
    expect(simpleArrayObject.numbers).toEqual([10, 20, 30]);
  });

  test("should emit events and track changes for reverse operation on array of simple values", () => {
    // Initialize the array with values
    simpleArrayObject = store.objects.update((obj) => {
      obj.numbers.push(10, 20, 30);
    }, simpleArrayObject);

    // Mock before.update handler
    const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("before.update.SimpleArrayType.numbers");
      expect(event.changes?.[0].changeType).toBe("reorder");
      return { success: true }; // Simulate a successful result
    });

    // Mock after.update handler
    const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("after.update.SimpleArrayType.numbers");
      expect(event.changes?.[0].changeType).toBe("reorder");
      return { success: true }; // Simulate a successful result
    });

    // Subscribe to events
    store.events.subscribe(beforeUpdateHandler, "before", "update", "SimpleArrayType", "numbers");
    store.events.subscribe(afterUpdateHandler, "after", "update", "SimpleArrayType", "numbers");

    // Perform the reverse operation using updateObject
    simpleArrayObject = store.objects.update((obj) => {
      obj.numbers.reverse(); // Reverse the array
    }, simpleArrayObject);

    // Verify that the handlers were called
    expect(beforeUpdateHandler).toHaveBeenCalledTimes(1);
    expect(afterUpdateHandler).toHaveBeenCalledTimes(1);

    // Verify the final state of the array
    expect(simpleArrayObject.numbers).toEqual([30, 20, 10]);
  });
});


// Create test namespace for object array types with inverse relationships
function createObjectArrayNamespace(): Namespace {
  const relatedObjectTypeMeta: ObjectTypeMeta = {
    qName: "/test/RelatedObject",
    category: "complex",
    kind: "object",
    properties: new Map([
      ["parent", {
        name: "parent",
        typeRef: "/test/ObjectArrayType",
        optional: true
      } as PropertyMeta]
    ])
  };

  const objectArrayTypeMeta: ObjectTypeMeta = {
    qName: "/test/ObjectArrayType",
    category: "complex",
    kind: "object",
    properties: new Map([
      ["items", {
        name: "items",
        typeRef: "/std/array</test/RelatedObject>",
        optional: false
      } as PropertyMeta]
    ]),
    inverseCollection: new Map([
      ["items", {
        propName: "parent",
        targetTypeQName: "/test/RelatedObject",
        isCollection: false
      }]
    ])
  };

  return {
    qName: "/test",
    version: "1.0.0",
    types: new Map([
      ["ObjectArrayType", objectArrayTypeMeta],
      ["RelatedObject", relatedObjectTypeMeta]
    ]),
    exports: ["ObjectArrayType", "RelatedObject"],
    imports: new Map()
  };
}

function createObjectArrayStore() {
  const registryMetadata: RegistryMetadata = {
    namespaces: new Map(),
    name: "Test Registry",
    version: "1.0.0",
    created: new Date(),
    lastModified: new Date()
  };
  
  const registry = new RegistryService(registryMetadata);
  const namespace = createObjectArrayNamespace();
  
  registry.importNamespace(namespace);
  return createStore(registry);
}
describe("ArrayHandler Events - Arrays of Objects with Inverse Properties", () => {
    let store: ReturnType<typeof createStore>;
    let objectArrayObject: StoreObject;
  

    beforeEach(() => {
      // Initialize the store with the new registry system
      store = createObjectArrayStore();
  
      // Create an object of type ObjectArrayType
      objectArrayObject = store.objects.create("/test/ObjectArrayType") as StoreObject;
  
      // Retrieve the latest version of the object
      objectArrayObject = store.objects.findByUUID<StoreObject>((objectArrayObject as StoreObject)[uuid])!;
    });
  
    test("should emit events and update inverse properties for push operation on array of objects", () => {
        // Create a related object
        let relatedObject = store.objects.create("/test/RelatedObject") as StoreObject;
    
        // Get the UUID of the related object
        const relatedObjectUUID = (relatedObject as StoreObject)[uuid];
    
        // Mock before.update handler
        const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
          // Verify the event properties
          expect(getEventPattern(event)).toBe("before.update.ObjectArrayType.items");
          expect(event.changes?.[0].changeType).toBe("add");
          expect(event.changes?.[0].index).toBe(0); // First index
          expect(event.changes?.[0].newValue).toBe(relatedObjectUUID); // New value is UUID
          return { success: true }; // Simulate a successful result
        });
    
        // Mock after.update handler
        const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
          // Verify the event properties
          expect(getEventPattern(event)).toBe("after.update.ObjectArrayType.items");
          expect(event.changes?.[0].changeType).toBe("add");
          expect(event.changes?.[0].index).toBe(0); // First index
          expect(event.changes?.[0].newValue).toBe(relatedObjectUUID); // New value is UUID
          return { success: true }; // Simulate a successful result
        });
    
        // Subscribe to events
        store.events.subscribe(beforeUpdateHandler, "before", "update", "ObjectArrayType", "items");
        store.events.subscribe(afterUpdateHandler, "after", "update", "ObjectArrayType", "items");
    
        // Perform the push operation using updateObject
        objectArrayObject = store.objects.update((obj) => {
          obj.items.push(relatedObject);
        }, objectArrayObject);
    
        // Update the variables with their latest versions
        objectArrayObject = store.objects.findByUUID<StoreObject>((objectArrayObject as StoreObject)[uuid])!;
        relatedObject = store.objects.findByUUID<StoreObject>((relatedObject as StoreObject)[uuid])!;
    
        // Verify the final state of the array
        expect(objectArrayObject.items).toEqual([relatedObject]);
    
        // Verify the inverse property
        expect(relatedObject.parent).toBe(objectArrayObject);
      });

      test("should emit events and update inverse properties for pop operation on array of objects", () => {
        // Create a related object and add it to the array
        let relatedObject = store.objects.create("RelatedObject") as StoreObject;
    
        // Add the related object to the array
        objectArrayObject = store.objects.update((obj) => {
          obj.items.push(relatedObject);
        }, objectArrayObject);
    
        // Update the object references
        objectArrayObject = store.objects.findByUUID<StoreObject>((objectArrayObject as StoreObject)[uuid])!;
        relatedObject = store.objects.findByUUID<StoreObject>((relatedObject as StoreObject)[uuid])!;
    
        // Get the UUID of the related object
        const relatedObjectUUID = (relatedObject as StoreObject)[uuid];
    
        // Mock before.update handler
        const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
          // Verify the event properties
          expect(getEventPattern(event)).toBe("before.update.ObjectArrayType.items");
          expect(event.changes?.[0].changeType).toBe("remove");
          expect(event.changes?.[0].index).toBe(0); // Index of the removed element
          expect(event.changes?.[0].oldValue).toBe(relatedObjectUUID); // Old value is UUID
          return { success: true }; // Simulate a successful result
        });
    
        // Mock after.update handler
        const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
          // Verify the event properties
          expect(getEventPattern(event)).toBe("after.update.ObjectArrayType.items");
          expect(event.changes?.[0].changeType).toBe("remove");
          expect(event.changes?.[0].index).toBe(0); // Index of the removed element
          expect(event.changes?.[0].oldValue).toBe(relatedObjectUUID); // Old value is UUID
          return { success: true }; // Simulate a successful result
        });
    
        // Subscribe to events
        store.events.subscribe(beforeUpdateHandler, "before", "update", "ObjectArrayType", "items");
        store.events.subscribe(afterUpdateHandler, "after", "update", "ObjectArrayType", "items");
    
        // Perform the pop operation using updateObject
        objectArrayObject = store.objects.update((obj) => {
          obj.items.pop();
        }, objectArrayObject);
    
        // Update the object references
        objectArrayObject = store.objects.findByUUID<StoreObject>((objectArrayObject as StoreObject)[uuid])!;
        relatedObject = store.objects.findByUUID<StoreObject>((relatedObject as StoreObject)[uuid])!;
    
        // Verify the final state of the array
        expect(objectArrayObject.items).toEqual([]);
    
        // Verify the inverse property
        expect(relatedObject.parent).toBeUndefined();
      });

      test("should emit events and update inverse properties for splice operation on array of objects", () => {
        // Create related objects and add them to the array
        let relatedObject1 = store.objects.create("/test/RelatedObject") as StoreObject;
        let relatedObject2 = store.objects.create("/test/RelatedObject") as StoreObject;
    
        // Add the related objects to the array
        objectArrayObject = store.objects.update((obj) => {
          obj.items.push(relatedObject1, relatedObject2);
        }, objectArrayObject);
    
        // Update the object references
        objectArrayObject = store.objects.findByUUID<StoreObject>((objectArrayObject as StoreObject)[uuid])!;
        relatedObject1 = store.objects.findByUUID<StoreObject>((relatedObject1 as StoreObject)[uuid])!;
        relatedObject2 = store.objects.findByUUID<StoreObject>((relatedObject2 as StoreObject)[uuid])!;
    
        // Get the UUIDs of the related objects
        const relatedObject1UUID = (relatedObject1 as StoreObject)[uuid];
        const relatedObject2UUID = (relatedObject2 as StoreObject)[uuid];
    
        // Mock before.update handler
        const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
          // Verify the event properties
          expect(getEventPattern(event)).toBe("before.update.ObjectArrayType.items");
          expect(event.changes?.[0].changeType).toBe("remove");
          expect(event.changes?.[0].index).toBe(0); // Index of the removed element
          expect(event.changes?.[0].oldValue).toBe(relatedObject1UUID); // Old value is UUID
          return { success: true }; // Simulate a successful result
        });
    
        // Mock after.update handler
        const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
          // Verify the event properties
          expect(getEventPattern(event)).toBe("after.update.ObjectArrayType.items");
          expect(event.changes?.[0].changeType).toBe("remove");
          expect(event.changes?.[0].index).toBe(0); // Index of the removed element
          expect(event.changes?.[0].oldValue).toBe(relatedObject1UUID); // Old value is UUID
          return { success: true }; // Simulate a successful result
        });
    
        // Subscribe to events
        store.events.subscribe(beforeUpdateHandler, "before", "update", "ObjectArrayType", "items");
        store.events.subscribe(afterUpdateHandler, "after", "update", "ObjectArrayType", "items");
    
        // Perform the splice operation using updateObject
        objectArrayObject = store.objects.update((obj) => {
          obj.items.splice(0, 1); // Remove the first element
        }, objectArrayObject);
    
        // Update the object references
        objectArrayObject = store.objects.findByUUID<StoreObject>((objectArrayObject as StoreObject)[uuid])!;
        relatedObject1 = store.objects.findByUUID<StoreObject>((relatedObject1 as StoreObject)[uuid])!;
    
        // Verify the final state of the array
        expect(objectArrayObject.items).toEqual([relatedObject2]);
    
        // Verify the inverse property of the removed object
        expect(relatedObject1.parent).toBeUndefined(); // Use undefined to nullify the inverse property
      });

      test("should emit events and update inverse properties for unshift operation on array of objects", () => {
        // Create a related object
        let relatedObject = store.objects.create("/test/RelatedObject") as StoreObject;
    
        // Mock before.update handler
        const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
          // Verify the event properties
          expect(getEventPattern(event)).toBe("before.update.ObjectArrayType.items");
          expect(event.changes?.[0].changeType).toBe("add");
          expect(event.changes?.[0].index).toBe(0); // First index
          expect(event.changes?.[0].newValue).toBe((relatedObject as StoreObject)[uuid]); // New value is UUID
          return { success: true }; // Simulate a successful result
        });
    
        // Mock after.update handler
        const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
          // Verify the event properties
          expect(getEventPattern(event)).toBe("after.update.ObjectArrayType.items");
          expect(event.changes?.[0].changeType).toBe("add");
          expect(event.changes?.[0].index).toBe(0); // First index
          expect(event.changes?.[0].newValue).toBe((relatedObject as StoreObject)[uuid]); // New value is UUID
          return { success: true }; // Simulate a successful result
        });
    
        // Subscribe to events
        store.events.subscribe(beforeUpdateHandler, "before", "update", "ObjectArrayType", "items");
        store.events.subscribe(afterUpdateHandler, "after", "update", "ObjectArrayType", "items");
    
        // Perform the unshift operation using updateObject
        objectArrayObject = store.objects.update((obj) => {
          obj.items.unshift(relatedObject);
        }, objectArrayObject);
    
        // Update the object references
        objectArrayObject = store.objects.findByUUID<StoreObject>((objectArrayObject as StoreObject)[uuid])!;
        relatedObject = store.objects.findByUUID<StoreObject>((relatedObject as StoreObject)[uuid])!;
    
        // Verify the final state of the array
        expect(objectArrayObject.items).toEqual([relatedObject]);
    
        // Verify the inverse property
        expect(relatedObject.parent).toBe(objectArrayObject);
      });

      test("should emit events and update inverse properties for shift operation on array of objects", () => {
        // Create related objects and add them to the array
        let relatedObject1 = store.objects.create("/test/RelatedObject") as StoreObject;
        let relatedObject2 = store.objects.create("/test/RelatedObject") as StoreObject;
    
        // Add the related objects to the array
        objectArrayObject = store.objects.update((obj) => {
          obj.items.push(relatedObject1, relatedObject2);
        }, objectArrayObject);
    
        // Update the object references
        objectArrayObject = store.objects.findByUUID<StoreObject>((objectArrayObject as StoreObject)[uuid])!;
        relatedObject1 = store.objects.findByUUID<StoreObject>((relatedObject1 as StoreObject)[uuid])!;
        relatedObject2 = store.objects.findByUUID<StoreObject>((relatedObject2 as StoreObject)[uuid])!;
    
        // Get the UUID of the first related object
        const relatedObject1UUID = (relatedObject1 as StoreObject)[uuid];
    
        // Mock before.update handler
        const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
          // Verify the event properties
          expect(getEventPattern(event)).toBe("before.update.ObjectArrayType.items");
          expect(event.changes?.[0].changeType).toBe("remove");
          expect(event.changes?.[0].index).toBe(0); // First index
          expect(event.changes?.[0].oldValue).toBe(relatedObject1UUID); // Old value is UUID
          return { success: true }; // Simulate a successful result
        });
    
        // Mock after.update handler
        const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
          // Verify the event properties
          expect(getEventPattern(event)).toBe("after.update.ObjectArrayType.items");
          expect(event.changes?.[0].changeType).toBe("remove");
          expect(event.changes?.[0].index).toBe(0); // First index
          expect(event.changes?.[0].oldValue).toBe(relatedObject1UUID); // Old value is UUID
          return { success: true }; // Simulate a successful result
        });
    
        // Subscribe to events
        store.events.subscribe(beforeUpdateHandler, "before", "update", "ObjectArrayType", "items");
        store.events.subscribe(afterUpdateHandler, "after", "update", "ObjectArrayType", "items");
    
        // Perform the shift operation using updateObject
        objectArrayObject = store.objects.update((obj) => {
          obj.items.shift(); // Remove the first element
        }, objectArrayObject);
    
        // Update the object references
        objectArrayObject = store.objects.findByUUID<StoreObject>((objectArrayObject as StoreObject)[uuid])!;
        relatedObject1 = store.objects.findByUUID<StoreObject>((relatedObject1 as StoreObject)[uuid])!;
    
        // Verify the final state of the array
        expect(objectArrayObject.items).toEqual([relatedObject2]);
    
        // Verify the inverse property of the removed object
        expect(relatedObject1.parent).toBeUndefined(); // Use undefined to nullify the inverse property
      });
  });