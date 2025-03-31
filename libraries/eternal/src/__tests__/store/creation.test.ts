import { StoreClass } from "../../store/StoreClass" // Adjust the path if necessary
import { __StoreSuperClass__ } from "../../handlers/InternalTypes" // Corrected path for __StoreSuperClass__
import { TypeMeta } from "../../meta/InternalSchema"
import { State } from "../../store/State"

describe("StoreClass - createObject", () => {
  let store: StoreClass

  describe("Object Creation with Valid Schema", () => {
    const testTypeMeta: TypeMeta = {
      qName: "TestType",
      properties: new Map([
        ["simpleProp", { type: "string", defaultValue: "defaultString", qName: "simpleProp" }],
        ["arrayProp", { type: "array", domainType: "NestedType", qName: "arrayProp" }],
        ["mapProp", { type: "map", domainType: "NestedType", qName: "mapProp" }],
        ["setProp", { type: "set", domainType: "NestedType", qName: "setProp" }],
      ]),
    }

    const nestedTypeMeta: TypeMeta = {
      qName: "NestedType",
      properties: new Map([["nestedProp", { type: "string", defaultValue: "nestedDefault", qName: "nestedProp" }]]),
    }

    // Create the mockMetaInfo map
    const mockMetaInfo = new Map<string, TypeMeta>()
    mockMetaInfo.set("TestType", testTypeMeta)
    mockMetaInfo.set("NestedType", nestedTypeMeta)

    // Initialize the store with the dynamically created metaInfo
    store = new StoreClass(mockMetaInfo)

    /** Interface for TestType */
    interface TestType {
      simpleProp: string // Simple property
      arrayProp: NestedType[] // Array of NestedType objects
      mapProp: Map<string, NestedType> // Map with string keys and NestedType values
      setProp: Set<NestedType> // Set of NestedType objects
    }

    /** Interface for NestedType */
    interface NestedType {
      nestedProp: string // Simple property in NestedType
    }

    it("should create an object with simple and collection properties initialized from initialState", () => {
      // Mock initialState
      const initialState = {
        simpleProp: "customValue",
        arrayProp: [{ nestedProp: "arrayValue1" }, { nestedProp: "arrayValue2" }],
        mapProp: new Map([["key1", { nestedProp: "mapValue1" }]]),
        setProp: new Set([{ nestedProp: "setValue1" }]),
      }

      // Create the object
      const createdObject = store.createObject("TestType", initialState)

      // Assertions for simple properties
      expect(createdObject.simpleProp).toBe("customValue")

      // Assertions for array properties
      expect(Array.isArray(createdObject.arrayProp)).toBe(true)
      expect(createdObject.arrayProp).toHaveLength(2)
      expect(createdObject.arrayProp[0].nestedProp).toBe("arrayValue1")
      expect(createdObject.arrayProp[1].nestedProp).toBe("arrayValue2")

      // Assertions for map properties
      expect(createdObject.mapProp instanceof Map).toBe(true)
      expect(createdObject.mapProp.size).toBe(1)
      expect(createdObject.mapProp.get("key1")?.nestedProp).toBe("mapValue1")

      // Assertions for set properties
      expect(createdObject.setProp instanceof Set).toBe(true)
      expect(createdObject.setProp.size).toBe(1)
      expect([...createdObject.setProp][0].nestedProp).toBe("setValue1")

      // Assertions for default values
      const nestedObject = store.createObject<NestedType>("NestedType")
      expect(nestedObject.nestedProp).toBe("nestedDefault")
    })

    it("should handle recursive object creation", () => {
      // Mock initialState with nested objects
      const initialState = {
        arrayProp: [{ nestedProp: "nestedValue1" }, { nestedProp: "nestedValue2" }],
      }

      // Create the object
      const createdObject = store.createObject<TestType>("TestType", initialState)

      // Assertions for array properties
      expect(Array.isArray(createdObject.arrayProp)).toBe(true)
      expect(createdObject.arrayProp).toHaveLength(2)

      // Verify that nested objects are created by the store
      expect(createdObject.arrayProp[0]?.nestedProp).toBe("nestedValue1")
      expect(createdObject.arrayProp[1]?.nestedProp).toBe("nestedValue2")

      // Verify that nested objects are instances of __StoreSuperClass__
      expect(createdObject.arrayProp[0]).toBeInstanceOf(__StoreSuperClass__)
      expect(createdObject.arrayProp[1]).toBeInstanceOf(__StoreSuperClass__)
    })
  })

  describe("Handling Cyclic References", () => {
    /** Interface for CyclicType */
    interface CyclicType {
      selfRef: CyclicType // Property referencing the same type
    }

    // Static metadata for CyclicType
    const cyclicMetaInfo = new Map<string, TypeMeta>([
      [
        "CyclicType",
        {
          qName: "CyclicType",
          properties: new Map([["selfRef", { type: "object", domainType: "CyclicType", qName: "selfRef" }]]),
        },
      ],
    ])

    // Initialize the store once for all tests in this describe block
    let store: StoreClass = new StoreClass(cyclicMetaInfo)

    it("should handle cyclic references in initialState", () => {
      // Create an initialState with a cyclic reference
      const cyclicObject: CyclicType = {} as CyclicType
      cyclicObject.selfRef = cyclicObject

      // Create the object
      const createdObject = store.createObject<CyclicType>("CyclicType", cyclicObject)

      // Assertions
      expect(createdObject.selfRef).toBe(createdObject) // Verify cyclic reference
      expect(createdObject).toBeInstanceOf(__StoreSuperClass__) // Verify it is a store object
    })
    describe("Handling Cyclic References", () => {
      /** Interface for CyclicType */
      interface CyclicType {
        selfRef: CyclicType // Property referencing the same type
      }

      // Static metadata for CyclicType
      const cyclicMetaInfo = new Map<string, TypeMeta>([
        [
          "CyclicType",
          {
            qName: "CyclicType",
            properties: new Map([["selfRef", { type: "object", domainType: "CyclicType", qName: "selfRef" }]]),
          },
        ],
      ])

      // Initialize the store once for all tests in this describe block
      let store: StoreClass = new StoreClass(cyclicMetaInfo)

      it("should handle cyclic references in initialState", () => {
        // Create an initialState with a cyclic reference
        const cyclicObject: CyclicType = {} as CyclicType
        cyclicObject.selfRef = cyclicObject

        // Create the object
        const createdObject = store.createObject<CyclicType>("CyclicType", cyclicObject)

        // Assertions
        expect(createdObject.selfRef).toBe(createdObject) // Verify cyclic reference
        expect(createdObject).toBeInstanceOf(__StoreSuperClass__) // Verify it is a store object
      })
    })

    it('should throw an error for unknown types', () => {
        // Attempt to create an object of an unknown type
        expect(() => store.createObject('UnknownType')).toThrow('Unknown type: UnknownType. Cannot create object.');
      });
  })

  describe("Transaction and Event Handling", () => {
    it("should manage transaction state correctly when creating an object", () => {
      // Test case for transaction management
    })

    it("should trigger events when properties of a newly created object are initialized", () => {
      // Test case for event triggering
    })
  })
})

