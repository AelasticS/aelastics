import { uuid, createdAt } from "../../handlers/InternalTypes";
import { TypeMeta } from "../../meta/InternalSchema";
import { StoreClass } from "../../store/StoreClass";

describe("StoreClass - fromImmutable", () => {
  let store: StoreClass;

  describe("Object Export with Valid Schema", () => {
    const testTypeMeta: TypeMeta = {
      qName: "TestType",
      properties: new Map([
        ["simpleProp", { type: "string", defaultValue: "defaultString", qName: "simpleProp" }],
        ["arrayProp", { type: "array", domainType: "NestedType", qName: "arrayProp" }],
        ["mapProp", { type: "map", domainType: "NestedType", qName: "mapProp" }],
        ["setProp", { type: "set", domainType: "NestedType", qName: "setProp" }],
      ]),
    };

    const nestedTypeMeta: TypeMeta = {
      qName: "NestedType",
      properties: new Map([["nestedProp", { type: "string", defaultValue: "nestedDefault", qName: "nestedProp" }]]),
    };

    // Create the mockMetaInfo map
    const mockMetaInfo = new Map<string, TypeMeta>();
    mockMetaInfo.set("TestType", testTypeMeta);
    mockMetaInfo.set("NestedType", nestedTypeMeta);

    // Initialize the store with the dynamically created metaInfo
    store = new StoreClass(mockMetaInfo);

    /** Interface for TestType */
    interface TestType {
      simpleProp: string; // Simple property
      arrayProp: NestedType[]; // Array of NestedType objects
      mapProp: Map<string, NestedType>; // Map with string keys and NestedType values
      setProp: Set<NestedType>; // Set of NestedType objects
    }

    /** Interface for NestedType */
    interface NestedType {
      nestedProp: string; // Simple property in NestedType
    }

    it("should export a store object with simple and collection properties to a literal object", () => {
        // Create a store object
        const storeObject = store.createObject<TestType>("TestType", {
          simpleProp: "customValue",
          arrayProp: [
            { nestedProp: "arrayValue1" },
            { nestedProp: "arrayValue2" },
          ],
          mapProp: new Map([["key1", { nestedProp: "mapValue1" }]]),
          setProp: new Set([{ nestedProp: "setValue1" }]),
        });
      
        // Export the object
        const literalObject = store.fromImmutable(storeObject);
      
        // Assertions for simple properties
        expect(literalObject.simpleProp).toBe("customValue");
      
        // Assertions for array properties
        expect(Array.isArray(literalObject.arrayProp)).toBe(true);
        expect(literalObject.arrayProp).toHaveLength(2);
        expect(literalObject.arrayProp[0]).toEqual(expect.objectContaining({ nestedProp: "arrayValue1" }));
        expect(literalObject.arrayProp[1]).toEqual(expect.objectContaining({ nestedProp: "arrayValue2" }));
      
        // Assertions for map properties
        expect(literalObject.mapProp).toEqual({
          key1: expect.objectContaining({ nestedProp: "mapValue1" }),
        });
      
        // Assertions for set properties
        expect(literalObject.setProp).toEqual([
          expect.objectContaining({ nestedProp: "setValue1" }),
        ]);
      
        // Assertions for metadata
        expect(literalObject["@AelasticsUUID"]).toBeDefined(); // Ensure UUID is automatically assigned
        expect(literalObject["@AelasticsCreatedAt"]).toBeDefined(); // Ensure createdAt is automatically assigned
      });

    it("should handle cyclic references during export", () => {
        // Define a schema with cyclic references
        const personMeta: TypeMeta = {
          qName: "Person",
          properties: new Map([
            ["name", { type: "string", defaultValue: "Unnamed", qName: "name" }],
            ["friends", { type: "array", domainType: "Person", qName: "friends" }],
          ]),
        };
      
        // Add the schema to the store's metadata
        const mockMetaInfo = new Map<string, TypeMeta>();
        mockMetaInfo.set("Person", personMeta);
        store = new StoreClass(mockMetaInfo);
      
        // Step 1: Create the Person object
        let person = store.createObject<{ name: string; friends: any[] }>("Person", {
          name: "Alice",
        });
      
        // Step 2: Add a cyclic reference using updateObject and reassign the result to person
        person = store.produce((p: any) => {
          p.friends.push(p); // Add a cyclic reference to the friends array
        }, person);
      
        // Export the object
        const literalObject = store.fromImmutable(person);
      
        // Assertions for cyclic references
        expect(literalObject.friends[0]).toBe(literalObject); // Verify cyclic reference
        expect(literalObject["@AelasticsUUID"]).toBeDefined(); // Ensure UUID is automatically assigned
        expect(literalObject["@AelasticsCreatedAt"]).toBeDefined(); // Ensure createdAt is automatically assigned
      });

    it("should throw an error for non-store objects", () => {
      // Mock a non-store object
      const nonStoreObject = {
        simpleProp: "value",
      };

      // Attempt to export the object
      expect(() => store.fromImmutable(nonStoreObject)).toThrow("The provided object is not a valid store object.");
    });
  });
});