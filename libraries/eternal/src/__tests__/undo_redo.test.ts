import { StoreObject, uuid } from "../handlers/InternalTypes";
import { StoreClass } from "../store/StoreClass";

describe("Undo/Redo Functionality", () => {
    let store: StoreClass;

    beforeEach(() => {
        store = new StoreClass(new Map([
            ["User", {
                qName: "User",
                properties: new Map([
                    ["id", { qName: "id", type: "string" }],
                    ["name", { qName: "name", type: "string" }],
                    ["age", { qName: "age", type: "number" }],
                    ["tags", { qName: "tags", type: "array" }]                ])
            }]
        ]));
    });

    interface Person extends StoreObject { uuid: string; name: string; age: number; id: string }


    test("Undo should revert to the previous state", () => {
        let userAlice: Person = store.createObject<Person>("User");

        userAlice = store.produce((user: StoreObject) => {
            const person = user as Person;
            person.name = "Alice";
        }, userAlice)!;

        store.produce((user: StoreObject) => {
            const person = user as Person;
            person.name = "Bob";
        }, userAlice);

        expect(store.getState().getObject<Person>(userAlice[uuid])?.name).toBe("Bob");

        store.undo();

        expect(store.getState().getObject<Person>(userAlice[uuid])?.name).toBe("Alice");
    });

    test("Redo should reapply a reverted state", () => {
        let user: Person = store.createObject<Person>("User");

        user = store.produce((user: StoreObject) => {
            const person = user as Person;
            person.name = "Alice";
        }, user)!;

        user = store.produce((user: StoreObject) => {
            const person = user as Person;
            person.name = "Bob";
        }, user)!;

        store.undo();
        expect(store.getState().getObject<Person>(user[uuid])?.name).toBe("Alice");

        store.redo();
        expect(store.getState().getObject<Person>(user[uuid])?.name).toBe("Bob");
    });

    test("New changes after undo should clear redo history", () => {
        let user: Person = store.createObject<Person>("User");

        user = store.produce((user: StoreObject) => {
            const person = user as Person;
            person.name = "Alice";
        }, user)!;

        user = store.produce((user: StoreObject) => {
            const person = user as Person;
            person.name = "Bob";
        }, user)!;

        store.undo();
        expect(store.getState().getObject<Person>(user[uuid])?.name).toBe("Alice");

        user = store.produce((user: StoreObject) => {
            const person = user as Person;
            person.name = "Charlie";
        }, user)!;

        expect(store.getState().getObject<Person>(user[uuid])?.name).toBe("Charlie");

        expect(store.redo()).toBe(false); // Redo history should be cleared
    });

    test("Undo at initial state should do nothing", () => {
        expect(store.undo()).toBe(false);
    });

    test("Redo at latest state should do nothing", () => {
        let user: Person = store.createObject<Person>("User");

        user = store.produce((user: StoreObject) => {
            const person = user as Person;
            person.name = "Alice";
        }, user)!;

        user = store.produce((user: StoreObject) => {
            const person = user as Person;
            person.name = "Bob";
        }, user)!;

        expect(store.redo()).toBe(false); // Already at latest state
    });
    test("Undo/Redo on array push operation", () => {
        let user: Person = store.createObject<Person>("User");
        user = store.produce((obj: StoreObject) => {
            obj.name = "Alice";
        }, user)!;

        store.produce(() => {
            user.tags.push("tag1");
        })!;

        expect(store.getState().getObject<Person>(user[uuid])?.tags.length).toBe(1);
        expect(store.getState().getObject<Person>(user[uuid])?.tags).toContain("tag1");

        store.undo();
        expect(store.getState().getObject<Person>(user[uuid])?.tags.length).toBe(0);

        store.redo();
        expect(store.getState().getObject<Person>(user[uuid])?.tags.length).toBe(1);
        expect(store.getState().getObject<Person>(user[uuid])?.tags).toContain("tag1");
    });
});