import { createStore } from "../../store/createStore";
import { StoreObject, uuid } from "../../store/InternalTypes";
import { EventPayload, Result } from "../../events/EventTypes";
import { getEventPattern } from "../../events/SubscriptionManager";
import { RegistryService } from "../../registry/RegistryService";
import { Namespace, RegistryMetadata } from "../../registry/NamespaceMetadata";
import { ObjectTypeMeta, PropertyMeta, ArrayTypeMeta, TypeMeta } from "../../registry/TypeDefinitions";
import { createTestRegistry } from "../utils/testRegistrySetup";

// Define the Article interface
interface IArticle {
  title: string;
  keywords: string[];
}

// Create test schema using the new registry system
function createTestNamespace(): Namespace {
  // Create the array type for keywords
  const keywordArrayTypeMeta: ArrayTypeMeta = {
    qName: "/test/KeywordArray",
    category: "complex",
    kind: "array",
    elementType: "/std/string"
  };

  // Create the Article object type that has keywords array property
  const articleTypeMeta: ObjectTypeMeta = {
    qName: "/test/Article",
    category: "complex",
    kind: "object",
    properties: new Map([
      ["title", {
        name: "title",
        typeRef: "/std/string",
        optional: false
      } as PropertyMeta],
      ["keywords", {
        name: "keywords",
        typeRef: "/test/KeywordArray",
        optional: false
      } as PropertyMeta]
    ])
  };

  return {
    qName: "/test",
    version: "1.0.0",
    types: new Map<string, TypeMeta>([
      ["KeywordArray", keywordArrayTypeMeta],
      ["Article", articleTypeMeta]
    ]),
    exports: ["KeywordArray", "Article"],
    imports: new Map()
  };
}

function createTestStore() {
  const registry = createTestRegistry();
  const namespace = createTestNamespace();
  
  registry.importNamespace(namespace);
  return createStore(registry);
}

