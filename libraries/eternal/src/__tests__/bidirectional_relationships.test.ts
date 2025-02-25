import { EternalStore } from "../EternalStore";

describe("Bidirectional Relationships Tracking", () => {
    let store: EternalStore;

    beforeEach(() => {
        store = new EternalStore(new Map([
            ["User", {
                name: "User",
                properties: new Map([
                    ["id", { name: "id", type: "string" }],
                    ["name", { name: "name", type: "string" }],
                    ["friends", { name: "friends", type: "set", inverseType: "User", inverseProp: "friends" }]
                ])
            }]
        ]));
    });

    test("Adding bidirectional relationship should be tracked correctly", () => {
        let user1: any
        let user2: any

        user1 = store.produce(() => {
            user1 = store.createObject("User");
            user2 = store.createObject("User");
            user1.name = "Alice";
            user2.name = "Bob";
            user1.friends.add(user2);
        });

        expect(user1.friends.has(user2)).toBe(true);
        expect(user2.friends.has(user1)).toBe(true);

        const changeLog = store.getChangeLog();
        expect(changeLog).toContainEqual(
            expect.objectContaining({ uuid: user1.uuid, change: "update" })
        );
    });

    test("Removing bidirectional relationship should be tracked correctly", () => {
        const user1: any = store.createObject("User");
        const user2: any = store.createObject("User");

        store.produce((user: any) => {
            user.friends.add(user2);
        }, user1);

        store.produce(() => {
            user1.friends.delete(user2);
        }, user1);

        expect(user1.friends.has(user2)).toBe(false);
        expect(user2.friends.has(user1)).toBe(false);

        const changeLog = store.getChangeLog();
        expect(changeLog).toContainEqual(
            expect.objectContaining({ uuid: user1.uuid, change: "update" })
        );
    });

    test("Deleting an object should update inverse references", () => {
        const user1: any = store.createObject("User");
        const user2: any = store.createObject("User");

        store.produce(() => {
            user1.friends.add(user2);
        }, user1);

        store.produce(() => {
            store.getState().deleteObject(user1.uuid);
        }, user1);

        expect(user2.friends.has(user1)).toBe(false);

        const changeLog = store.getChangeLog();
        expect(changeLog).toContainEqual(
            expect.objectContaining({ uuid: user1.uuid, change: "delete" })
        );
    });
});
