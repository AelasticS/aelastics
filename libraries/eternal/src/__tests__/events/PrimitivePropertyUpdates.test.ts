import { createStore } from "../../StoreFactory"
import { initializeSchemaRegistry } from "../../SchemaRegistry"
import { SchemaRegistry } from "../../meta/InternalSchema"
import { SchemaDescription } from "../../meta/ExternalSchema"
import { EternalObject } from "../../handlers/InternalTypes"
import { EventPayload, Result } from "../../events/EventTypes"

const schemas: SchemaDescription[] = [
  {
    qName: "/test",
    version: "1.0",
    types: {
      Person: {
        qName: "Person",
        properties: {
          name: { qName: "name", type: "string" },
          age: { qName: "age", type: "number" },
          description: { qName: "description", type: "string", optional: true },
        },
      },
    },
    roles: {},
    export: ["Person"],
    import: {},
  },
]
interface Person {
  name: string;
  age: number;
  description?: string | null;
}

describe("Primitive Property Updates", () => {
  let store: ReturnType<typeof createStore>
  let person: EternalObject

  beforeEach(() => {
    // Initialize the schema registry and store
    const schemaRegistry: SchemaRegistry = initializeSchemaRegistry(schemas) as SchemaRegistry
    store = createStore(schemaRegistry.schemas.get("/test")!)

    // Create a Person object
    person = store.createObject("Person") as EternalObject

    // Update the Person object with initial values
    person = store.updateObject((p) => {
      p.name = "John"
      p.age = 30
      p.description = "Some text"
    }, person)

    // Retrieve the latest version of the Person object
    person = store.getObject((person as EternalObject).uuid)!
  })

  it("should update a primitive property and emit events", () => {
    // Define real functions for before.update and after.update handlers
    const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Simulate a successful result
      expect(event.eventType).toBe("before.update.Person.name.update")
      expect(event.changes?.[0].property).toBe("name")
      expect(event.changes?.[0].oldValue).toBe("John")
      expect(event.changes?.[0].newValue).toBe("Doe")
      return { success: true }
    })

    const afterUpdateHandler = (event: EventPayload): Result => {
      // Simulate a successful result
      expect(event.eventType).toBe("after.update.Person.name.update")
      expect(event.changes?.[0].property).toBe("name")
      expect(event.changes?.[0].oldValue).toBe("John")
      expect(event.changes?.[0].newValue).toBe("Doe")
      return { success: true }
    }

    // Subscribe to before.update and after.update events for the "name" property of the "Person" type
    store.subscribe(beforeUpdateHandler, "before", "update", "Person", "name", "update")
    store.subscribe(afterUpdateHandler, "after", "update", "Person", "name", "update")

    // Update the Person object
    person = store.updateObject((p) => {
      p.name = "Doe"
    }, person)

    // Retrieve the latest version of the Person object
    person = store.getObject((person as EternalObject).uuid)!
    
    // Verify that the beforeUpdateHandler was called
    expect(beforeUpdateHandler).toHaveBeenCalled()
    expect(beforeUpdateHandler).toHaveBeenCalledTimes(1)
    expect(beforeUpdateHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "before.update.Person.name.update",
        changes: [
          expect.objectContaining({
            property: "name",
            oldValue: "John",
            newValue: "Doe",
          }),
        ],
      })
    )
    // Verify the state
    expect(person.name).toBe("Doe")
  })
  it("should not emit events when setting the same value (no-op)", () => {
    const beforeUpdateHandler = jest.fn(() => ({ success: true, errors: [] }))
    const afterUpdateHandler = jest.fn(() => ({ success: true, errors: [] }))

    // Subscribe to before.update and after.update events for the "age" property of the "Person" type
    store.subscribe(beforeUpdateHandler, "before", "update", "Person", "age")
    store.subscribe(afterUpdateHandler, "after", "update", "Person", "age")

    // Update the Person object with the same value
    person = store.updateObject((p) => {
      p.age = 30 // Same value as the initial state
    }, person)

    // Retrieve the latest version of the Person object
    person = store.getObject((person as EternalObject).uuid)!

    // Verify the state remains unchanged
    expect(person.age).toBe(30)

    // Verify no events were emitted
    expect(beforeUpdateHandler).not.toHaveBeenCalled()
    expect(afterUpdateHandler).not.toHaveBeenCalled()
  })

  it("should emit events when setting a property to null", () => {
    // Define real functions for before.update and after.update handlers
    const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Simulate a successful result
      expect(event.eventType).toBe("before.update.Person.description.update");
      expect(event.changes?.[0].property).toBe("description");
      expect(event.changes?.[0].oldValue).toBe("Some text");
      expect(event.changes?.[0].newValue).toBeNull();
      return { success: true };
    });
  
    const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Simulate a successful result
      expect(event.eventType).toBe("after.update.Person.description.update");
      expect(event.changes?.[0].property).toBe("description");
      expect(event.changes?.[0].oldValue).toBe("Some text");
      expect(event.changes?.[0].newValue).toBeNull();
      return { success: true };
    });
  
    // Subscribe to before.update and after.update events for the "description" property of the "Person" type
    store.subscribe(beforeUpdateHandler, "before", "update", "Person", "description", "update");
    store.subscribe(afterUpdateHandler, "after", "update", "Person", "description", "update");
  
    // Update the Person object to set the "description" property to null
    person = store.updateObject((p) => {
      p.description = null;
    }, person);
  
    // Retrieve the latest version of the Person object
    person = store.getObject((person as EternalObject).uuid)!;
  
    // Verify the state
    expect(person.description).toBeNull();
  
    // Verify that the beforeUpdateHandler was called
    expect(beforeUpdateHandler).toHaveBeenCalled();
    expect(beforeUpdateHandler).toHaveBeenCalledTimes(1);
    expect(beforeUpdateHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "before.update.Person.description.update",
        changes: [
          expect.objectContaining({
            property: "description",
            oldValue: "Some text",
            newValue: null,
          }),
        ],
      })
    );
  
    // Verify that the afterUpdateHandler was called
    expect(afterUpdateHandler).toHaveBeenCalled();
    expect(afterUpdateHandler).toHaveBeenCalledTimes(1);
    expect(afterUpdateHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "after.update.Person.description.update",
        changes: [
          expect.objectContaining({
            property: "description",
            oldValue: "Some text",
            newValue: null,
          }),
        ],
      })
    );
  });
  it("should cancel the update if before.update handler throws an error", () => {
    // Define a before.update handler that throws an error
    const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Simulate an error
      expect(event.eventType).toBe("before.update.Person.name.update");
      expect(event.changes?.[0].property).toBe("name");
      expect(event.changes?.[0].oldValue).toBe("John");
      expect(event.changes?.[0].newValue).toBe("Doe");
      return { success: false, errors: [{ message: "Update not allowed" }] };
    });
  
    // Define an after.update handler that should not be called
    const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
      throw new Error("afterUpdateHandler should not be called if the update is canceled");
    });
  
    // Subscribe to before.update and after.update events for the "name" property of the "Person" type
    store.subscribe(beforeUpdateHandler, "before", "update", "Person", "name", "update");
    store.subscribe(afterUpdateHandler, "after", "update", "Person", "name", "update");
  
    // Attempt to update the Person object
    expect(() => {
      person = store.updateObject((p) => {
        p.name = "Doe";
      }, person);
    }).toThrow("Update not allowed");
  
    // Retrieve the latest version of the Person object
    person = store.getObject((person as EternalObject).uuid)!;
  
    // Verify the state remains unchanged
    expect(person.name).toBe("John");
  
    // Verify that the beforeUpdateHandler was called
    expect(beforeUpdateHandler).toHaveBeenCalled();
    expect(beforeUpdateHandler).toHaveBeenCalledTimes(1);
    expect(beforeUpdateHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "before.update.Person.name.update",
        changes: [
          expect.objectContaining({
            property: "name",
            oldValue: "John",
            newValue: "Doe",
          }),
        ],
      })
    );
  
    // Verify that the afterUpdateHandler was not called
    expect(afterUpdateHandler).not.toHaveBeenCalled();
  });
  it("should throw an error when setting an invalid value", () => {
    // Define real functions for before.update and after.update handlers
    const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
      // This should not be called for invalid values
      throw new Error("beforeUpdateHandler should not be called for invalid values");
    });
  
    const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
      // This should not be called for invalid values
      throw new Error("afterUpdateHandler should not be called for invalid values");
    });
  
    // Subscribe to before.update and after.update events for the "age" property of the "Person" type
    store.subscribe(beforeUpdateHandler, "before", "update", "Person", "age", "update");
    store.subscribe(afterUpdateHandler, "after", "update", "Person", "age", "update");
  
    // Attempt to update the Person object with an invalid value
    expect(() => {
      person = store.updateObject((p) => {
        p.age = "thirty" as any; // Invalid value: age should be a number
      }, person);
    }).toThrow(/Invalid value for property/);
    
    // Retrieve the latest version of the Person object
    person = store.getObject((person as EternalObject).uuid)!;
  
    // Verify the state remains unchanged
    expect(person.age).toBe(30);
  
    // Verify that the beforeUpdateHandler was not called
    expect(beforeUpdateHandler).not.toHaveBeenCalled();
  
    // Verify that the afterUpdateHandler was not called
    expect(afterUpdateHandler).not.toHaveBeenCalled();
  });
  it("should allow setting a property to undefined and emit events", () => {
    // Define real functions for before.update and after.update handlers
    const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Simulate a successful result
      expect(event.eventType).toBe("before.update.Person.description.update");
      expect(event.changes?.[0].property).toBe("description");
      expect(event.changes?.[0].oldValue).toBe("Some text");
      expect(event.changes?.[0].newValue).toBeUndefined();
      return { success: true };
    });
  
    const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Simulate a successful result
      expect(event.eventType).toBe("after.update.Person.description.update");
      expect(event.changes?.[0].property).toBe("description");
      expect(event.changes?.[0].oldValue).toBe("Some text");
      expect(event.changes?.[0].newValue).toBeUndefined();
      return { success: true };
    });
  
    // Subscribe to before.update and after.update events for the "description" property of the "Person" type
    store.subscribe(beforeUpdateHandler, "before", "update", "Person", "description", "update");
    store.subscribe(afterUpdateHandler, "after", "update", "Person", "description", "update");
  
    // Update the Person object to set the "description" property to undefined
    person = store.updateObject((p) => {
      p.description = undefined; // Set the property to undefined
    }, person);
  
    // Retrieve the latest version of the Person object
    person = store.getObject((person as EternalObject).uuid)!;
  
    // Verify the property was set to undefined
    expect(person.description).toBeUndefined();
  
    // Verify that the beforeUpdateHandler was called
    expect(beforeUpdateHandler).toHaveBeenCalled();
    expect(beforeUpdateHandler).toHaveBeenCalledTimes(1);
    expect(beforeUpdateHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "before.update.Person.description.update",
        changes: [
          expect.objectContaining({
            property: "description",
            oldValue: "Some text",
            newValue: undefined,
          }),
        ],
      })
    );
  
    // Verify that the afterUpdateHandler was called
    expect(afterUpdateHandler).toHaveBeenCalled();
    expect(afterUpdateHandler).toHaveBeenCalledTimes(1);
    expect(afterUpdateHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "after.update.Person.description.update",
        changes: [
          expect.objectContaining({
            property: "description",
            oldValue: "Some text",
            newValue: undefined,
          }),
        ],
      })
    );
  });
  it("should emit events when updating multiple properties in a single transaction (using '*')", () => {
    // Define real functions for before.update and after.update handlers
    const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Simulate a successful result
      if (event.changes?.[0].property === "name") {
        expect(event.eventType).toBe("before.update.Person.name.update");
        expect(event.changes?.[0].oldValue).toBe("John");
        expect(event.changes?.[0].newValue).toBe("Doe");
      } else if (event.changes?.[0].property === "age") {
        expect(event.eventType).toBe("before.update.Person.age.update");
        expect(event.changes?.[0].oldValue).toBe(30);
        expect(event.changes?.[0].newValue).toBe(35);
      }
      return { success: true };
    });
  
    const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Simulate a successful result
      if (event.changes?.[0].property === "name") {
        expect(event.eventType).toBe("after.update.Person.name.update");
        expect(event.changes?.[0].oldValue).toBe("John");
        expect(event.changes?.[0].newValue).toBe("Doe");
      } else if (event.changes?.[0].property === "age") {
        expect(event.eventType).toBe("after.update.Person.age.update");
        expect(event.changes?.[0].oldValue).toBe(30);
        expect(event.changes?.[0].newValue).toBe(35);
      }
      return { success: true };
    });
  
    // Subscribe to before.update and after.update events for all properties of the "Person" type
    store.subscribe(beforeUpdateHandler, "before", "update", "Person", "*", "update");
    store.subscribe(afterUpdateHandler, "after", "update", "Person", "*", "update");
  
    // Update the Person object to change both "name" and "age" in a single transaction
    person = store.updateObject((p) => {
      p.name = "Doe";
      p.age = 35;
    }, person);
  
    // Retrieve the latest version of the Person object
    person = store.getObject((person as EternalObject).uuid)!;
  
    // Verify the state reflects the updates
    expect(person.name).toBe("Doe");
    expect(person.age).toBe(35);
  
    // Verify that the beforeUpdateHandler was called for both properties
    expect(beforeUpdateHandler).toHaveBeenCalledTimes(2);
    expect(beforeUpdateHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "before.update.Person.name.update",
        changes: [
          expect.objectContaining({
            property: "name",
            oldValue: "John",
            newValue: "Doe",
          }),
        ],
      })
    );
    expect(beforeUpdateHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "before.update.Person.age.update",
        changes: [
          expect.objectContaining({
            property: "age",
            oldValue: 30,
            newValue: 35,
          }),
        ],
      })
    );
  
    // Verify that the afterUpdateHandler was called for both properties
    expect(afterUpdateHandler).toHaveBeenCalledTimes(2);
    expect(afterUpdateHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "after.update.Person.name.update",
        changes: [
          expect.objectContaining({
            property: "name",
            oldValue: "John",
            newValue: "Doe",
          }),
        ],
      })
    );
    expect(afterUpdateHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "after.update.Person.age.update",
        changes: [
          expect.objectContaining({
            property: "age",
            oldValue: 30,
            newValue: 35,
          }),
        ],
      })
    );
  });

  it("should cancel the entire transaction if one of the updates fails", () => {
    // Define a before.update handler that fails for the "age" property
    const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
      if (event.changes?.[0].property === "age") {
        return { success: false, errors: [{ message: "Update not allowed for age" }] };
      }
      return { success: true };
    });
  
    const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
      // This should not be called if the transaction is canceled
      throw new Error("afterUpdateHandler should not be called if the transaction is canceled");
    });
  
    // Subscribe to before.update and after.update events for all properties of the "Person" type
    store.subscribe(beforeUpdateHandler, "before", "update", "Person", "*", "update");
    store.subscribe(afterUpdateHandler, "after", "update", "Person", "*", "update");
  
    // Retrieve the original object reference
    const originalReference = store.getObject<Person>((person as EternalObject).uuid)!;
  
    // Attempt to update the Person object
    expect(() => {
      person = store.updateObject((p) => {
        p.age = 35; // This will fail due to the before.update handler
        p.name = "Doe"; // This update is valid but will not be committed
      }, person);
    }).toThrow(/Update not allowed for age/); // Use regex to check the error message
  
    // Retrieve the current object reference
    const currentReference = store.getObject<Person>((person as EternalObject).uuid)!;
  
    // Verify that the object reference remains the same
    expect(currentReference).toBe(originalReference);
  
    // Verify that the state remains unchanged
    expect(currentReference.name).toBe("John");
    expect(currentReference.age).toBe(30);
  
    // Verify that the beforeUpdateHandler was called for age
    expect(beforeUpdateHandler).toHaveBeenCalledTimes(1);
    expect(beforeUpdateHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "before.update.Person.age.update",
        changes: [
          expect.objectContaining({
            property: "age",
            oldValue: 30,
            newValue: 35,
          }),
        ],
      })
    );
  
    // Verify that the afterUpdateHandler was not called
    expect(afterUpdateHandler).not.toHaveBeenCalled();
  });

  it("should allow updating multiple properties in a single transaction and emit events in the correct order", () => {
    // Define real functions for before.update and after.update handlers
    const beforeUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Simulate a successful result
      if (event.changes?.[0].property === "age") {
        expect(event.eventType).toBe("before.update.Person.age.update");
        expect(event.changes?.[0].oldValue).toBe(30);
        expect(event.changes?.[0].newValue).toBe(35);
      } else if (event.changes?.[0].property === "name") {
        expect(event.eventType).toBe("before.update.Person.name.update");
        expect(event.changes?.[0].oldValue).toBe("John");
        expect(event.changes?.[0].newValue).toBe("Doe");
      }
      return { success: true };
    });
  
    const afterUpdateHandler = jest.fn((event: EventPayload): Result => {
      // Simulate a successful result
      if (event.changes?.[0].property === "age") {
        expect(event.eventType).toBe("after.update.Person.age.update");
        expect(event.changes?.[0].oldValue).toBe(30);
        expect(event.changes?.[0].newValue).toBe(35);
      } else if (event.changes?.[0].property === "name") {
        expect(event.eventType).toBe("after.update.Person.name.update");
        expect(event.changes?.[0].oldValue).toBe("John");
        expect(event.changes?.[0].newValue).toBe("Doe");
      }
      return { success: true };
    });
  
    // Subscribe to before.update and after.update events for all properties of the "Person" type
    store.subscribe(beforeUpdateHandler, "before", "update", "Person", "*", "update");
    store.subscribe(afterUpdateHandler, "after", "update", "Person", "*", "update");
  
    // Update the Person object to change both "age" and "name" in a single transaction
    person = store.updateObject((p) => {
      p.age = 35; // Update age first
      p.name = "Doe"; // Update name second
    }, person);
  
    // Retrieve the latest version of the Person object
    person = store.getObject((person as EternalObject).uuid)!; 
  
    // Verify the state reflects the updates
    expect(person.age).toBe(35);
    expect(person.name).toBe("Doe");
  
    // Verify that the beforeUpdateHandler was called for both properties in the correct order
    expect(beforeUpdateHandler).toHaveBeenNthCalledWith(1,
      expect.objectContaining({
        eventType: "before.update.Person.age.update",
        changes: [
          expect.objectContaining({
            property: "age",
            oldValue: 30,
            newValue: 35,
          }),
        ],
      })
    );
    expect(beforeUpdateHandler).toHaveBeenNthCalledWith(2,
      expect.objectContaining({
        eventType: "before.update.Person.name.update",
        changes: [
          expect.objectContaining({
            property: "name",
            oldValue: "John",
            newValue: "Doe",
          }),
        ],
      })
    );
  
    // Verify that the afterUpdateHandler was called for both properties in the correct order
    expect(afterUpdateHandler).toHaveBeenNthCalledWith(1,
      expect.objectContaining({
        eventType: "after.update.Person.age.update",
        changes: [
          expect.objectContaining({
            property: "age",
            oldValue: 30,
            newValue: 35,
          }),
        ],
      })
    );
    expect(afterUpdateHandler).toHaveBeenNthCalledWith(2,
      expect.objectContaining({
        eventType: "after.update.Person.name.update",
        changes: [
          expect.objectContaining({
            property: "name",
            oldValue: "John",
            newValue: "Doe",
          }),
        ],
      })
    );
  });
  // Test cases will go here...
})
