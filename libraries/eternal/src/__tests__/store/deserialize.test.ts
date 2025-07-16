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

  test("Deserialize a simple object", () => {
    const store1 = createTestStore();
    const store2 = createTestStore();

    const objA = store1.create<MyClass>("/test/MyClass", { name: "Object A", age: 30 });

    const serialized = store1.serialize(objA);
    const deserialized = store2.deserialize(serialized);

    expect(deserialized.name).toBe("Object A");
    expect(deserialized.age).toBe(30);
  });

  test("Deserialize an object with collections", () => {
    const store1 = createTestStore();
    const store2 = createTestStore();

    const objA = store1.create<MyClass>("/test/MyClass", { name: "ObjectA", age: 30 });

    let objB = store1.create<MyClass>("/test/MyClass", {
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
    const store1 = createTestStore();
    const store2 = createTestStore();

    const objA = store1.create<MyClass>("/test/MyClass", { name: "ObjectA", age: 30 });

    let objB = store1.create<MyClass>("/test/MyClass", {
      name: "ObjectB",
      array: [objA],
      map: new Map([["key2", 42]]),
      set: new Set(["value1", "value2"]),
    });

    const objC = store1.create<MyClass>("/test/MyClass", { name: "ObjectC", child: objB });

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
    const store1 = createTestStore();
    const store2 = createTestStore();

    const objA = store1.create<MyClass>("/test/MyClass", { name: "Object A", age: 30 });

    const objB = store1.create<MyClass>("/test/MyClass", {
      name: "Object B",
      array: [objA],
      map: new Map([["key2", 42]]),
      set: new Set(["value1", "value2"]),
    });

    const objC = store1.create<MyClass>("/test/MyClass", { name:"Object C",child: objB });

    const objD = store1.create<MyClass>("/test/MyClass", { description: "Object D" });

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