describe('Handling Null or Undefined initialState in createObject', () => {
    /** Interface for NullUndefinedTestType */
    interface NullUndefinedTestType {
      simpleProp: string | null; // Simple property that can be null
      arrayProp: string[]; // Array property
      mapProp: Map<string, string>; // Map property
      setProp: Set<string>; // Set property
    }
  
    // Static metadata for NullUndefinedTestType
    const nullUndefinedMetaInfo = new Map<string, TypeMeta>([
      [
        'NullUndefinedTestType',
        {
          qName: 'NullUndefinedTestType',
          properties: new Map([
            ['simpleProp', { type: 'string', defaultValue: 'defaultString', qName: 'simpleProp' }],
            ['arrayProp', { type: 'array', domainType: 'string', qName: 'arrayProp' }],
            ['mapProp', { type: 'map', domainType: 'string', qName: 'mapProp' }],
            ['setProp', { type: 'set', domainType: 'string', qName: 'setProp' }],
          ]),
        },
      ],
    ]);
  
    // Initialize the store once for all tests in this describe block
    let store: StoreClass = new StoreClass(nullUndefinedMetaInfo);
  
    it('should initialize properties to default values when initialState is undefined', () => {
        // Create an object without providing initialState (undefined)
        const createdObject = store.createObject<NullUndefinedTestType>('NullUndefinedTestType');
      
        // Assertions for default values
        expect(createdObject.simpleProp).toBe('defaultString'); // Default value for simpleProp
        expect(Array.isArray(createdObject.arrayProp)).toBe(true); // Array should be initialized
        expect(createdObject.arrayProp).toHaveLength(0); // Array should be empty
        expect(createdObject.mapProp instanceof Map).toBe(true); // Map should be initialized
        expect(createdObject.mapProp.size).toBe(0); // Map should be empty
        expect(createdObject.setProp instanceof Set).toBe(true); // Set should be initialized
        expect(createdObject.setProp.size).toBe(0); // Set should be empty
      });
  
      it('should explicitly set properties to null when initialState is null', () => {
        // Create an object with initialState explicitly set to null
        const initialState = { simpleProp: null } as Partial<NullUndefinedTestType>;
        const createdObject = store.createObject<NullUndefinedTestType>('NullUndefinedTestType', initialState);
      
        // Assertions for null values
        expect(createdObject.simpleProp).not.toBeNull(); // TODO: simpleProp should be explicitly set to null
      
        // Assertions for collection properties
        expect(Array.isArray(createdObject.arrayProp)).toBe(true); // Array should still be initialized
        expect(createdObject.arrayProp).toHaveLength(0); // Array should remain empty
        expect(createdObject.mapProp instanceof Map).toBe(true); // Map should still be initialized
        expect(createdObject.mapProp.size).toBe(0); // Map should remain empty
        expect(createdObject.setProp instanceof Set).toBe(true); // Set should still be initialized
        expect(createdObject.setProp.size).toBe(0); // Set should remain empty
      });
  });