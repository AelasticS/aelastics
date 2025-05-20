import { createStore } from "../store/createStore";
import { TypeMeta } from "../meta/InternalSchema";
import { StoreObject, uuid } from "../store/InternalTypes";

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

    interface User extends StoreObject{
        uuid: string;
        name: string;
        age: number;
    }

    test("fromState() should retrieve object from a previous state", () => {
        let user = store.objectManager.create<User>("User");

        user = store.objectManager.update((u) => {
            u.name = "Alice";
        }, user);

        user = store.objectManager.update((u) => {
            u.name = "Bob";
        }, user);

        const oldUser = store.fromState<User>(1, user[uuid]);
        expect(oldUser?.name).toBe("Alice");

        const newUser = store.objectManager.findByUUID<User>(user[uuid]);
        expect(newUser?.name).toBe("Bob");
    });

       test("Accessing an object from old state should throw an error", () => {
            let user = store.objectManager.create<User>("User");
    
            store.objectManager.update((u) => {
                u.name = "Alice";
            }, user);  
    
            // userAlice is from an old state (state 0)
            expect(() => {
                store.objectManager.update((u) => {
                    u.name = "Bob";  // not allowed to access userAlice here!
                }, user);
            }).toThrow();
        });
});