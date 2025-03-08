import { createStore } from "../StoreFactory";
import { ObjectTypeMeta } from "../handlers/MetaDefinitions";

describe("Store API: Produce Mode Detection", () => {
    let store: ReturnType<typeof createStore>;

    beforeEach(() => {
        const metaInfo = new Map<string, ObjectTypeMeta>([
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
});