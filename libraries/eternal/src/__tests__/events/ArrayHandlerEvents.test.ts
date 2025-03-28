import { createStore } from "../../StoreFactory";
import { initializeSchemaRegistry } from "../../SchemaRegistry";
import { SchemaRegistry } from "../../meta/InternalSchema";
import { SchemaDescription } from "../../meta/ExternalSchema";
import { EternalObject } from "../../handlers/InternalTypes";
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

interface SimpleArrayType {
  numbers: number[];
}

describe("ArrayHandler Events", () => {
  let store: ReturnType<typeof createStore>;
  let simpleArrayObject: EternalObject;

  beforeEach(() => {
    // Initialize the schema registry and store
    const schemaRegistry: SchemaRegistry = initializeSchemaRegistry(schemas) as SchemaRegistry;
    store = createStore(schemaRegistry.schemas.get("/test")!);

    // Create an object of type SimpleArrayType
    simpleArrayObject = store.createObject("SimpleArrayType") as EternalObject;

    // Retrieve the latest version of the object
    simpleArrayObject = store.getObject((simpleArrayObject as EternalObject).uuid)!;
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
});