// RUN inside aelastics-store folder:
// heft test --test-path-pattern ./src/test-implementation/test.test.ts

import { iFoo, ImmerState, ImmutableTestStore, TestStore } from "./test"

let parent: iFoo
let child: iFoo
let store: any
let immutableStore: ImmutableTestStore

// describe("produce only the state", () => {
//   beforeAll(() => {
//     store = new TestStore()
//     parent = store.newObject("1", "parent")
//     child = store.newObject("2", "child")
//   })
//   test("Add stuff to state", () => {
//     store.produce((draft) => {
//       draft.push(parent)
//       draft.push(child)
//     })
//     const state = store.getState()

//     expect(state[0]).toBe(parent)
//     expect(state[1]).toBe(child)
//   })

//   test("Add relation between foos", () => {
//     store.produce((draft) => {
//       draft[1].parent = draft[0]
//     })
//     const state = store.getState()

//     expect(state[0]?.child).toBe(state[1])
//     expect(state[1]?.parent).toBe(state[0])
//   })

//   test("change name of the nested parent", () => {
//     store.produce((draft) => {
//       draft[1].parent.name = "new name"
//     })

// const state = store.getState()
// expect(state[0].name).toBe("new name")
//   })
// })
// ------------------------------------------------------------
// describe("produce the state and the map", () => {
//   beforeAll(() => {
//     store = new TestStore()
//     parent = store.newObject("1", "parent")
//     child = store.newObject("2", "child")
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

//     expect(state[0]?.child).toBe(state[1])
//     expect(state[1]?.parent).toBe(state[0])
//   })

//   test("change name of the nested parent", () => {
//     store.produceWithIdMap((draft) => {
//       draft[1].parent.name = "new name"
//     })

//     const state = store.getState()
//     expect(state[0].name).toBe("new name")
//   })
// })
// ------------------------------------------------------------

describe("produce the state and update the id map", () => {
  beforeAll(() => {
    store = new TestStore()
    parent = store.newObject("1", "parent")
    child = store.newObject("2", "child")
  })
  test("Add stuff to state", () => {
    store.produceAndUpdateIdMap((draft: any[]) => {
      draft.push(parent)
      draft.push(child)
    })
    const state = store.getState()

    expect(state[0]).toBe(parent)
    expect(state[1]).toBe(child)
  })

  test("Add relation between foos", () => {
    store.produceAndUpdateIdMap((draft: any[]) => {
      draft[1].parent = draft[0]
    })
    const state = store.getState()

    expect(state[0]?.child).toBe(state[1])
    expect(state[1]?.parent).toBe(state[0])
  })

  // state = [foo1, foo2]
  // idMap = { "1": foo1, "2": foo2 }

  test("change name of the nested parent", () => {
    const initialparent = store.getState()[0]
    store.produceAndUpdateIdMap((draft: ImmerState) => {
      // store._idMap.set(draft[0].id, draft[0])
      draft!.state[1]!.setParentName("new name", draft.idMap)
    })

    const state = store.getState()
    //check that this is a new object
    expect(state[0]).not.toBe(initialparent)
    expect(state[0].name).toBe("new name")
  })

  // test("change name of the nested parent", () => {
  //   const initialparent = store.getState()[0]
  //   store.produceAndUpdateIdMap((draft: ImmerState) => {
  //     // store._idMap.set(draft[0].id, draft[0])
  //     draft!.state[1]!.parent!.name = "new name"
  //   })

  //   const state = store.getState()
  //   //check that this is a new object
  //   expect(state[0]).not.toBe(initialparent)
  //   expect(state[0].name).toBe("new name")
  // })
})
// ------------------------------------------------------------

// describe("produce the entire store", () => {
//   beforeAll(() => {
//     immutableStore = new ImmutableTestStore()
//     parent = immutableStore.newObject("1", "parent")
//     child = immutableStore.newObject("2", "child")
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

// const state = immutableStore.getState()
// expect(state[0].name).toBe("new name")
//   })
// })
// ------------------------------------------------------------

// describe("produce the state and update the id map but and store in a separate class", () => {
//   beforeAll(() => {
//     store = new TestStorewithImmutableImmerState()
//     parent = store.newObject("1", "parent")
//     child = store.newObject("2", "child")
//   })
//   test("Add stuff to state", () => {
//     store.produce((draft: any[]) => {
//       draft.push(parent)
//       draft.push(child)
//     })
//     const state = store.getState()

//     expect(state[0]).toBe(parent)
//     expect(state[1]).toBe(child)
//   })

//   test("Add relation between foos", () => {
//     store.produce((draft: any[]) => {
//       draft[1].parent = draft[0]
//     })
//     const state = store.getState()

//     expect(state[0]?.child).toBe(state[1])
//     expect(state[1]?.parent).toBe(state[0])
//   })

//   test("change name of the nested parent", () => {
//     const initialparent = store.getState()[0]
//     store.produce((draft: any[]) => {
//       draft[1].parent.name = "new name"
//     })

//     const state = store.getState()
//     //check that this is a new object
//     expect(state[0]).not.toBe(initialparent)
//     expect(state[0].name).toBe("new name")
//   })
// })
// ------------------------------------------------------------
