import { EternalObject } from "../../handlers/InternalTypes"
import { createStore } from "../../store/createStore"

describe("Bidirectional Relationships & Cyclic References", () => {
  let store: ReturnType<typeof createStore>

  beforeEach(() => {
    store = createStore(
      new Map([
        [
          "Parent",
          {
            qName: "Parent",
            properties: new Map([
              ["name", { qName: "name", name: "name", type: "string" }],
              [
                "children",
                {
                  qName: "children",
                  name: "children",
                  type: "array",
                  itemType: "object",
                  domainType: "Child",
                  inverseProp: "parent",
                  inverseType: "object",
                },
              ],
            ]),
          },
        ],
        [
          "Child",
          {
            qName: "Child",
            properties: new Map([
              ["name", { qName: "name", name: "name", type: "string" }],
              [
                "parent",
                {
                  qName: "parent",
                  name: "parent",
                  type: "object",
                  domainType: "Parent",
                  inverseProp: "children",
                  inverseType: "array",
                },
              ],
            ]),
          },
        ],
      ])
    )
  })

  interface Parent {
    name: string
    children: Child[]
  }

  interface Child {
    name: string
    parent: Parent
  }

  test("Bidirectional relationships should be correctly maintained", () => {
    let parent = store.createObject<Parent>("Parent") as Parent

    let child1 = store.createObject<Child>("Child") as Child

    let child2 = store.createObject<Child>("Child") as Child

    store.subscribeToObject(parent, (p) => {
      parent = p as Parent
    })
    store.subscribeToObject(child1, (c) => {
      child1 = c as Child
    })
    store.subscribeToObject(child2, (c) => {
      child2 = c as Child
    })
    store.updateStore(() => {
      parent.name = "Root"
      child1.name = "Child 1"
      child2.name = "Child 2"
      parent.children.push(child1)
      parent.children.push(child2)
    })

    parent = store.getObject((parent as unknown as EternalObject).uuid) as Parent
    child1 = store.getObject((child1 as unknown as EternalObject).uuid) as Child
    child2 = store.getObject((child2 as unknown as EternalObject).uuid) as Child

    expect(parent.children).toHaveLength(2)
    expect(child1.parent).toBe(parent)
    expect(child2.parent).toBe(parent)
  })

  test("Updating parent-child relationship should not cause infinite loops", () => {
    let parent = store.createObject<Parent>("Parent") as Parent

    let child = store.createObject<Child>("Child") as Child

    store.updateStore(() => {
      parent.name = "Root"
      child.name = "Child 1"
      parent.children.push(child)
    })

    parent = store.getObject((parent as unknown as EternalObject).uuid) as Parent
    child = store.getObject((child as unknown as EternalObject).uuid) as Child

    expect(parent.children[0]).toBe(child)
    expect(child.parent).toBe(parent)

    // Update child's parent to a new parent
    let newParent = store.createObject<Parent>("Parent") as Parent

    store.updateStore(() => {
      newParent.name = "New Root"
      child.parent = newParent
    })

    parent = store.getObject((parent as unknown as EternalObject).uuid) as Parent
    child = store.getObject((child as unknown as EternalObject).uuid) as Child
    newParent = store.getObject((newParent as unknown as EternalObject).uuid) as Parent

    expect(child.parent).toBe(newParent)
    expect(newParent.children[0]).toBe(child)
    expect(parent.children[0]).not.toBe(child)
  })

  test("Cyclic relationships should not cause errors", () => {
    let parent = store.createObject<Parent>("Parent") as Parent

    let child = store.createObject<Child>("Child") as Child

    // Introduce a cycle: child becomes its own grandparent
    store.updateStore(() => {
      parent.name = "Root"
      child.name = "Child 1"
      parent.children.push(child)
      child.parent = parent
    })

    parent = store.getObject((parent as unknown as EternalObject).uuid) as Parent
    child = store.getObject((child as unknown as EternalObject).uuid) as Child

    expect(parent.children[0]).toBe(child)
    expect(child.parent).toBe(parent)

    // Ensure cyclic relationship does not break serialization or cause infinite loops
    expect(() => JSON.stringify(parent)).not.toThrow()
  })
})
