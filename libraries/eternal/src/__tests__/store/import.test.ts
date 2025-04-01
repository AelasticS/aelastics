import { createdAt, uuid } from "../../store/InternalTypes";
import { TypeMeta } from "../../meta/InternalSchema";
import { StoreClass } from "../../store/StoreClass";

describe("StoreClass - toImmutable", () => {
    let store: StoreClass;
  
    describe("Object Import with Valid Schema", () => {
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
  
      it("should import an object with simple and collection properties initialized from a literal object", () => {
        // Mock literal object
        const literalObject = {
          "@AelasticsType": "TestType",
          "@AelasticsUUID": "1234-5678",
          "@AelasticsCreatedAt": 1680000000000,
          simpleProp: "customValue",
          arrayProp: [
            { "@AelasticsType": "NestedType", "@AelasticsUUID": "5678-1234", "@AelasticsCreatedAt": 1680000000001, nestedProp: "arrayValue1" },
            { "@AelasticsType": "NestedType", "@AelasticsUUID": "5678-1235", "@AelasticsCreatedAt": 1680000000002, nestedProp: "arrayValue2" },
          ],
          mapProp: new Map([
            [
              "key1",
              { "@AelasticsType": "NestedType", "@AelasticsUUID": "5678-1236", "@AelasticsCreatedAt": 1680000000003, nestedProp: "mapValue1" },
            ],
          ]),
          setProp: new Set([
            { "@AelasticsType": "NestedType", "@AelasticsUUID": "5678-1237", "@AelasticsCreatedAt": 1680000000004, nestedProp: "setValue1" },
          ]),
        };
  
        // Import the object
        const importedObject = store.toImmutable<TestType>(literalObject);
  
        // Assertions for simple properties
        expect(importedObject.simpleProp).toBe("customValue");
  
        // Assertions for array properties
        expect(Array.isArray(importedObject.arrayProp)).toBe(true);
        expect(importedObject.arrayProp).toHaveLength(2);
        expect(importedObject.arrayProp[0].nestedProp).toBe("arrayValue1");
        expect(importedObject.arrayProp[1].nestedProp).toBe("arrayValue2");
  
        // Assertions for map properties
        expect(importedObject.mapProp instanceof Map).toBe(true);
        expect(importedObject.mapProp.size).toBe(1);
        expect(importedObject.mapProp.get("key1")?.nestedProp).toBe("mapValue1");
  
        // Assertions for set properties
        expect(importedObject.setProp instanceof Set).toBe(true);
        expect(importedObject.setProp.size).toBe(1);
        expect([...importedObject.setProp][0].nestedProp).toBe("setValue1");
  
        // Assertions for UUID and createdAt
        expect((importedObject as any)[uuid]).toBe("1234-5678");
        expect((importedObject as any)[createdAt]).toBe(1680000000000);
      });
  
      it("should handle cyclic references during import", () => {
        // Mock literal object with cyclic references
        const cyclicObject: any = {
          "@AelasticsType": "TestType",
          "@AelasticsUUID": "1234-56789",
          "@AelasticsCreatedAt": 1680000000000,
          simpleProp: "cyclicValue",
        };
        cyclicObject.arrayProp = [cyclicObject]; // Cyclic reference
  
        // Import the object
        const importedObject = store.toImmutable<TestType>(cyclicObject);
  
        // Assertions for cyclic references
        expect(importedObject.arrayProp[0]).toBe(importedObject); // Verify cyclic reference
        expect((importedObject as any)[uuid]).toBe("1234-56789");
        expect((importedObject as any)[createdAt]).toBe(1680000000000);
      });
  
      it("should throw an error for unknown types", () => {
        // Mock literal object with an unknown type
        const unknownObject = {
          "@AelasticsType": "UnknownType",
          "@AelasticsUUID": "9999-9999",
          "@AelasticsCreatedAt": 1680000000000,
        };
  
        // Attempt to import the object
        expect(() => store.toImmutable(unknownObject)).toThrow("Unknown type: UnknownType. Cannot import object.");
      });
    });
  });