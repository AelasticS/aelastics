import { Store } from "../Store";

describe("Bidirectional Relationships & Cyclic References", () => {
    let store: Store;

    beforeEach(() => {
        store = new Store(new Map([
            ["Parent", {
                name: "Parent",
                properties: new Map([
                    ["uuid", { name: "uuid", type: "string" }],
                    ["name", { name: "name", type: "string" }],
                    ["children", { name: "children", type: "array", inverseType: "Child", inverseProp: "parent" }]
                ])
            }],
            ["Child", {
                name: "Child",
                properties: new Map([
                    ["uuid", { name: "uuid", type: "string" }],
                    ["name", { name: "name", type: "string" }],
                    ["parent", { name: "parent", type: "object", inverseType: "Parent", inverseProp: "children" }]
                ])
            }]
        ]));
    });

    interface Parent {
        uuid: string;
        name: string;
        children: Child[];
    }

    interface Child {
        uuid: string;
        name: string;
        parent: Parent;
    }

    test("Bidirectional relationships should be correctly maintained", () => {
        const parent = store.createObject<Parent>("Parent") as Parent;
        parent.name = "Root";

        const child1 = store.createObject<Child>("Child") as Child;
        child1.name = "Child 1";

        const child2 = store.createObject<Child>("Child") as Child;
        child2.name = "Child 2";

        store.produce((p: Parent) => {
            p.children.push(child1);
            p.children.push(child2);
        }, parent);

        expect(parent.children).toHaveLength(2);
        expect(child1.parent).toBe(parent);
        expect(child2.parent).toBe(parent);
    });

    test("Updating parent-child relationship should not cause infinite loops", () => {
        const parent = store.createObject<Parent>("Parent") as Parent;
        parent.name = "Root";

        const child = store.createObject<Child>("Child") as Child;
        child.name = "Child 1";

        store.produce((p: Parent) => {
            p.children.push(child);
        }, parent);

        expect(parent.children).toContain(child);
        expect(child.parent).toBe(parent);

        // Update child's parent to a new parent
        const newParent = store.createObject<Parent>("Parent") as Parent;
        newParent.name = "New Root";

        store.produce((c: Child) => {
            c.parent = newParent;
        }, child);

        expect(child.parent).toBe(newParent);
        expect(newParent.children).toContain(child);
        expect(parent.children).not.toContain(child);
    });

    test("Cyclic relationships should not cause errors", () => {
        const parent = store.createObject<Parent>("Parent") as Parent;
        parent.name = "Root";

        const child = store.createObject<Child>("Child") as Child;
        child.name = "Child 1";

        // Introduce a cycle: child becomes its own grandparent
        store.produce((p: Parent, c: Child) => {
            p.children.push(c);
            c.parent = p;
        }, parent, child);

        expect(parent.children).toContain(child);
        expect(child.parent).toBe(parent);

        // Ensure cyclic relationship does not break serialization or cause infinite loops
        expect(() => JSON.stringify(parent)).not.toThrow();
    });
});
