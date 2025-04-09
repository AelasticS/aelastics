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
  const myClassMeta: TypeMeta = {
    qName: "MyClass",
    properties: new Map([
      ["name", { type: "string", qName: "name" }],
      ["age", { type: "number", qName: "age" }],
      ["array", { type: "array", domainType: "MyClass", qName: "array", itemType: "object" }],
      ["map", { type: "map", domainType: "number", qName: "map" }],
      ["set", { type: "set", domainType: "string", qName: "set" }],
      ["child", { type: "object", domainType: "MyClass", qName: "child" }],
      ["parent", { type: "object", domainType: "MyClass", qName: "parent" }],
      ["description", { type: "string", qName: "description" }],
    ]),
  };

  const metaInfo = new Map<string, TypeMeta>([["MyClass", myClassMeta]]);

  test("Deserialize a simple object", () => {
    const store1 = new StoreClass(metaInfo);
    const store2 = new StoreClass(metaInfo);

    const objA = store1.create<MyClass>("MyClass", { name: "Object A", age: 30 });

    const serialized = store1.serialize(objA);
    const deserialized = store2.deserialize(serialized);

    expect(deserialized.name).toBe("Object A");
    expect(deserialized.age).toBe(30);
  });

  test("Deserialize an object with collections", () => {
    const store1 = new StoreClass(metaInfo);
    const store2 = new StoreClass(metaInfo);

    const objA = store1.create<MyClass>("MyClass", { name: "ObjectA", age: 30 });

    let objB = store1.create<MyClass>("MyClass", {
      name: "ObjectB",
      array: [objA],
      map: new Map([["key2", 42]]),
      set: new Set(["value1", "value2"]),
    });

    objB = store1.update<MyClass>((o) => {
      o.map?.set("key1", 99);
      o.set?.add("value3");
    }, objB);

    const serialized = store1.serialize(objB);
    const deserialized = store2.deserialize(serialized);

    expect(deserialized.name).toBe("ObjectB");
    const el = deserialized.array[0];
    expect(deserialized.array[0].name).toBe("ObjectA");
    expect(deserialized.map?.get("key2")).toBe(42);
    expect(deserialized.map?.get("key1")).toBe(99);
    expect(deserialized.set).toContain("value1");
    expect(deserialized.set).toContain("value2");
    expect(deserialized.set).toContain("value3");
  });

  test("Deserialize an object with circular references", () => {
    const store1 = new StoreClass(metaInfo);
    const store2 = new StoreClass(metaInfo);

    const objA = store1.create<MyClass>("MyClass", { name: "ObjectA", age: 30 });

    let objB = store1.create<MyClass>("MyClass", {
      name: "ObjectB",
      array: [objA],
      map: new Map([["key2", 42]]),
      set: new Set(["value1", "value2"]),
    });

    const objC = store1.create<MyClass>("MyClass", { name: "ObjectC", child: objB });

    objB = store1.update<MyClass>((o) => {
      o.parent = objC;
    }, objB);

    const serialized = store1.serialize(objC);
    const deserialized = store2.deserialize(serialized);

    expect(deserialized.name).toBe("ObjectC");
    expect(deserialized.child?.name).toBe("ObjectB");
    expect(deserialized.child?.parent?.name).toBe("ObjectC");
  });

  test("Deserialize a complex object with mixed structures", () => {
    const store1 = new StoreClass(metaInfo);
    const store2 = new StoreClass(metaInfo);

    const objA = store1.create<MyClass>("MyClass", { name: "Object A", age: 30 });

    const objB = store1.create<MyClass>("MyClass", {
      name: "Object B",
      array: [objA],
      map: new Map([["key2", 42]]),
      set: new Set(["value1", "value2"]),
    });

    const objC = store1.create<MyClass>("MyClass", { name:"Object C",child: objB });

    const objD = store1.create<MyClass>("MyClass", { description: "Object D" });

    store1.update<MyClass>((o) => {
      o.array?.push(objD);
      o.map?.set("key1", 99);
      o.map?.set("key3", 100);
      o.set?.add("value3");
      o.parent = objC;
    }, objB);

    const serialized = store1.serialize(objC);
    const deserialized = store2.deserialize(serialized);

    expect(deserialized.child?.array?.[0].name).toBe("Object A");
    expect(deserialized.child?.array?.[1].description).toBe("Object D");
    expect(deserialized.child?.map?.get("key1")).toBe(99);
    expect(deserialized.child?.map?.get("key2")).toBe(42);
    expect(deserialized.child?.map?.get("key3")).toBe(100);
    expect(deserialized.child?.set).toContain("value1");
    expect(deserialized.child?.set).toContain("value2");
    expect(deserialized.child?.set).toContain("value3");
    expect(deserialized.child?.parent?.child).toBe(deserialized.child);
  });
});
