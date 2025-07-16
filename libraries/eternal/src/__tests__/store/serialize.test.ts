import { StoreClass } from "../../store/StoreClass"; // Adjust the path as needed
import { RegistryService } from "../../registry/RegistryService";
import { Namespace, RegistryMetadata } from "../../registry/NamespaceMetadata";
import { ObjectTypeMeta, PropertyMeta } from "../../registry/TypeDefinitions";

interface MyClass {
  name?: string;
  age?: number;
  array?: MyClass[];
  map?: Map<string, number>;
  set?: Set<string>;
  child?: MyClass;
  parent?: MyClass;
  description?: string;
}

// Create MyClass schema using the new registry system
function createMyClassNamespace(): Namespace {
  const myClassTypeMeta: ObjectTypeMeta = {
    qName: "/test/MyClass",
    category: "complex",
    kind: "object",
    properties: new Map([
      ["name", {
        name: "name",
        typeRef: "/std/string",
        optional: true
      } as PropertyMeta],
      ["age", {
        name: "age",
        typeRef: "/std/number",
        optional: true
      } as PropertyMeta],
      ["array", {
        name: "array",
        typeRef: "/std/array</test/MyClass>",
        optional: true
      } as PropertyMeta],
      ["map", {
        name: "map",
        typeRef: "/std/map<string, /std/number>",
        optional: true
      } as PropertyMeta],
      ["set", {
        name: "set",
        typeRef: "/std/set</std/string>",
        optional: true
      } as PropertyMeta],
      ["child", {
        name: "child",
        typeRef: "/test/MyClass",
        optional: true
      } as PropertyMeta],
      ["parent", {
        name: "parent",
        typeRef: "/test/MyClass",
        optional: true
      } as PropertyMeta],
      ["description", {
        name: "description",
        typeRef: "/std/string",
        optional: true
      } as PropertyMeta]
    ])
  };

  return {
    qName: "/test",
    version: "1.0.0",
    types: new Map([
      ["MyClass", myClassTypeMeta]
    ]),
    exports: ["MyClass"],
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
  const namespace = createMyClassNamespace();
  
  registry.importNamespace(namespace);
  return new StoreClass(registry);
}

describe("Serialization Tests", () => {
  // Initialize the store with the schema
  const Store = createTestStore();

  test("Serialize a simple object", () => {
    const objA = Store.create<MyClass>("/test/MyClass", { name: "Object A", age: 30 });

    const serialized = Store.serialize(objA);

    expect(serialized).toEqual(
      JSON.stringify([
        {
          "@AelasticsUUID": Store.getUUID(objA), // Use Store.getUUID() to retrieve the UUID
          "@AelasticsType": "MyClass",
          name: "Object A",
          age: 30,
          "array":[],
          "map":[],
          "set":[]
        },
      ])
    );
  });

  test("Serialize an object with collections", () => {
    const objA = Store.create<MyClass>("/test/MyClass", { name: "ObjectA", age: 30 });

    let objB = Store.create<MyClass>("/test/MyClass", {
      name: "ObjectB",
      array: [], // Array of MyClass objects
      map: new Map([["key2", 42]]), // Map with number values
      set: new Set(["value1", "value2"]), // Set with string values
    });

    // Add references to objA in collections
    objB = Store.update<MyClass>((o) => {
      o.array?.push(objA);
      o.map?.set("key1", 99);
      o.set?.add("value3");
    }, objB);

    const serialized = Store.serialize(objB);
    const expectedArray = [
      {
        "@AelasticsUUID": Store.getUUID(objA), // Use Store.getUUID() to retrieve the UUID
        "@AelasticsType": "MyClass",
        name: "ObjectA",
        age: 30,
        "array":[],
        "map":[],
        "set":[]
      },
        {
          "@AelasticsUUID": Store.getUUID(objB), // Use Store.getUUID() to retrieve the UUID
          "@AelasticsType": "MyClass",
          name: "ObjectB",
          age: undefined,
          array: [Store.getUUID(objA)], // UUIDs of objects in the array
          map: [
            { key: "key2", value: 42 },
            { key: "key1", value: 99 },
          ],
          set: ["value1", "value2", "value3"],
        },

      ]
    const parsedSerialized = JSON.parse(serialized);

    expect(parsedSerialized).toEqual(expect.arrayContaining(expectedArray));
  });

  test("Serialize an object with circular references", () => {
    const objA = Store.create<MyClass>("/test/MyClass", { name: "ObjectA", age: 30, array: [], map: new Map(), set: new Set() });

    let objB = Store.create<MyClass>("/test/MyClass", {
      name: "ObjectB",
      age: 30,
      array: [], // Array of MyClass objects
      map: new Map([["key2", 42]]), // Map with number values
      set: new Set(["value1", "value2"]), // Set with string values
    });

    const objC = Store.create<MyClass>("/test/MyClass", { name: "ObjectC", child: objB });

    // Add references to objA in collections and circular reference
    objB = Store.update<MyClass>((o) => {
      o.age = undefined,
      o.array?.push(objA);
      o.map?.set("key1", 99);
      o.set?.add("value3");
      o.parent = objC; // Circular reference
    }, objB);

    const serialized = Store.serialize(objC);

    const parsedSerialized = JSON.parse(serialized);
    const expectedObjects = [
      expect.objectContaining({
      "@AelasticsUUID": Store.getUUID(objA), // Use Store.getUUID() to retrieve the UUID
      "@AelasticsType": "MyClass",
      name: "ObjectA",
      age: 30,
      array: expect.any(Array),
      map: expect.any(Array),
      set: expect.any(Array),
      }),
      expect.objectContaining({
      "@AelasticsUUID": Store.getUUID(objB), // Use Store.getUUID() to retrieve the UUID
      "@AelasticsType": "MyClass",
      name: "ObjectB",
      array: expect.arrayContaining([Store.getUUID(objA)]),
      map: expect.arrayContaining([
        expect.objectContaining({ key: "key2", value: 42 }),
        expect.objectContaining({ key: "key1", value: 99 }),
      ]),
      set: expect.arrayContaining(["value1", "value2", "value3"]),
      parent: Store.getUUID(objC), // Circular reference
      }),
      expect.objectContaining({
      "@AelasticsUUID": Store.getUUID(objC), // Use Store.getUUID() to retrieve the UUID
      "@AelasticsType": "MyClass",
      name: "ObjectC",
      child: Store.getUUID(objB),
      }),
    ];

    expect(parsedSerialized).toEqual(expect.arrayContaining(expectedObjects));
  });

  test("Serialize a complex object with mixed structures", () => {
    const objA = Store.create<MyClass>("/test/MyClass", { name: "Object A", age: 30 });

    const objB = Store.create<MyClass>("/test/MyClass", {
      array: [objA], // Array of MyClass objects
      map: new Map([["key2", 42]]), // Map with number values
      set: new Set(["value1", "value2"]), // Set with string values
    });

    const objC = Store.create<MyClass>("/test/MyClass", { child: objB });

    const objD = Store.create<MyClass>("/test/MyClass", { description: "Object D" });

    // Add references and circular references
    Store.update<MyClass>((o) => {
      o.array?.push(objA, objD);
      o.map?.set("key1", 99);
      o.map?.set("key3", 100);
      o.set?.add("value3");
      o.parent = objC; // Circular reference
    }, objB);

    const serialized = Store.serialize(objC);

    const parsedSerialized = JSON.parse(serialized);
    const expectedObjects = [
      expect.objectContaining({
      "@AelasticsUUID": Store.getUUID(objC), // Use Store.getUUID() to retrieve the UUID
      "@AelasticsType": "MyClass",
      array: expect.any(Array),
      child: Store.getUUID(objB),
      }),
      expect.objectContaining({
      "@AelasticsUUID": Store.getUUID(objB), // Use Store.getUUID() to retrieve the UUID
      "@AelasticsType": "MyClass",
      array: expect.arrayContaining([Store.getUUID(objA), Store.getUUID(objD)]),
      map: expect.arrayContaining([
        expect.objectContaining({ key: "key2", value: 42 }),
        expect.objectContaining({ key: "key1", value: 99 }),
        expect.objectContaining({ key: "key3", value: 100 }),
      ]),
      set: expect.arrayContaining(["value1", "value2", "value3"]),
      parent: Store.getUUID(objC), // Circular reference
      }),
      expect.objectContaining({
      "@AelasticsUUID": Store.getUUID(objA), // Use Store.getUUID() to retrieve the UUID
      "@AelasticsType": "MyClass",
      name: "Object A",
      age: 30,
      }),
      expect.objectContaining({
      "@AelasticsUUID": Store.getUUID(objD), // Use Store.getUUID() to retrieve the UUID
      "@AelasticsType": "MyClass",
      description: "Object D",
      }),
    ];

    expect(parsedSerialized).toEqual(expect.arrayContaining(expectedObjects));
  });
});