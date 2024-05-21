// RUN inside aelastics-store folder:
// heft test --test-path-pattern ./src/test-implementation/test.test.ts

import { iFoo, ImmutableTestStore, TestStore } from "./test"

let parent: iFoo
let child: iFoo
let store: TestStore
let immutableStore: ImmutableTestStore

describe("produce only the state", () => {
  beforeAll(() => {
    store = new TestStore()
    parent = store.createObj("1", "parent")
    child = store.createObj("2", "child")
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

    expect(state[0]?.parent).toBe(state[1])
    expect(state[1]?.child).toBe(state[0])
  })

  test("change name of the nested parent", () => {
    store.produce((draft) => {
      draft[1].parent.name = "new name"
    })
  })
})
// ------------------------------------------------------------
// describe("produce the state and the map", () => {
//   beforeAll(() => {
//     store = new TestStore()
//     parent = store.createObj("1", "parent")
//     child = store.createObj("2", "child")
//   })
//   test("Add stuff to state", () => {
//     store.produceWithIdMap((draft) => {
//       draft.push(parent)
//       draft.push(child)
//     })
//     const state = store.getState()

//     expect(state[0]).toBe(parent)
//     expect(state[1]).toBe(child)
//   })

//   test("Add relation between foos", () => {
//     store.produceWithIdMap((draft) => {
//       draft[1].parent = draft[0]
//     })
//     const state = store.getState()

//     expect(state[0]?.parent).toBe(state[1])
//     expect(state[1]?.child).toBe(state[0])
//   })

//   test("change name of the nested parent", () => {
//     store.produceWithIdMap((draft) => {
//       draft[1].parent.name = "new name"
//     })
//   })
// })
// ------------------------------------------------------------
// describe("produce the entire store", () => {
//   beforeAll(() => {
//     immutableStore = new ImmutableTestStore()
//     parent = immutableStore.createObj("1", "parent")
//     child = immutableStore.createObj("2", "child")
//   })
//   test("Add stuff to state", () => {
//     immutableStore = immutableStore.produce((draft) => {
//       draft.push(parent)
//       draft.push(child)
//     })
//     const state = immutableStore.getState()

//     expect(state[0]).toBe(parent)
//     expect(state[1]).toBe(child)
//   })

//   test("Add relation between foos", () => {
//     immutableStore = immutableStore.produce((draft) => {
//       draft[1].parent = parent
//     })
//     const state = immutableStore.getState()

//     expect(state[0]?.parent).toBe(state[1])
//     expect(state[1]?.child).toBe(state[0])
//   })

//   test("change name of the nested parent", () => {
//     immutableStore = immutableStore.produce((draft) => {
//       draft[1].parent.name = "new name"
//     })
//   })
// })
