import { createStore } from "../StoreFactory";
import { TypeMeta } from "../meta/InternalSchema";

describe("Store API: Historical State Access", () => {
    let store: ReturnType<typeof createStore>;

    beforeEach(() => {
        const metaInfo = new Map<string, TypeMeta>([
            ["User", {
                qName: "User",
                properties: new Map([
                    ["name", { qName: "name", name: "name", type: "string" }],
                    ["age", { qName: "age", name: "age", type: "number" }]
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

       test("Accessing an object from old state should throw an error", () => {
            let user = store.createObject<User>("User");
    
            store.updateObject((u) => {
                u.name = "Alice";
            }, user);  
    
            // userAlice is from an old state (state 0)
            expect(() => {
                store.updateObject((u) => {
                    u.name = "Bob";  // not allowed to access userAlice here!
                }, user);
            }).toThrow();
        });
});