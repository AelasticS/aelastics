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
      expect(event.eventType).toBe("before.update")
      expect(event.changes?.[0].property).toBe("name")
      expect(event.changes?.[0].oldValue).toBe("John")
      expect(event.changes?.[0].newValue).toBe("Doe")
      return { success: true }
    })

    const afterUpdateHandler = (event: EventPayload): Result => {
      // Simulate a successful result
      expect(event.eventType).toBe("after.update")
      expect(event.changes?.[0].property).toBe("name")
      expect(event.changes?.[0].oldValue).toBe("John")
      expect(event.changes?.[0].newValue).toBe("Doe")
      return { success: true }
    }

    // Subscribe to before.update and after.update events for the "name" property of the "Person" type
    store.subscribe(beforeUpdateHandler, "before", "update", "Person", "name")
    store.subscribe(afterUpdateHandler, "after", "update", "Person", "name")

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
        eventType: "before.update",
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
  // Test cases will go here...
})
