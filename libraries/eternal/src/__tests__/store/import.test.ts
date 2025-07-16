import { createdAt, uuid } from "../../store/InternalTypes";
import { StoreClass } from "../../store/StoreClass";
import { RegistryService } from "../../registry/RegistryService";
import { Namespace, RegistryMetadata } from "../../registry/NamespaceMetadata";
import { ObjectTypeMeta, PropertyMeta } from "../../registry/TypeDefinitions";

// Create test schema using the new registry system
function createTestNamespace(): Namespace {
  const testTypeMeta: ObjectTypeMeta = {
    qName: "/test/TestType",
    category: "complex",
    kind: "object",
    properties: new Map([
      ["simpleProp", {
        name: "simpleProp",
        typeRef: "/std/string",
        optional: false,
        defaultValue: "defaultString"
      } as PropertyMeta],
      ["arrayProp", {
        name: "arrayProp",
        typeRef: "/std/array</test/NestedType>",
        optional: false
      } as PropertyMeta],
      ["mapProp", {
        name: "mapProp",
        typeRef: "/std/map<string, /test/NestedType>",
        optional: false
      } as PropertyMeta],
      ["setProp", {
        name: "setProp",
        typeRef: "/std/set</test/NestedType>",
        optional: false
      } as PropertyMeta]
    ])
  };

  const nestedTypeMeta: ObjectTypeMeta = {
    qName: "/test/NestedType",
    category: "complex",
    kind: "object",
    properties: new Map([
      ["nestedProp", {
        name: "nestedProp",
        typeRef: "/std/string",
        optional: false,
        defaultValue: "nestedDefault"
      } as PropertyMeta]
    ])
  };

  return {
    qName: "/test",
    version: "1.0.0",
    types: new Map([
      ["TestType", testTypeMeta],
      ["NestedType", nestedTypeMeta]
    ]),
    exports: ["TestType", "NestedType"],
    imports: new Map()
  };
}

function createTestStore(): StoreClass {
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
  return new StoreClass(registry);
}

describe("StoreClass - toImmutable", () => {
    let store: StoreClass;
  
    describe("Object Import with Valid Schema", () => {
      // Initialize the store with the dynamically created metaInfo
      store = createTestStore();
  
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
          "@AelasticsType": "/test/TestType",
          "@AelasticsUUID": "1234-5678",
          "@AelasticsCreatedAt": 1680000000000,
          simpleProp: "customValue",
          arrayProp: [
            { "@AelasticsType": "/test/NestedType", "@AelasticsUUID": "5678-1234", "@AelasticsCreatedAt": 1680000000001, nestedProp: "arrayValue1" },
            { "@AelasticsType": "/test/NestedType", "@AelasticsUUID": "5678-1235", "@AelasticsCreatedAt": 1680000000002, nestedProp: "arrayValue2" },
          ],
          mapProp: new Map([
            [
              "key1",
              { "@AelasticsType": "/test/NestedType", "@AelasticsUUID": "5678-1236", "@AelasticsCreatedAt": 1680000000003, nestedProp: "mapValue1" },
            ],
          ]),
          setProp: new Set([
            { "@AelasticsType": "/test/NestedType", "@AelasticsUUID": "5678-1237", "@AelasticsCreatedAt": 1680000000004, nestedProp: "setValue1" },
          ]),
        };
  
        // Import the object
        const importedObject = store.toImmutable();
  
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
          "@AelasticsType": "/test/TestType",
          "@AelasticsUUID": "1234-56789",
          "@AelasticsCreatedAt": 1680000000000,
          simpleProp: "cyclicValue",
        };
        cyclicObject.arrayProp = [cyclicObject]; // Cyclic reference
  
        // Import the object
        const importedObject = store.toImmutable();
  
        // Assertions for cyclic references
        expect(importedObject.arrayProp[0]).toBe(importedObject); // Verify cyclic reference
        expect((importedObject as any)[uuid]).toBe("1234-56789");
        expect((importedObject as any)[createdAt]).toBe(1680000000000);
      });
  
      it("should throw an error for unknown types", () => {
        // Mock literal object with an unknown type
        const unknownObject = {
          "@AelasticsType": "/test/UnknownType",
          "@AelasticsUUID": "9999-9999",
          "@AelasticsCreatedAt": 1680000000000,
        };
  
        // Attempt to import the object
        expect(() => store.toImmutable()).toThrow();
      });
    });
  });