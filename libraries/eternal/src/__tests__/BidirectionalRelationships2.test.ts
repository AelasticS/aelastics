import { EternalObject } from "../handlers/InternalTypes";
import { createStore } from "../StoreFactory";

describe("Bidirectional Relationships & Cyclic References", () => {
    let store:  ReturnType<typeof createStore>;

    beforeEach(() => {
        store = createStore(new Map([
            ["Parent", {
                name: "Parent",
                properties: new Map([
                    ["name", { name: "name", type: "string" }],
                    ["children", { name: "children", type: "array", inverseType: "Child", inverseProp: "parent" }]
                ])
            }],
            ["Child", {
                name: "Child",
                properties: new Map([
                    ["name", { name: "name", type: "string" }],
                    ["parent", { name: "parent", type: "object", inverseType: "Parent", inverseProp: "children" }]
                ])
            }]
        ]));
    });

    interface Parent {
        name: string;
        children: Child[];
    }

    interface Child {
        name: string;
        parent: Parent;
    }

    test("Bidirectional relationships should be correctly maintained", () => {
        const parent = store.createObject<Parent>("Parent") as Parent;
 

        const child1 = store.createObject<Child>("Child") as Child;


        const child2 = store.createObject<Child>("Child") as Child;


        store.updateState(() => {
            parent.name = "Root";
            child1.name = "Child 1";
            child2.name = "Child 2";
            parent.children.push(child1);
            parent.children.push(child2);
        });

        expect(parent.children).toHaveLength(2);
        expect(child1.parent).toBe(parent);
        expect(child2.parent).toBe(parent);
    });

    test("Updating parent-child relationship should not cause infinite loops", () => {
        const parent = store.createObject<Parent>("Parent") as Parent;
 

        const child = store.createObject<Child>("Child") as Child;


        store.updateState(() => {
            parent.name = "Root";
            child.name = "Child 1";
            parent.children.push(child);
        });

        expect(parent.children).toContain(child);
        expect(child.parent).toBe(parent);

        // Update child's parent to a new parent
        const newParent = store.createObject<Parent>("Parent") as Parent;

        store.updateState(() => {
            newParent.name = "New Root";
            child.parent = newParent;
        });

        expect(child.parent).toBe(newParent);
        expect(newParent.children).toContain(child);
        expect(parent.children).not.toContain(child);
    });

    test("Cyclic relationships should not cause errors", () => {
        const parent = store.createObject<Parent>("Parent") as Parent;

        const child = store.createObject<Child>("Child") as Child;

        // Introduce a cycle: child becomes its own grandparent
        store.updateState(() => {
            parent.name = "Root";
            child.name = "Child 1";
            parent.children.push(child);
            child.parent = parent;
        });

        expect(parent.children).toContain(child);
        expect(child.parent).toBe(parent);

        // Ensure cyclic relationship does not break serialization or cause infinite loops
        expect(() => JSON.stringify(parent)).not.toThrow();
    });
});