describe("ArrayHandler Events", () => {
  let store: ReturnType<typeof createStore>;
  let articleObject: IArticle;

  beforeEach(() => {
    // Initialize the store with the new registry system
    store = createTestStore();

    // Create an Article object with keywords array property
    articleObject = store.objects.create<IArticle>("/test/Article", { 
      title: "Test Article",
      keywords: [] 
    });

    // Retrieve the latest version of the object
    articleObject = store.objects.findByUUID<IArticle>((articleObject as any)[uuid])!;
  });

  test("should emit events and track changes for push operation on array of simple values", () => {
    // Mock before.update handler
    const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("before.update.Article.keywords");
      expect(event.changes?.[0].changeType).toBe("add");
      expect(event.changes?.[0].index).toBe(0);
      expect(event.changes?.[0].newValue).toBe("javascript");
      return { success: true }; // Simulate a successful result
    });

    // Mock after.update handler
    const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("after.update.Article.keywords");
      expect(event.changes?.[0].changeType).toBe("add");
      expect(event.changes?.[0].index).toBe(0);
      expect(event.changes?.[0].newValue).toBe("javascript");
      return { success: true }; // Simulate a successful result
    });

    // Subscribe to events
    store.events.subscribe(beforeUpdateHandler, "before", "update", "Article", "keywords");
    store.events.subscribe(afterUpdateHandler, "after", "update", "Article", "keywords");

    // Perform the push operation using updateObject
    articleObject = store.objects.update((obj) => {
      obj.keywords.push("javascript");
    }, articleObject);

    // Verify that the handlers were called
    expect(beforeUpdateHandler).toHaveBeenCalledTimes(1);
    expect(afterUpdateHandler).toHaveBeenCalledTimes(1);

    // Verify the final state of the array
    expect(articleObject.keywords).toEqual(["javascript"]);
  });

  
  test("should emit events and track changes for pop operation on array of simple values", () => {
    // Initialize the array with values
    articleObject = store.objects.update((obj) => {
      obj.keywords.push("react", "typescript", "javascript");
    }, articleObject);

    // Mock before.update handler
    const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("before.update.SimpleArrayType.numbers");
      expect(event.changes?.[0].changeType).toBe("remove");
      expect(event.changes?.[0].index).toBe(2); // Last index
      expect(event.changes?.[0].oldValue).toBe("javascript"); // Last value
      return { success: true }; // Simulate a successful result
    });

    // Mock after.update handler
    const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("after.update.SimpleArrayType.numbers");
      expect(event.changes?.[0].changeType).toBe("remove");
      expect(event.changes?.[0].index).toBe(2); // Last index
      expect(event.changes?.[0].oldValue).toBe("javascript"); // Last value
      return { success: true }; // Simulate a successful result
    });

    // Subscribe to events
    store.events.subscribe(beforeUpdateHandler, "before", "update", "SimpleArrayType", "numbers");
    store.events.subscribe(afterUpdateHandler, "after", "update", "SimpleArrayType", "numbers");

    // Perform the pop operation using updateObject
    articleObject = store.objects.update((obj) => {
      obj.keywords.pop();
    }, articleObject);

    // Verify that the handlers were called
    expect(beforeUpdateHandler).toHaveBeenCalledTimes(1);
    expect(afterUpdateHandler).toHaveBeenCalledTimes(1);

    // Verify the final state of the array
    expect(articleObject.keywords).toEqual(["react", "typescript"]);
  });

  test("should emit events and track changes for pop operation on array of simple values", () => {
    // Initialize the array with values
    articleObject = store.objects.update((obj) => {
      obj.keywords.push("react", "typescript", "javascript");
    }, articleObject);

    // Mock before.update handler
    const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("before.update.SimpleArrayType.numbers");
      expect(event.changes?.[0].changeType).toBe("remove");
      expect(event.changes?.[0].index).toBe(2); // Last index
      expect(event.changes?.[0].oldValue).toBe("javascript"); // Last value
      return { success: true }; // Simulate a successful result
    });

    // Mock after.update handler
    const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("after.update.SimpleArrayType.numbers");
      expect(event.changes?.[0].changeType).toBe("remove");
      expect(event.changes?.[0].index).toBe(2); // Last index
      expect(event.changes?.[0].oldValue).toBe("javascript"); // Last value
      return { success: true }; // Simulate a successful result
    });

    // Subscribe to events
    store.events.subscribe(beforeUpdateHandler, "before", "update", "SimpleArrayType", "numbers");
    store.events.subscribe(afterUpdateHandler, "after", "update", "SimpleArrayType", "numbers");

    // Perform the pop operation using updateObject
    articleObject = store.objects.update((obj) => {
      obj.keywords.pop();
    }, articleObject);

    // Verify that the handlers were called
    expect(beforeUpdateHandler).toHaveBeenCalledTimes(1);
    expect(afterUpdateHandler).toHaveBeenCalledTimes(1);

    // Verify the final state of the array
    expect(articleObject.keywords).toEqual(["react", "typescript"]);
  });

  test("should emit events and track changes for unshift operation on array of simple values", () => {
    // Initialize the array with values
    articleObject = store.objects.update((obj) => {
      obj.keywords.push("typescript", "javascript");
    }, articleObject);

    // Mock before.update handler
    const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("before.update.SimpleArrayType.numbers");
      expect(event.changes?.[0].changeType).toBe("add");
      expect(event.changes?.[0].index).toBe(0); // First index
      expect(event.changes?.[0].newValue).toBe("react"); // New first value
      return { success: true }; // Simulate a successful result
    });

    // Mock after.update handler
    const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("after.update.SimpleArrayType.numbers");
      expect(event.changes?.[0].changeType).toBe("add");
      expect(event.changes?.[0].index).toBe(0); // First index
      expect(event.changes?.[0].newValue).toBe("react"); // New first value
      return { success: true }; // Simulate a successful result
    });

    // Subscribe to events
    store.events.subscribe(beforeUpdateHandler, "before", "update", "SimpleArrayType", "numbers");
    store.events.subscribe(afterUpdateHandler, "after", "update", "SimpleArrayType", "numbers");

    // Perform the unshift operation using updateObject
    articleObject = store.objects.update((obj) => {
      obj.keywords.unshift("react");
    }, articleObject);

    // Verify that the handlers were called
    expect(beforeUpdateHandler).toHaveBeenCalledTimes(1);
    expect(afterUpdateHandler).toHaveBeenCalledTimes(1);

    // Verify the final state of the array
    expect(articleObject.keywords).toEqual(["react", "typescript", "javascript"]);
  });

  test("should emit events and track changes for splice operation on array of simple values", () => {
    // Initialize the array with values
    articleObject = store.objects.update((obj) => {
      obj.keywords.push("react", "typescript", "javascript", "node");
    }, articleObject);

    // Mock before.update handler
    const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("before.update.SimpleArrayType.numbers");
      expect(event.changes?.[0].changeType).toBe("remove");
      expect(event.changes?.[0].index).toBe(1); // Index of the removed element
      expect(event.changes?.[0].oldValue).toBe("typescript"); // Removed value
      expect(event.changes?.[1].changeType).toBe("remove");
      expect(event.changes?.[1].index).toBe(2); // Index of the removed element
      expect(event.changes?.[1].oldValue).toBe("javascript"); // Removed value
      return { success: true }; // Simulate a successful result
    });

    // Mock after.update handler
    const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("after.update.SimpleArrayType.numbers");
      expect(event.changes?.[0].changeType).toBe("remove");
      expect(event.changes?.[0].index).toBe(1); // Index of the removed element
      expect(event.changes?.[0].oldValue).toBe("typescript"); // Removed value
      expect(event.changes?.[1].changeType).toBe("remove");
      expect(event.changes?.[1].index).toBe(2); // Index of the removed element
      expect(event.changes?.[1].oldValue).toBe("javascript"); // Removed value
      return { success: true }; // Simulate a successful result
    });

    // Subscribe to events
    store.events.subscribe(beforeUpdateHandler, "before", "update", "SimpleArrayType", "numbers");
    store.events.subscribe(afterUpdateHandler, "after", "update", "SimpleArrayType", "numbers");

    // Perform the splice operation using updateObject
    articleObject = store.objects.update((obj) => {
      obj.keywords.splice(1, 2); // Remove 2 elements starting from index 1
    }, articleObject);

    // Verify that the handlers were called
    expect(beforeUpdateHandler).toHaveBeenCalledTimes(1);
    expect(afterUpdateHandler).toHaveBeenCalledTimes(1);

    // Verify the final state of the array
    expect(articleObject.keywords).toEqual(["react", "node"]);
  });

  test("should emit events and track changes for sort operation on array of simple values", () => {
    // Initialize the array with values
    articleObject = store.objects.update((obj) => {
      obj.keywords.push("javascript", "react", "typescript");
    }, articleObject);

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
    articleObject = store.objects.update((obj) => {
      obj.keywords.sort((a:string, b:string) => a.localeCompare(b)); // Sort in ascending order
    }, articleObject);

    // Verify that the handlers were called
    expect(beforeUpdateHandler).toHaveBeenCalledTimes(1);
    expect(afterUpdateHandler).toHaveBeenCalledTimes(1);

    // Verify the final state of the array
    expect(articleObject.keywords).toEqual(["javascript", "react", "typescript"]);
  });

  test("should emit events and track changes for reverse operation on array of simple values", () => {
    // Initialize the array with values
    articleObject = store.objects.update((obj) => {
      obj.keywords.push("react", "typescript", "javascript");
    }, articleObject);

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
    articleObject = store.objects.update((obj) => {
      obj.keywords.reverse(); // Reverse the array
    }, articleObject);

    // Verify that the handlers were called
    expect(beforeUpdateHandler).toHaveBeenCalledTimes(1);
    expect(afterUpdateHandler).toHaveBeenCalledTimes(1);

    // Verify the final state of the array
    expect(articleObject.keywords).toEqual(["javascript", "typescript", "react"]);
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

  // Create the array type for RelatedObject
  const relatedObjectArrayTypeMeta: ArrayTypeMeta = {
    qName: "/test/RelatedObjectArray",
    category: "complex",
    kind: "array",
    elementType: "/test/RelatedObject"
  };

  const objectArrayTypeMeta: ObjectTypeMeta = {
    qName: "/test/ObjectArrayType",
    category: "complex",
    kind: "object",
    properties: new Map([
      ["items", {
        name: "items",
        typeRef: "/test/RelatedObjectArray",
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
    types: new Map<string, TypeMeta>([
      ["RelatedObjectArray", relatedObjectArrayTypeMeta],
      ["ObjectArrayType", objectArrayTypeMeta],
      ["RelatedObject", relatedObjectTypeMeta]
    ]),
    exports: ["RelatedObjectArray", "ObjectArrayType", "RelatedObject"],
    imports: new Map()
  };
}

function createObjectArrayStore() {
  const registry = createTestRegistry();
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
        let relatedObject = store.objects.create("/test/RelatedObject") as StoreObject;
    
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