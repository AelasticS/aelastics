import { createStore } from "../../store/StoreFactory"
import { initializeSchemaRegistry } from "../../meta/SchemaRegistry"
import { SchemaRegistry } from "../../meta/InternalSchema"
import { SchemaDescription } from "../../meta/ExternalSchema"
import { EternalObject } from "../../handlers/InternalTypes"
import { EventPayload, Result } from "../../events/EventTypes"
import { getEventPattern } from "../../events/SubscriptionManager"

const schemas: SchemaDescription[] = [
    {
      qName: "/test",
      version: "1.0",
      types: {
        User: {
          qName: "User",
          properties: {
            roles: {
              qName: "roles",
              type: "set",
              itemType: "string", // Roles are strings (e.g., "admin", "editor")
            },
          },
        },
      },
      roles: {},
      export: ["User"],
      import: {},
    },
  ];

  describe("Set Event Handlers - User Roles", () => {
    let store: ReturnType<typeof createStore>;
    let userObject: EternalObject;
  
    beforeEach(() => {
      // Initialize the schema registry and store
      const schemaRegistry: SchemaRegistry = initializeSchemaRegistry(schemas) as SchemaRegistry;
      store = createStore(schemaRegistry.schemas.get("/test")!);
  
      // Create a User object
      userObject = store.createObject("User") as EternalObject;
  
      // Retrieve the latest version of the object
      userObject = store.getObject((userObject as EternalObject).uuid)!;
    });

    test("should emit events and track changes for add operation on roles set", () => {
        // Mock before.update handler
        const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
          // Verify the event properties
          expect(getEventPattern(event)).toBe("before.update.User.roles");
          expect(event.changes?.[0].changeType).toBe("add");
          expect(event.changes?.[0].newValue).toBe("admin");
          return { success: true }; // Simulate a successful result
        });
    
        // Mock after.update handler
        const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
          // Verify the event properties
          expect(getEventPattern(event)).toBe("after.update.User.roles");
          expect(event.changes?.[0].changeType).toBe("add");
          expect(event.changes?.[0].newValue).toBe("admin");
          return { success: true }; // Simulate a successful result
        });
    
        // Subscribe to events
        store.subscribe(beforeUpdateHandler, "before", "update", "User", "roles");
        store.subscribe(afterUpdateHandler, "after", "update", "User", "roles");
    
        // Perform the add operation using updateObject
        userObject = store.updateObject((obj) => {
          obj.roles.add("admin");
        }, userObject);
    
        // Update the object reference
        userObject = store.getObject((userObject as EternalObject).uuid)!;
    
        // Verify the final state of the set
        expect(userObject.roles.has("admin")).toBe(true);
    
        // Verify that the handlers were called
        expect(beforeUpdateHandler).toHaveBeenCalledTimes(1);
        expect(afterUpdateHandler).toHaveBeenCalledTimes(1);
      });
      test("should emit events and track changes for delete operation on roles set", () => {
        // Initialize the set with a value
        userObject = store.updateObject((obj) => {
          obj.roles.add("admin");
        }, userObject);
    
        // Update the object reference
        userObject = store.getObject((userObject as EternalObject).uuid)!;
    
        // Mock before.update handler
        const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
          // Verify the event properties
          expect(getEventPattern(event)).toBe("before.update.User.roles");
          expect(event.changes?.[0].changeType).toBe("remove");
          expect(event.changes?.[0].oldValue).toBe("admin");
          return { success: true }; // Simulate a successful result
        });
    
        // Mock after.update handler
        const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
          // Verify the event properties
          expect(getEventPattern(event)).toBe("after.update.User.roles");
          expect(event.changes?.[0].changeType).toBe("remove");
          expect(event.changes?.[0].oldValue).toBe("admin");
          return { success: true }; // Simulate a successful result
        });
    
        // Subscribe to events
        store.subscribe(beforeUpdateHandler, "before", "update", "User", "roles");
        store.subscribe(afterUpdateHandler, "after", "update", "User", "roles");
    
        // Perform the delete operation using updateObject
        userObject = store.updateObject((obj) => {
          obj.roles.delete("admin");
        }, userObject);
    
        // Update the object reference
        userObject = store.getObject((userObject as EternalObject).uuid)!;
    
        // Verify the final state of the set
        expect(userObject.roles.has("admin")).toBe(false);
    
        // Verify that the handlers were called
        expect(beforeUpdateHandler).toHaveBeenCalledTimes(1);
        expect(afterUpdateHandler).toHaveBeenCalledTimes(1);
      });

      test("should emit events and track changes for clearing the roles set", () => {
        // Initialize the set with multiple values
        userObject = store.updateObject((obj) => {
          obj.roles.add("admin");
          obj.roles.add("editor");
        }, userObject);
    
        // Update the object reference
        userObject = store.getObject((userObject as EternalObject).uuid)!;
    
        // Mock before.update handler
        const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
          // Verify the event properties
          expect(getEventPattern(event)).toBe("before.update.User.roles");
    
          // Verify changes for each removed value
          expect(event.changes?.length).toBe(2); // Two entries are being removed
          expect(event.changes?.[0].changeType).toBe("remove");
          expect(event.changes?.[0].oldValue).toBe("admin");
    
          expect(event.changes?.[1].changeType).toBe("remove");
          expect(event.changes?.[1].oldValue).toBe("editor");
    
          return { success: true }; // Simulate a successful result
        });
    
        // Mock after.update handler
        const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
          // Verify the event properties
          expect(getEventPattern(event)).toBe("after.update.User.roles");
    
          // Verify changes for each removed value
          expect(event.changes?.length).toBe(2); // Two entries are being removed
          expect(event.changes?.[0].changeType).toBe("remove");
          expect(event.changes?.[0].oldValue).toBe("admin");
    
          expect(event.changes?.[1].changeType).toBe("remove");
          expect(event.changes?.[1].oldValue).toBe("editor");
    
          return { success: true }; // Simulate a successful result
        });
    
        // Subscribe to events
        store.subscribe(beforeUpdateHandler, "before", "update", "User", "roles");
        store.subscribe(afterUpdateHandler, "after", "update", "User", "roles");
    
        // Perform the clear operation using updateObject
        userObject = store.updateObject((obj) => {
          obj.roles.clear();
        }, userObject);
    
        // Update the object reference
        userObject = store.getObject((userObject as EternalObject).uuid)!;
    
        // Verify the final state of the set
        expect(userObject.roles.size).toBe(0);
    
        // Verify that the handlers were called
        expect(beforeUpdateHandler).toHaveBeenCalledTimes(1);
        expect(afterUpdateHandler).toHaveBeenCalledTimes(1);
      });

      test("should not emit events or change the set when adding a duplicate value", () => {
        // Initialize the set with a value
        userObject = store.updateObject((obj) => {
          obj.roles.add("admin");
        }, userObject);
    
        // Update the object reference
        userObject = store.getObject((userObject as EternalObject).uuid)!;
    
        // Mock before.update handler
        const beforeUpdateHandler = jest.fn();
    
        // Mock after.update handler
        const afterUpdateHandler = jest.fn();
    
        // Subscribe to events
        store.subscribe(beforeUpdateHandler, "before", "update", "User", "roles");
        store.subscribe(afterUpdateHandler, "after", "update", "User", "roles");
    
        // Attempt to add a duplicate value using updateObject
        userObject = store.updateObject((obj) => {
          obj.roles.add("admin"); // Add the same value again
        }, userObject);
    
        // Update the object reference
        userObject = store.getObject((userObject as EternalObject).uuid)!;
    
        // Verify the set remains unchanged
        expect(userObject.roles.size).toBe(1);
        expect(userObject.roles.has("admin")).toBe(true);
    
        // Verify that no events were emitted
        expect(beforeUpdateHandler).not.toHaveBeenCalled();
        expect(afterUpdateHandler).not.toHaveBeenCalled();
      });

      test("should not emit events or change the set when deleting a non-existent value", () => {
        // Initialize the set with a value
        userObject = store.updateObject((obj) => {
          obj.roles.add("admin");
        }, userObject);
    
        // Update the object reference
        userObject = store.getObject((userObject as EternalObject).uuid)!;
    
        // Mock before.update handler
        const beforeUpdateHandler = jest.fn();
    
        // Mock after.update handler
        const afterUpdateHandler = jest.fn();
    
        // Subscribe to events
        store.subscribe(beforeUpdateHandler, "before", "update", "User", "roles");
        store.subscribe(afterUpdateHandler, "after", "update", "User", "roles");
    
        // Attempt to delete a non-existent value using updateObject
        userObject = store.updateObject((obj) => {
          obj.roles.delete("editor"); // Attempt to delete a value that doesn't exist
        }, userObject);
    
        // Update the object reference
        userObject = store.getObject((userObject as EternalObject).uuid)!;
    
        // Verify the set remains unchanged
        expect(userObject.roles.size).toBe(1);
        expect(userObject.roles.has("admin")).toBe(true);
    
        // Verify that no events were emitted
        expect(beforeUpdateHandler).not.toHaveBeenCalled();
        expect(afterUpdateHandler).not.toHaveBeenCalled();
      });

      test("should cancel the operation when before.update handler returns { success: false }", () => {
        // Initialize the set with a value
        userObject = store.updateObject((obj) => {
          obj.roles.add("admin");
        }, userObject);
    
        // Update the object reference
        userObject = store.getObject((userObject as EternalObject).uuid)!;
    
        // Mock before.update handler to cancel the operation
        const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
          // Simulate canceling the operation
          return { success: false, errors: [{ code: 1001, message: "Operation was canceled by the handler." }] };
        });
    
        // Mock after.update handler
        const afterUpdateHandler = jest.fn();
    
        // Subscribe to events
        store.subscribe(beforeUpdateHandler, "before", "update", "User", "roles");
        store.subscribe(afterUpdateHandler, "after", "update", "User", "roles");
    
        // Attempt to perform the add operation using updateObject
        expect(() => {
          userObject = store.updateObject((obj) => {
            obj.roles.add("editor"); // Attempt to add a new value
          }, userObject);
        }).toThrowError("Operation was canceled by the handler.");
    
        // Update the object reference
        userObject = store.getObject((userObject as EternalObject).uuid)!;
    
        // Verify the set remains unchanged
        expect(userObject.roles.size).toBe(1);
        expect(userObject.roles.has("admin")).toBe(true);
    
        // Verify that the before.update handler was called
        expect(beforeUpdateHandler).toHaveBeenCalledTimes(1);
    
        // Verify that the after.update handler was not called
        expect(afterUpdateHandler).not.toHaveBeenCalled();
      });
  });