import { createStore } from "../StoreFactory";
import { TypeMeta } from "../handlers/MetaDefinitions";

describe("Store API: Undo, Redo, and Historical State Access", () => {
    let store: ReturnType<typeof createStore>;

    beforeEach(() => {
        const metaInfo = new Map<string, TypeMeta>([
            ["User", {
                name: "User",
                properties: new Map([
                    ["name", { name: "name", type: "string" }],
                    ["age", { name: "age", type: "number" }]
                ])
            }]
        ]);
        store = createStore(metaInfo);
    });

    interface User {
        uuid: string;
        name: string;
        age: number;
    }

    test("Undo should revert to the previous state", () => {
        const user = store.updateState(() => {
            const obj = store.createObject<User>("User");
            obj.name = "Alice";
            return obj;
        }
        );
        store.updateObject((u) => {
            u.name = "Bob";
        }, user);

        expect(store.getObject<User>(user.uuid)?.name).toBe("Bob");

        store.undo();
        expect(store.getObject<User>(user.uuid)?.name).toBe("Alice");
    });

    test("Redo should reapply the last undone change", () => {
        const user = store.createObject<User>("User");
        user.name = "Alice";

        store.updateObject((u) => {
            u.name = "Bob";
        }, user);

        store.undo();
        expect(store.getObject<User>(user.uuid)?.name).toBe("Alice");

        store.redo();
        expect(store.getObject<User>(user.uuid)?.name).toBe("Bob");
    });

    test("New changes after undo should clear redo history", () => {
        const user = store.createObject<User>("User");
        user.name = "Alice";

        store.updateObject((u) => {
            u.name = "Bob";
        }, user);

        store.undo();
        expect(store.getObject<User>(user.uuid)?.name).toBe("Alice");

        store.updateObject((u) => {
            u.name = "Charlie";
        }, user);

        expect(store.getObject<User>(user.uuid)?.name).toBe("Charlie");

        expect(store.redo()).toBe(false); // Redo history should be cleared
    });

    test("fromState() should retrieve object from a previous state", () => {

        let user = store.createObject<User>("User");

        user = store.updateObject((u) => {
            u.name = "Alice";
        }, user);

        user = store.updateObject((u) => {
            u.name = "Bob";
        }, user);

        const oldUser = store.fromState<User>(1, user.uuid);
        expect(oldUser?.name).toBe("Alice");

        const newUser = store.getObject<User>(user.uuid);
        expect(newUser?.name).toBe("Bob");
    });

    test("isInProduceMode() should detect when produce() is active", () => {
        const user = store.createObject<User>("User");
        let produceStatusDuringExecution = false;

        store.updateObject((u) => {
            produceStatusDuringExecution = store.isInUpdateMode();
            u.name = "Updated Name";
        }, user);

        expect(produceStatusDuringExecution).toBe(true);
        expect(store.isInUpdateMode()).toBe(false);
    });

    test("Undo at initial state should return false", () => {
        expect(store.undo()).toBe(false);
    });

    test("Redo at latest state should return false", () => {

        store.updateState(() => {
            const user = store.createObject<User>("User");
            user.name = "Alice";
            return user;
        });

        expect(store.redo()).toBe(false); // Already at latest state
    });
});
