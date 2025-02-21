import { EternalObject } from "../handlers/InternalTypes";
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

    interface Person extends EternalObject { uuid: string; name: string; age: number; id: string }


    test("Undo should revert to the previous state", () => {
        let userAlice: Person = store.createObject<Person>("User");

        userAlice = store.produce((user: EternalObject) => {
            const person = user as Person;
            person.name = "Alice";
        }, userAlice)!;

        store.produce((user: EternalObject) => {
            const person = user as Person;
            person.name = "Bob";
        }, userAlice);

        expect(store.getState().getObject<Person>(userAlice.uuid)?.name).toBe("Bob");

        store.undo();

        expect(store.getState().getObject<Person>(userAlice.uuid)?.name).toBe("Alice");
    });

    test("Redo should reapply a reverted state", () => {
        let user: Person = store.createObject<Person>("User");

        user = store.produce((user: EternalObject) => {
            const person = user as Person;
            person.name = "Alice";
        }, user)!;

        user = store.produce((user: EternalObject) => {
            const person = user as Person;
            person.name = "Bob";
        }, user)!;

        store.undo();
        expect(store.getState().getObject<Person>(user.uuid)?.name).toBe("Alice");

        store.redo();
        expect(store.getState().getObject<Person>(user.uuid)?.name).toBe("Bob");
    });

    test("New changes after undo should clear redo history", () => {
        let user: Person = store.createObject<Person>("User");

        user = store.produce((user: EternalObject) => {
            const person = user as Person;
            person.name = "Alice";
        }, user)!;

        user = store.produce((user: EternalObject) => {
            const person = user as Person;
            person.name = "Bob";
        }, user)!;

        store.undo();
        expect(store.getState().getObject<Person>(user.uuid)?.name).toBe("Alice");

        user = store.produce((user: EternalObject) => {
            const person = user as Person;
            person.name = "Charlie";
        }, user)!;

        expect(store.getState().getObject<Person>(user.uuid)?.name).toBe("Charlie");

        expect(store.redo()).toBe(false); // Redo history should be cleared
    });

    test("Undo at initial state should do nothing", () => {
        expect(store.undo()).toBe(false);
    });

    test("Redo at latest state should do nothing", () => {
        let user: Person = store.createObject<Person>("User");

        user = store.produce((user: EternalObject) => {
            const person = user as Person;
            person.name = "Alice";
        }, user)!;

        user = store.produce((user: EternalObject) => {
            const person = user as Person;
            person.name = "Bob";
        }, user)!;

        expect(store.redo()).toBe(false); // Already at latest state
    });
});