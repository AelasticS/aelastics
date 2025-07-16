import { StoreClass } from "../../store/StoreClass"
import { RegistryService } from "../../registry/RegistryService"
import { Namespace, RegistryMetadata } from "../../registry/NamespaceMetadata"
import { ObjectTypeMeta, PropertyMeta } from "../../registry/TypeDefinitions"

interface Animal {
  name: string // Common property for all animals
}

interface Dog extends Animal {
  breed: string // Specific to Dog
}

interface Cat extends Animal {
  color: string // Specific to Cat
}

// Create animal hierarchy schema using the new registry system
function createAnimalNamespace(): Namespace {
  const animalTypeMeta: ObjectTypeMeta = {
    qName: "/test/Animal",
    category: "complex",
    kind: "object",
    properties: new Map([
      ["name", {
        name: "name",
        typeRef: "/std/string",
        optional: false,
        defaultValue: "Unnamed"
      } as PropertyMeta]
    ])
  };

  const dogTypeMeta: ObjectTypeMeta = {
    qName: "/test/Dog",
    category: "complex",
    kind: "object",
    extends: "/test/Animal",
    properties: new Map([
      ["breed", {
        name: "breed",
        typeRef: "/std/string",
        optional: false,
        defaultValue: "Unknown"
      } as PropertyMeta]
    ])
  };

  const catTypeMeta: ObjectTypeMeta = {
    qName: "/test/Cat",
    category: "complex",
    kind: "object",
    extends: "/test/Animal",
    properties: new Map([
      ["color", {
        name: "color",
        typeRef: "/std/string",
        optional: false,
        defaultValue: "Unknown"
      } as PropertyMeta]
    ])
  };

  return {
    qName: "/test",
    version: "1.0.0",
    types: new Map([
      ["Animal", animalTypeMeta],
      ["Dog", dogTypeMeta],
      ["Cat", catTypeMeta]
    ]),
    exports: ["Animal", "Dog", "Cat"],
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
  const namespace = createAnimalNamespace();
  
  registry.importNamespace(namespace);
  return new StoreClass(registry);
}

describe("StoreClass - find", () => {
  let store: StoreClass

  beforeEach(() => {
    store = createTestStore()

    // Populate the store with objects
    store.create<Animal>("/test/Animal", { name: "Generic Animal" })
    store.create<Dog>("/test/Dog", { name: "Buddy", breed: "Golden Retriever" })
    store.create<Cat>("/test/Cat", { name: "Whiskers", color: "Black" })
  })

  it("should find all objects of a specific type", () => {
    const animals = store.find<Animal>("/test/Animal")
    expect(animals).toHaveLength(3) // Includes Animal, Dog, and Cat
    expect(animals.map((a) => a.name)).toEqual(expect.arrayContaining(["Generic Animal", "Buddy", "Whiskers"]))
  })

  it("should find objects of a specific type with a predicate", () => {
    const dogs = store.find<Dog>("/test/Dog", (dog) => dog.breed === "Golden Retriever")
    expect(dogs).toHaveLength(1)
    expect(dogs[0].name).toBe("Buddy")
    expect(dogs[0].breed).toBe("Golden Retriever")
  })

  it("should find objects in a specific state", () => {
    // Assume the store has multiple states and we are searching in a specific state
    const animalsInState = store.find<Animal>("Animal", undefined, 0) // Search in state 0
    expect(animalsInState).toHaveLength(1) // Includes Animal
  })

  it("should find objects of a subtype", () => {
    const dogs = store.find<Dog>("/test/Dog")
    expect(dogs).toHaveLength(1) // Only Dog objects
    expect(dogs[0].name).toBe("Buddy")
    expect(dogs[0].breed).toBe("Golden Retriever")
  })

  it("should handle an empty store", () => {
    // Create an empty store
    const emptyStore = createTestStore()
    const animals = emptyStore.find<Animal>("/test/Animal")
    expect(animals).toHaveLength(0) // No objects in the store
  })

  it("should throw an error for an invalid type", () => {
    expect(() => store.find<Animal>("/test/InvalidType")).toThrow()
  })

  it("should throw an error for an invalid state", () => {
    expect(() => store.find<Animal>("/test/Animal", undefined, 999)).toThrow()
  })
})
