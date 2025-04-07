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

    test("Deserialize a simple object", () => {
        const objA = Store.create<MyClass>("MyClass", { name: "Object A", age: 30 });
      
        const serialized = Store.serializeObject(objA);
        const deserialized = Store.deserializeObject(serialized);
      
        expect(deserialized).toEqual(objA);
        expect(deserialized.name).toBe("Object A");
        expect(deserialized.age).toBe(30);
      });
      
      test("Deserialize an object with collections", () => {
        const objA = Store.create<MyClass>("MyClass", { name: "ObjectA", age: 30 });
      
        let objB = Store.create<MyClass>("MyClass", {
          name: "ObjectB",
          array: [objA],
          map: new Map([["key2", 42]]),
          set: new Set(["value1", "value2"]),
        });
      
        objB = Store.update<MyClass>((o) => {
          o.map?.set("key1", 99);
          o.set?.add("value3");
        }, objB);
      
        const serialized = Store.serializeObject(objB);
        const deserialized = Store.deserializeObject(serialized);
      
        expect(deserialized).toEqual(objB);
        expect(deserialized.array?.[0]).toEqual(objA);
        expect(deserialized.map?.get("key2")).toBe(42);
        expect(deserialized.map?.get("key1")).toBe(99);
        expect(deserialized.set).toContain("value1");
        expect(deserialized.set).toContain("value2");
        expect(deserialized.set).toContain("value3");
      });
      
      test("Deserialize an object with circular references", () => {
        const objA = Store.create<MyClass>("MyClass", { name: "ObjectA", age: 30 });
      
        let objB = Store.create<MyClass>("MyClass", {
          name: "ObjectB",
          array: [objA],
          map: new Map([["key2", 42]]),
          set: new Set(["value1", "value2"]),
        });
      
        const objC = Store.create<MyClass>("MyClass", { name: "ObjectC", child: objB });
      
        objB = Store.update<MyClass>((o) => {
          o.parent = objC; // Circular reference
        }, objB);
      
        const serialized = Store.serializeObject(objC);
        const deserialized = Store.deserializeObject(serialized);
      
        expect(deserialized).toEqual(objC);
        expect(deserialized.child).toEqual(objB);
        expect(deserialized.child?.parent).toEqual(objC); // Verify circular reference
      });
      
      test("Deserialize a complex object with mixed structures", () => {
        const objA = Store.create<MyClass>("MyClass", { name: "Object A", age: 30 });
      
        const objB = Store.create<MyClass>("MyClass", {
          array: [objA],
          map: new Map([["key2", 42]]),
          set: new Set(["value1", "value2"]),
        });
      
        const objC = Store.create<MyClass>("MyClass", { child: objB });
      
        const objD = Store.create<MyClass>("MyClass", { description: "Object D" });
      
        Store.update<MyClass>((o) => {
          o.array?.push(objA, objD);
          o.map?.set("key1", 99);
          o.map?.set("key3", 100);
          o.set?.add("value3");
          o.parent = objC; // Circular reference
        }, objB);
      
        const serialized = Store.serializeObject(objC);
        const deserialized = Store.deserializeObject(serialized);
      
        expect(deserialized).toEqual(objC);
        expect(deserialized.child).toEqual(objB);
        expect(deserialized.child?.array).toContain(objA);
        expect(deserialized.child?.array).toContain(objD);
        expect(deserialized.child?.map?.get("key1")).toBe(99);
        expect(deserialized.child?.map?.get("key2")).toBe(42);
        expect(deserialized.child?.map?.get("key3")).toBe(100);
        expect(deserialized.child?.set).toContain("value1");
        expect(deserialized.child?.set).toContain("value2");
        expect(deserialized.child?.set).toContain("value3");
        expect(deserialized.child?.parent).toEqual(objC); // Verify circular reference
      });

  });
  