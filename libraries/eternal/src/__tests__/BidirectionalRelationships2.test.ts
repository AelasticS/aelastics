import { EternalStore } from "../EternalStore";
import { InternalObjectProps } from "../handlers/InternalTypes";

describe("Bidirectional Relationships & Cyclic References", () => {
    let store: EternalStore;

    beforeEach(() => {
        store = new EternalStore(new Map([
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
 

        const child1 = store.createObject<Child>("Child") as Child;


        const child2 = store.createObject<Child>("Child") as Child;


        store.produce((p: InternalObjectProps) => {
            parent.name = "Root";
            child1.name = "Child 1";
            child2.name = "Child 2";
            const p1 = p as unknown as Parent;
            p1.children.push(child1);
            p1.children.push(child2);
        }, parent);

        expect(parent.children).toHaveLength(2);
        expect(child1.parent).toBe(parent);
        expect(child2.parent).toBe(parent);
    });

    test("Updating parent-child relationship should not cause infinite loops", () => {
        const parent = store.createObject<Parent>("Parent") as Parent;
 

        const child = store.createObject<Child>("Child") as Child;


        store.produce((p: InternalObjectProps) => {
            parent.name = "Root";
            child.name = "Child 1";
            const p1 = p as unknown as Parent;
            p1.children.push(child);
        }, parent);

        expect(parent.children).toContain(child);
        expect(child.parent).toBe(parent);

        // Update child's parent to a new parent
        const newParent = store.createObject<Parent>("Parent") as Parent;

        store.produce((c: InternalObjectProps) => {
            newParent.name = "New Root";
            const c1 = c as unknown as Child;
            c1.parent = newParent;
        }, child);

        expect(child.parent).toBe(newParent);
        expect(newParent.children).toContain(child);
        expect(parent.children).not.toContain(child);
    });

    test("Cyclic relationships should not cause errors", () => {
        const parent = store.createObject<Parent>("Parent") as Parent;

        const child = store.createObject<Child>("Child") as Child;

        // Introduce a cycle: child becomes its own grandparent
        store.produce((p: InternalObjectProps) => {
            parent.name = "Root";
            child.name = "Child 1";
            const p1 = p as unknown as Parent;
            p1.children.push(child);
            child.parent = p1;
        }, parent);

        expect(parent.children).toContain(child);
        expect(child.parent).toBe(parent);

        // Ensure cyclic relationship does not break serialization or cause infinite loops
        expect(() => JSON.stringify(parent)).not.toThrow();
    });
});
