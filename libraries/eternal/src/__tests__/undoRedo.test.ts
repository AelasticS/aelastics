import { createStore } from "../StoreFactory"
import { TypeMeta } from "../handlers/MetaDefinitions"

describe("Store API: Undo/Redo Functionality", () => {
  let store: ReturnType<typeof createStore>

  beforeEach(() => {
    const metaInfo = new Map<string, TypeMeta>([
      [
        "User",
        {
          name: "User",
          properties: new Map([
            ["name", { name: "name", type: "string" }],
            ["age", { name: "age", type: "number" }],
          ]),
        },
      ],
    ])
    store = createStore(metaInfo)
  })

  interface User {
    uuid: string
    name: string
    age: number
  }

  test("Undo should revert to the previous state", () => {
    const user = store.createObject<User>("User")

    store.updateObject((u) => {
      user.name = "Alice"
    }, user)

    store.updateObject((u) => {
      u.name = "Bob"
    }, user)

    expect(store.getObject<User>(user.uuid)?.name).toBe("Bob")

    store.undo()
    expect(store.getObject<User>(user.uuid)?.name).toBe("Alice")
  })

  test("Redo should reapply the last undone change", () => {
    const user = store.createObject<User>("User")

    store.updateObject((u) => {
      user.name = "Alice"
    }, user)

    store.updateObject((u) => {
      u.name = "Bob"
    }, user)

    store.undo()
    expect(store.getObject<User>(user.uuid)?.name).toBe("Alice")

    store.redo()
    expect(store.getObject<User>(user.uuid)?.name).toBe("Bob")
  })

  test("New changes after undo should clear redo history", () => {
    const user = store.createObject<User>("User")

    store.updateObject((u) => {
      user.name = "Alice"
      u.name = "Bob"
    }, user)

    store.undo()
    expect(store.getObject<User>(user.uuid)?.name).toBe("Alice")

    store.updateObject((u) => {
      u.name = "Charlie"
    }, user)

    expect(store.getObject<User>(user.uuid)?.name).toBe("Charlie")

    expect(store.redo()).toBe(false) // Redo history should be cleared
  })

  test("Undo at initial state should return false", () => {
    expect(store.undo()).toBe(false)
  })

  test("Redo at latest state should return false", () => {
    const user = store.createObject<User>("User")

    store.updateObject((u) => {
    user.name = "Alice"
      u.name = "Bob"
    }, user)

    expect(store.redo()).toBe(false) // Already at latest state
  })
})
