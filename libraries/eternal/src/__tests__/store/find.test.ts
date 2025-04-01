import { TypeMeta } from "../../meta/InternalSchema"
import { StoreClass } from "../../store/StoreClass"

interface Animal {
  name: string // Common property for all animals
}

interface Dog extends Animal {
  breed: string // Specific to Dog
}

interface Cat extends Animal {
  color: string // Specific to Cat
}

// Define a schema with a type hierarchy
const animalMeta: TypeMeta = {
  qName: "Animal",
  properties: new Map([["name", { type: "string", defaultValue: "Unnamed", qName: "name" }]]),
}

const dogMeta: TypeMeta = {
  qName: "Dog",
  extends: "Animal",
  properties: new Map([["breed", { type: "string", defaultValue: "Unknown", qName: "breed" }]]),
}

const catMeta: TypeMeta = {
  qName: "Cat",
  extends: "Animal",
  properties: new Map([["color", { type: "string", defaultValue: "Unknown", qName: "color" }]]),
}

describe("StoreClass - find", () => {
  let store: StoreClass

  beforeEach(() => {
    // Add the schema to the store's metadata
    const mockMetaInfo = new Map<string, TypeMeta>()
    mockMetaInfo.set("Animal", animalMeta)
    mockMetaInfo.set("Dog", dogMeta)
    mockMetaInfo.set("Cat", catMeta)

    store = new StoreClass(mockMetaInfo)

    // Populate the store with objects
    store.create<Animal>("Animal", { name: "Generic Animal" })
    store.create<Dog>("Dog", { name: "Buddy", breed: "Golden Retriever" })
    store.create<Cat>("Cat", { name: "Whiskers", color: "Black" })
  })

  it("should find all objects of a specific type", () => {
    const animals = store.find<Animal>("Animal")
    expect(animals).toHaveLength(3) // Includes Animal, Dog, and Cat
    expect(animals.map((a) => a.name)).toEqual(expect.arrayContaining(["Generic Animal", "Buddy", "Whiskers"]))
  })

  it("should find objects of a specific type with a predicate", () => {
    const dogs = store.find<Dog>("Dog", (dog) => dog.breed === "Golden Retriever")
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
    const dogs = store.find<Dog>("Dog")
    expect(dogs).toHaveLength(1) // Only Dog objects
    expect(dogs[0].name).toBe("Buddy")
    expect(dogs[0].breed).toBe("Golden Retriever")
  })

  it("should handle an empty store", () => {
    // Create an empty store
    // Add the schema to the store's metadata
    const mockMetaInfo = new Map<string, TypeMeta>()
    mockMetaInfo.set("Animal", animalMeta)
    mockMetaInfo.set("Dog", dogMeta)
    mockMetaInfo.set("Cat", catMeta)
    const emptyStore = new StoreClass(mockMetaInfo)
    const animals = emptyStore.find<Animal>("Animal")
    expect(animals).toHaveLength(0) // No objects in the store
  })

  it("should throw an error for an invalid type", () => {
    expect(() => store.find<Animal>("InvalidType")).toThrow("Unknown type: InvalidType. Cannot search for objects.")
  })

  it("should throw an error for an invalid state", () => {
    expect(() => store.find<Animal>("Animal", undefined, 999)).toThrow("State at index 999 does not exist.")
  })
})
