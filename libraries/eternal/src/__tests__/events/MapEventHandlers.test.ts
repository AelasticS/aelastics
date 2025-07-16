import { createStore } from "../../store/createStore"
import { StoreObject, uuid } from "../../store/InternalTypes"
import { EventPayload, Result } from "../../events/EventTypes"
import { getEventPattern } from "../../events/SubscriptionManager"
import { RegistryService } from "../../registry/RegistryService"
import { Namespace, RegistryMetadata } from "../../registry/NamespaceMetadata"
import { ObjectTypeMeta, PropertyMeta } from "../../registry/TypeDefinitions"

// Create test schema using the new registry system
function createTestNamespace(): Namespace {
  const userTypeMeta: ObjectTypeMeta = {
    qName: "/test/User",
    category: "complex",
    kind: "object",
    properties: new Map([
      ["preferences", {
        name: "preferences",
        typeRef: "/std/map<string, /std/string>",
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
  const namespace = createTestNamespace();
  
  registry.importNamespace(namespace);
  return createStore(registry);
}

describe("Map Event Handlers - User Preferences", () => {
  let store: ReturnType<typeof createStore>
  let userObject: StoreObject

  beforeEach(() => {
    // Initialize the store with the new registry system
    store = createTestStore()

    // Create a User object
    userObject = store.objects.create("/test/User") as StoreObject
  })

  test("should emit events and track changes for set operation on preferences map", () => {
    // Mock before.update handler
    const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("before.update.User.preferences")
      expect(event.changes?.[0].changeType).toBe("add")
      expect(event.changes?.[0].key).toBe("theme")
      expect(event.changes?.[0].newValue).toBe("dark")
      return { success: true } // Simulate a successful result
    })

    // Mock after.update handler
    const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("after.update.User.preferences")
      expect(event.changes?.[0].changeType).toBe("add")
      expect(event.changes?.[0].key).toBe("theme")
      expect(event.changes?.[0].newValue).toBe("dark")
      return { success: true } // Simulate a successful result
    })

    // Subscribe to events
    store.events.subscribe(beforeUpdateHandler, "before", "update", "User", "preferences")
    store.events.subscribe(afterUpdateHandler, "after", "update", "User", "preferences")

    // Perform the set operation using updateObject
    userObject = store.objects.update((obj) => {
      obj.preferences.set("theme", "dark")
    }, userObject)

    // Update the object reference
    userObject = store.objects.findByUUID<StoreObject>((userObject as StoreObject)[uuid])!

    // Verify the final state of the map
    expect(userObject.preferences.get("theme")).toBe("dark")

    // Verify that the handlers were called
    expect(beforeUpdateHandler).toHaveBeenCalledTimes(1)
    expect(afterUpdateHandler).toHaveBeenCalledTimes(1)
  })

  test("should emit events and track changes for delete operation on preferences map", () => {
    // Initialize the map with a key-value pair
    userObject = store.objects.update((obj) => {
      obj.preferences.set("theme", "dark");
    }, userObject);

    // Update the object reference
    userObject = store.objects.findByUUID<StoreObject>((userObject as StoreObject)[uuid])!;

    // Get the UUID of the map entry key
    const keyToDelete = "theme";

    // Mock before.update handler
    const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("before.update.User.preferences");
      expect(event.changes?.[0].changeType).toBe("remove");
      expect(event.changes?.[0].key).toBe(keyToDelete);
      expect(event.changes?.[0].oldValue).toBe("dark");
      return { success: true }; // Simulate a successful result
    });

    // Mock after.update handler
    const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("after.update.User.preferences");
      expect(event.changes?.[0].changeType).toBe("remove");
      expect(event.changes?.[0].key).toBe(keyToDelete);
      expect(event.changes?.[0].oldValue).toBe("dark");
      return { success: true }; // Simulate a successful result
    });

    // Subscribe to events
    store.events.subscribe(beforeUpdateHandler, "before", "update", "User", "preferences");
    store.events.subscribe(afterUpdateHandler, "after", "update", "User", "preferences");

    // Perform the delete operation using updateObject
    userObject = store.objects.update((obj) => {
      obj.preferences.delete(keyToDelete);
    }, userObject);

    // Update the object reference
    userObject = store.objects.findByUUID<StoreObject>((userObject as StoreObject)[uuid])!;

    // Verify the final state of the map
    expect(userObject.preferences.has(keyToDelete)).toBe(false);

    // Verify that the handlers were called
    expect(beforeUpdateHandler).toHaveBeenCalledTimes(1);
    expect(afterUpdateHandler).toHaveBeenCalledTimes(1);
  });

  test("should emit events and track changes for clear operation on preferences map", () => {
    // Initialize the map with multiple key-value pairs
    userObject = store.objects.update((obj) => {
      obj.preferences.set("theme", "dark");
      obj.preferences.set("language", "en-US");
    }, userObject);

    // Update the object reference
    userObject = store.objects.findByUUID<StoreObject>((userObject as StoreObject)[uuid])!;

    // Mock before.update handler
    const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("before.update.User.preferences");

      // Verify changes for each removed key-value pair
      expect(event.changes?.length).toBe(2); // Two entries are being removed
      expect(event.changes?.[0].changeType).toBe("remove");
      expect(event.changes?.[0].key).toBe("theme");
      expect(event.changes?.[0].oldValue).toBe("dark");

      expect(event.changes?.[1].changeType).toBe("remove");
      expect(event.changes?.[1].key).toBe("language");
      expect(event.changes?.[1].oldValue).toBe("en-US");

      return { success: true }; // Simulate a successful result
    });

    // Mock after.update handler
    const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("after.update.User.preferences");

      // Verify changes for each removed key-value pair
      expect(event.changes?.length).toBe(2); // Two entries are being removed
      expect(event.changes?.[0].changeType).toBe("remove");
      expect(event.changes?.[0].key).toBe("theme");
      expect(event.changes?.[0].oldValue).toBe("dark");

      expect(event.changes?.[1].changeType).toBe("remove");
      expect(event.changes?.[1].key).toBe("language");
      expect(event.changes?.[1].oldValue).toBe("en-US");

      return { success: true }; // Simulate a successful result
    });

    // Subscribe to events
    store.events.subscribe(beforeUpdateHandler, "before", "update", "User", "preferences");
    store.events.subscribe(afterUpdateHandler, "after", "update", "User", "preferences");

    // Perform the clear operation using updateObject
    userObject = store.objects.update((obj) => {
      obj.preferences.clear();
    }, userObject);

    // Update the object reference
    userObject = store.objects.findByUUID<StoreObject>((userObject as StoreObject)[uuid])!;

    // Verify the final state of the map
    expect(userObject.preferences.size).toBe(0);

    // Verify that the handlers were called
    expect(beforeUpdateHandler).toHaveBeenCalledTimes(1);
    expect(afterUpdateHandler).toHaveBeenCalledTimes(1);
  });

  test("should emit events and track changes for setting a value when the key already exists", () => {
    // Initialize the map with an existing key-value pair
    userObject = store.objects.update((obj) => {
      obj.preferences.set("theme", "dark");
    }, userObject);

    // Update the object reference
    userObject = store.objects.findByUUID<StoreObject>((userObject as StoreObject)[uuid])!;

    // Mock before.update handler
    const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("before.update.User.preferences");

      // Verify changes for the old value removal
      expect(event.changes?.[0].changeType).toBe("remove");
      expect(event.changes?.[0].key).toBe("theme");
      expect(event.changes?.[0].oldValue).toBe("dark");

      // Verify changes for the new value addition
      expect(event.changes?.[1].changeType).toBe("add");
      expect(event.changes?.[1].key).toBe("theme");
      expect(event.changes?.[1].newValue).toBe("light");

      return { success: true }; // Simulate a successful result
    });

    // Mock after.update handler
    const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Verify the event properties
      expect(getEventPattern(event)).toBe("after.update.User.preferences");

      // Verify changes for the old value removal
      expect(event.changes?.[0].changeType).toBe("remove");
      expect(event.changes?.[0].key).toBe("theme");
      expect(event.changes?.[0].oldValue).toBe("dark");

      // Verify changes for the new value addition
      expect(event.changes?.[1].changeType).toBe("add");
      expect(event.changes?.[1].key).toBe("theme");
      expect(event.changes?.[1].newValue).toBe("light");

      return { success: true }; // Simulate a successful result
    });

    // Subscribe to events
    store.events.subscribe(beforeUpdateHandler, "before", "update", "User", "preferences");
    store.events.subscribe(afterUpdateHandler, "after", "update", "User", "preferences");

    // Perform the set operation using updateObject
    userObject = store.objects.update((obj) => {
      obj.preferences.set("theme", "light"); // Overwrite the existing key
    }, userObject);

    // Update the object reference
    userObject = store.objects.findByUUID<StoreObject>((userObject as StoreObject)[uuid])!;

    // Verify the final state of the map
    expect(userObject.preferences.get("theme")).toBe("light");

    // Verify that the handlers were called
    expect(beforeUpdateHandler).toHaveBeenCalledTimes(1);
    expect(afterUpdateHandler).toHaveBeenCalledTimes(1);
  });

  test("should not emit events or change the map when deleting a non-existent key", () => {
    // Mock before.update handler
    const beforeUpdateHandler = jest.fn();

    // Mock after.update handler
    const afterUpdateHandler = jest.fn();

    // Subscribe to events
    store.events.subscribe(beforeUpdateHandler, "before", "update", "User", "preferences");
    store.events.subscribe(afterUpdateHandler, "after", "update", "User", "preferences");

    // Perform the delete operation using updateObject
    userObject = store.objects.update((obj) => {
      obj.preferences.delete("nonExistentKey"); // Attempt to delete a non-existent key
    }, userObject);

    // Update the object reference
    userObject = store.objects.findByUUID<StoreObject>((userObject as StoreObject)[uuid])!;

    // Verify the map remains unchanged
    expect(userObject.preferences.size).toBe(0);

    // Verify that no events were emitted
    expect(beforeUpdateHandler).not.toHaveBeenCalled();
    expect(afterUpdateHandler).not.toHaveBeenCalled();
  });
  test("should not emit events or change the map when setting the same value for an existing key", () => {
    // Initialize the map with an existing key-value pair
    userObject = store.objects.update((obj) => {
      obj.preferences.set("theme", "dark");
    }, userObject);

    // Update the object reference
    userObject = store.objects.findByUUID<StoreObject>((userObject as StoreObject)[uuid])!;

    // Mock before.update handler
    const beforeUpdateHandler = jest.fn();

    // Mock after.update handler
    const afterUpdateHandler = jest.fn();

    // Subscribe to events
    store.events.subscribe(beforeUpdateHandler, "before", "update", "User", "preferences");
    store.events.subscribe(afterUpdateHandler, "after", "update", "User", "preferences");

    // Perform the set operation using updateObject
    userObject = store.objects.update((obj) => {
      obj.preferences.set("theme", "dark"); // Set the same value for the existing key
    }, userObject);

    // Update the object reference
    userObject = store.objects.findByUUID<StoreObject>((userObject as StoreObject)[uuid])!;

    // Verify the map remains unchanged
    expect(userObject.preferences.get("theme")).toBe("dark");

    // Verify that no events were emitted
    expect(beforeUpdateHandler).not.toHaveBeenCalled();
    expect(afterUpdateHandler).not.toHaveBeenCalled();
  });

  test("should throw an error and cancel the operation when before.update handler returns { success: false }", () => {
    // Initialize the map with an existing key-value pair
    userObject = store.objects.update((obj) => {
      obj.preferences.set("theme", "dark");
    }, userObject);

    // Update the object reference
    userObject = store.objects.findByUUID<StoreObject>((userObject as StoreObject)[uuid])!;

    // Mock before.update handler to cancel the operation
    const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Simulate canceling the operation
      return { success: false, errors: [{ code: 1001, message: "Operation was canceled by the handler." }] };
    });

    // Mock after.update handler
    const afterUpdateHandler = jest.fn();

    // Subscribe to events
    store.events.subscribe(beforeUpdateHandler, "before", "update", "User", "preferences");
    store.events.subscribe(afterUpdateHandler, "after", "update", "User", "preferences");

    // Attempt to perform the set operation using updateObject and expect an error
    expect(() => {
      userObject = store.objects.update((obj) => {
        obj.preferences.set("theme", "light"); // Attempt to overwrite the value
      }, userObject);
    }).toThrowError("Operation was canceled by the handler.");

    // Update the object reference
    userObject = store.objects.findByUUID<StoreObject>((userObject as StoreObject)[uuid])!;

    // Verify the map remains unchanged
    expect(userObject.preferences.get("theme")).toBe("dark");

    // Verify that the before.update handler was called
    expect(beforeUpdateHandler).toHaveBeenCalledTimes(1);

    // Verify that the after.update handler was not called
    expect(afterUpdateHandler).not.toHaveBeenCalled();
  });

})
