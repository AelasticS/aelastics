import { StoreClass } from "../../store/StoreClass"; // Adjust the path as needed
import { TypeMeta } from "../../meta/InternalSchema";

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

describe("Serialization Tests", () => {
  // Define the schema for MyClass
  const myClassMeta: TypeMeta = {
    qName: "MyClass",
    properties: new Map([
      ["name", { type: "string", qName: "name" }],
      ["age", { type: "number", qName: "age" }],
      ["array", { type: "array", domainType: "MyClass", qName: "array" }], // Array of MyClass objects
      ["map", { type: "map", domainType: "number", qName: "map" }], // Map with number values
      ["set", { type: "set", domainType: "string", qName: "set" }], // Set with string values
      ["child", { type: "object", domainType: "MyClass", qName: "child" }],
      ["parent", { type: "object", domainType: "MyClass", qName: "parent" }],
      ["description", { type: "string", qName: "description" }],
    ]),
  };

  // Initialize the store with the schema
  const metaInfo = new Map<string, TypeMeta>([["MyClass", myClassMeta]]);
  const Store = new StoreClass(metaInfo);

  test("Serialize a simple object", () => {
    const objA = Store.create<MyClass>("MyClass", { name: "Object A", age: 30 });

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
    const objA = Store.create<MyClass>("MyClass", { name: "ObjectA", age: 30 });

    let objB = Store.create<MyClass>("MyClass", {
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
    const objA = Store.create<MyClass>("MyClass", { name: "ObjectA", age: 30, array: [], map: new Map(), set: new Set() });

    let objB = Store.create<MyClass>("MyClass", {
      name: "ObjectB",
      age: 30,
      array: [], // Array of MyClass objects
      map: new Map([["key2", 42]]), // Map with number values
      set: new Set(["value1", "value2"]), // Set with string values
    });

    const objC = Store.create<MyClass>("MyClass", { name: "ObjectC", child: objB });

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
    const objA = Store.create<MyClass>("MyClass", { name: "Object A", age: 30 });

    const objB = Store.create<MyClass>("MyClass", {
      array: [objA], // Array of MyClass objects
      map: new Map([["key2", 42]]), // Map with number values
      set: new Set(["value1", "value2"]), // Set with string values
    });

    const objC = Store.create<MyClass>("MyClass", { child: objB });

    const objD = Store.create<MyClass>("MyClass", { description: "Object D" });

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