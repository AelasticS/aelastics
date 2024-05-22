// RUN inside aelastics-store folder:
// heft test --test-path-pattern ./src/test-implementation/implementation-scenario-3.test.ts

import { iFoo, TestStore } from "./implementation-scenario-3"

let parent: iFoo
let child: iFoo
let store: TestStore

describe("produce only the state", () => {
  beforeAll(() => {
    store = new TestStore()
    parent = store.newObject("1", "parent")
    child = store.newObject("2", "child")
  })
  test("Add stuff to state", () => {
    store.produce((draft) => {
      draft.push(parent)
      draft.push(child)
    })
    const state = store.getState()

    expect(state[0]).toBe(parent)
    expect(state[1]).toBe(child)
  })

  test("Add relation between foos", () => {
    store.produce((draft) => {
      draft[1].parent = draft[0]
    })
    const state = store.getState()

    expect(state[0]?.child).toBe(state[1])
    expect(state[1]?.parent).toBe(state[0])
  })

  test("change name of the nested parent", () => {
    const initialparent = store.getState()[0]

    store.produce((draft) => {
      draft[1].parent.name = "new name"
    })
    const state = store.getState()

    expect(state[0].name).toBe("new name")
    expect(state[0]).not.toBe(initialparent)
  })
})
