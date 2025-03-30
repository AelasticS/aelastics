import { createStore } from "../../store/createStore";
import { initializeSchemaRegistry } from "../../meta/SchemaRegistry";
import { SchemaRegistry } from "../../meta/InternalSchema";
import { SchemaDescription } from "../../meta/ExternalSchema";
import { StoreObject, uuid } from "../../handlers/InternalTypes";
import { EventPayload, Result } from "../../events/EventTypes";
import { getEventPattern } from "../../events/SubscriptionManager";

const schemas: SchemaDescription[] = [
  {
    qName: "/test",
    version: "1.0",
    types: {
      SimpleArrayType: {
        qName: "SimpleArrayType",
        properties: {
          numbers: {
            qName: "numbers",
            type: "array",
            itemType: "number",
          },
        },
      },
    },
    roles: {},
    export: ["SimpleArrayType"],
    import: {},
  },
];

describe("ArrayHandler Events", () => {
  let store: ReturnType<typeof createStore>;
  let simpleArrayObject: StoreObject;

  beforeEach(() => {
    // Initialize the schema registry and store
    const schemaRegistry: SchemaRegistry = initializeSchemaRegistry(schemas) as SchemaRegistry;
    store = createStore(schemaRegistry.schemas.get("/test")!);

    // Create an object of type SimpleArrayType
    simpleArrayObject = store.createObject("SimpleArrayType") as StoreObject;

    // Retrieve the latest version of the object
    simpleArrayObject = store.getObjectByUUID((simpleArrayObject as StoreObject)[uuid])!;
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
    store.subscribe(beforeUpdateHandler, "before", "update", "SimpleArrayType", "numbers");
    store.subscribe(afterUpdateHandler, "after", "update", "SimpleArrayType", "numbers");

    // Perform the push operation using updateObject
    simpleArrayObject = store.updateObject((obj) => {
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
    simpleArrayObject = store.updateObject((obj) => {
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
    store.subscribe(beforeUpdateHandler, "before", "update", "SimpleArrayType", "numbers");
    store.subscribe(afterUpdateHandler, "after", "update", "SimpleArrayType", "numbers");

    // Perform the pop operation using updateObject
    simpleArrayObject = store.updateObject((obj) => {
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
    simpleArrayObject = store.updateObject((obj) => {
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
    store.subscribe(beforeUpdateHandler, "before", "update", "SimpleArrayType", "numbers");
    store.subscribe(afterUpdateHandler, "after", "update", "SimpleArrayType", "numbers");

    // Perform the pop operation using updateObject
    simpleArrayObject = store.updateObject((obj) => {
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
    simpleArrayObject = store.updateObject((obj) => {
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
    store.subscribe(beforeUpdateHandler, "before", "update", "SimpleArrayType", "numbers");
    store.subscribe(afterUpdateHandler, "after", "update", "SimpleArrayType", "numbers");

    // Perform the unshift operation using updateObject
    simpleArrayObject = store.updateObject((obj) => {
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
    simpleArrayObject = store.updateObject((obj) => {
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
    store.subscribe(beforeUpdateHandler, "before", "update", "SimpleArrayType", "numbers");
    store.subscribe(afterUpdateHandler, "after", "update", "SimpleArrayType", "numbers");

    // Perform the splice operation using updateObject
    simpleArrayObject = store.updateObject((obj) => {
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
    simpleArrayObject = store.updateObject((obj) => {
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
    store.subscribe(beforeUpdateHandler, "before", "update", "SimpleArrayType", "numbers");
    store.subscribe(afterUpdateHandler, "after", "update", "SimpleArrayType", "numbers");

    // Perform the sort operation using updateObject
    simpleArrayObject = store.updateObject((obj) => {
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
    simpleArrayObject = store.updateObject((obj) => {
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
    store.subscribe(beforeUpdateHandler, "before", "update", "SimpleArrayType", "numbers");
    store.subscribe(afterUpdateHandler, "after", "update", "SimpleArrayType", "numbers");

    // Perform the reverse operation using updateObject
    simpleArrayObject = store.updateObject((obj) => {
      obj.numbers.reverse(); // Reverse the array
    }, simpleArrayObject);

    // Verify that the handlers were called
    expect(beforeUpdateHandler).toHaveBeenCalledTimes(1);
    expect(afterUpdateHandler).toHaveBeenCalledTimes(1);

    // Verify the final state of the array
    expect(simpleArrayObject.numbers).toEqual([30, 20, 10]);
  });
});


const schemas2: SchemaDescription[] = [
    {
      qName: "/test",
      version: "1.0",
      types: {
        ObjectArrayType: {
          qName: "ObjectArrayType",
          properties: {
            items: {
              qName: "items",
              type: "array",
              itemType: "object",
              inverseProp: "parent",
              inverseType: "object",
              domainType: "RelatedObject",
            },
          },
        },
        RelatedObject: {
          qName: "RelatedObject",
          properties: {
            parent: {
              qName: "parent",
              type: "object",
              inverseProp: "items",
              inverseType: "array",
              domainType: "ObjectArrayType",
            },
          },
        },
      },
      roles: {},
      export: ["ObjectArrayType", "RelatedObject"],
      import: {},
    },
  ];
describe("ArrayHandler Events - Arrays of Objects with Inverse Properties", () => {
    let store: ReturnType<typeof createStore>;
    let objectArrayObject: StoreObject;
  

    beforeEach(() => {
      // Initialize the schema registry and store
      const schemaRegistry: SchemaRegistry = initializeSchemaRegistry(schemas2) as SchemaRegistry;
      store = createStore(schemaRegistry.schemas.get("/test")!);
  
      // Create an object of type ObjectArrayType
      objectArrayObject = store.createObject("ObjectArrayType") as StoreObject;
  
      // Retrieve the latest version of the object
      objectArrayObject = store.getObjectByUUID((objectArrayObject as StoreObject)[uuid])!;
    });
  
    test("should emit events and update inverse properties for push operation on array of objects", () => {
        // Create a related object
        let relatedObject = store.createObject("RelatedObject") as StoreObject;
    
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
        store.subscribe(beforeUpdateHandler, "before", "update", "ObjectArrayType", "items");
        store.subscribe(afterUpdateHandler, "after", "update", "ObjectArrayType", "items");
    
        // Perform the push operation using updateObject
        objectArrayObject = store.updateObject((obj) => {
          obj.items.push(relatedObject);
        }, objectArrayObject);
    
        // Update the variables with their latest versions
        objectArrayObject = store.getObjectByUUID((objectArrayObject as StoreObject)[uuid])!;
        relatedObject = store.getObjectByUUID((relatedObject as StoreObject)[uuid])!;
    
        // Verify the final state of the array
        expect(objectArrayObject.items).toEqual([relatedObject]);
    
        // Verify the inverse property
        expect(relatedObject.parent).toBe(objectArrayObject);
      });

      test("should emit events and update inverse properties for pop operation on array of objects", () => {
        // Create a related object and add it to the array
        let relatedObject = store.createObject("RelatedObject") as StoreObject;
    
        // Add the related object to the array
        objectArrayObject = store.updateObject((obj) => {
          obj.items.push(relatedObject);
        }, objectArrayObject);
    
        // Update the object references
        objectArrayObject = store.getObjectByUUID((objectArrayObject as StoreObject)[uuid])!;
        relatedObject = store.getObjectByUUID((relatedObject as StoreObject)[uuid])!;
    
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
        store.subscribe(beforeUpdateHandler, "before", "update", "ObjectArrayType", "items");
        store.subscribe(afterUpdateHandler, "after", "update", "ObjectArrayType", "items");
    
        // Perform the pop operation using updateObject
        objectArrayObject = store.updateObject((obj) => {
          obj.items.pop();
        }, objectArrayObject);
    
        // Update the object references
        objectArrayObject = store.getObjectByUUID((objectArrayObject as StoreObject)[uuid])!;
        relatedObject = store.getObjectByUUID((relatedObject as StoreObject)[uuid])!;
    
        // Verify the final state of the array
        expect(objectArrayObject.items).toEqual([]);
    
        // Verify the inverse property
        expect(relatedObject.parent).toBeUndefined();
      });

      test("should emit events and update inverse properties for splice operation on array of objects", () => {
        // Create related objects and add them to the array
        let relatedObject1 = store.createObject("RelatedObject") as StoreObject;
        let relatedObject2 = store.createObject("RelatedObject") as StoreObject;
    
        // Add the related objects to the array
        objectArrayObject = store.updateObject((obj) => {
          obj.items.push(relatedObject1, relatedObject2);
        }, objectArrayObject);
    
        // Update the object references
        objectArrayObject = store.getObjectByUUID((objectArrayObject as StoreObject)[uuid])!;
        relatedObject1 = store.getObjectByUUID((relatedObject1 as StoreObject)[uuid])!;
        relatedObject2 = store.getObjectByUUID((relatedObject2 as StoreObject)[uuid])!;
    
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
        store.subscribe(beforeUpdateHandler, "before", "update", "ObjectArrayType", "items");
        store.subscribe(afterUpdateHandler, "after", "update", "ObjectArrayType", "items");
    
        // Perform the splice operation using updateObject
        objectArrayObject = store.updateObject((obj) => {
          obj.items.splice(0, 1); // Remove the first element
        }, objectArrayObject);
    
        // Update the object references
        objectArrayObject = store.getObjectByUUID((objectArrayObject as StoreObject)[uuid])!;
        relatedObject1 = store.getObjectByUUID((relatedObject1 as StoreObject)[uuid])!;
    
        // Verify the final state of the array
        expect(objectArrayObject.items).toEqual([relatedObject2]);
    
        // Verify the inverse property of the removed object
        expect(relatedObject1.parent).toBeUndefined(); // Use undefined to nullify the inverse property
      });

      test("should emit events and update inverse properties for unshift operation on array of objects", () => {
        // Create a related object
        let relatedObject = store.createObject("RelatedObject") as StoreObject;
    
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
        store.subscribe(beforeUpdateHandler, "before", "update", "ObjectArrayType", "items");
        store.subscribe(afterUpdateHandler, "after", "update", "ObjectArrayType", "items");
    
        // Perform the unshift operation using updateObject
        objectArrayObject = store.updateObject((obj) => {
          obj.items.unshift(relatedObject);
        }, objectArrayObject);
    
        // Update the object references
        objectArrayObject = store.getObjectByUUID((objectArrayObject as StoreObject)[uuid])!;
        relatedObject = store.getObjectByUUID((relatedObject as StoreObject)[uuid])!;
    
        // Verify the final state of the array
        expect(objectArrayObject.items).toEqual([relatedObject]);
    
        // Verify the inverse property
        expect(relatedObject.parent).toBe(objectArrayObject);
      });

      test("should emit events and update inverse properties for shift operation on array of objects", () => {
        // Create related objects and add them to the array
        let relatedObject1 = store.createObject("RelatedObject") as StoreObject;
        let relatedObject2 = store.createObject("RelatedObject") as StoreObject;
    
        // Add the related objects to the array
        objectArrayObject = store.updateObject((obj) => {
          obj.items.push(relatedObject1, relatedObject2);
        }, objectArrayObject);
    
        // Update the object references
        objectArrayObject = store.getObjectByUUID((objectArrayObject as StoreObject)[uuid])!;
        relatedObject1 = store.getObjectByUUID((relatedObject1 as StoreObject)[uuid])!;
        relatedObject2 = store.getObjectByUUID((relatedObject2 as StoreObject)[uuid])!;
    
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
        store.subscribe(beforeUpdateHandler, "before", "update", "ObjectArrayType", "items");
        store.subscribe(afterUpdateHandler, "after", "update", "ObjectArrayType", "items");
    
        // Perform the shift operation using updateObject
        objectArrayObject = store.updateObject((obj) => {
          obj.items.shift(); // Remove the first element
        }, objectArrayObject);
    
        // Update the object references
        objectArrayObject = store.getObjectByUUID((objectArrayObject as StoreObject)[uuid])!;
        relatedObject1 = store.getObjectByUUID((relatedObject1 as StoreObject)[uuid])!;
    
        // Verify the final state of the array
        expect(objectArrayObject.items).toEqual([relatedObject2]);
    
        // Verify the inverse property of the removed object
        expect(relatedObject1.parent).toBeUndefined(); // Use undefined to nullify the inverse property
      });
  });