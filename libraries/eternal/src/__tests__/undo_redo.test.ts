import { InternalObjectProps } from "../handlers/InternalTypes";
import { EternalStore } from "../EternalStore";

describe("Undo/Redo Functionality", () => {
    let store: EternalStore;

    beforeEach(() => {
        store = new EternalStore(new Map([
            ["User", {
                name: "User",
                properties: new Map([
                    ["id", { name: "id", type: "string" }],
                    ["name", { name: "name", type: "string" }],
                    ["age", { name: "age", type: "number" }]
                ])
            }]
        ]));
    });

    interface Person extends InternalObjectProps { uuid: string; name: string; age: number; id: string }

    test("Undo should revert to the previous state", () => {
        const userAlice: Person = store.createObject<Person>("User");
        userAlice.name = "Alice";

        store.produce((user: Person) => {
            user.name = "Bob";
        }, userAlice);

        expect(store.getState().getObject<Person>(userAlice.uuid)?.name).toBe("Bob");

        store.undo();

        expect(store.getState().getObject<Person>(userAlice.uuid)?.name).toBe("Alice");
    });

    test("Redo should reapply a reverted state", () => {
        const user: Person = store.createObject<Person>("User");
        user.name = "Alice";

        store.produce((user: Person) => {
            user.name = "Bob";
        }, user);

        store.undo();
        expect(store.getState().getObject<Person>(user.uuid)?.name).toBe("Alice");

        store.redo();
        expect(store.getState().getObject<Person>(user.uuid)?.name).toBe("Bob");
    });

    test("New changes after undo should clear redo history", () => {
        const user: Person = store.createObject<Person>("User");
        user.name = "Alice";

        store.produce((user: Person) => {
            user.name = "Bob";
        }, user);

        store.undo();
        expect(store.getState().getObject<Person>(user.uuid)?.name).toBe("Alice");

        store.produce((user: Person) => {
            user.name = "Charlie";
        }, user);

        expect(store.getState().getObject<Person>(user.uuid)?.name).toBe("Charlie");

        expect(store.redo()).toBe(false); // Redo history should be cleared
    });

    test("Undo at initial state should do nothing", () => {
        expect(store.undo()).toBe(false);
    });

    test("Redo at latest state should do nothing", () => {
        const user: Person = store.createObject<Person>("User");
        user.name = "Alice";

        store.produce((user: Person) => {
            user.name = "Bob";
        }, user);

        expect(store.redo()).toBe(false); // Already at latest state
    });
});