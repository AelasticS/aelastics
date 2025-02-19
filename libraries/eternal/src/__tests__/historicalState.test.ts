import { createStore } from "../StoreFactory";
import { TypeMeta } from "../handlers/MetaDefinitions";

describe("Store API: Historical State Access", () => {
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

    test("fromState() should retrieve object from a previous state", () => {
        const user = store.createObject<User>("User");

        store.updateObject((u) => {
            u.name = "Alice";
        }, user);

        store.updateObject((u) => {
            u.name = "Bob";
        }, user);

        const oldUser = store.fromState<User>(0, user.uuid);
        expect(oldUser?.name).toBe("Alice");

        const newUser = store.getObject<User>(user.uuid);
        expect(newUser?.name).toBe("Bob");
    });
});