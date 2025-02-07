import { createStore } from "../StoreFactory";
import { TypeMeta } from "../handlers/MetaDefinitions";

describe("Store API: Produce Mode Detection", () => {
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

    test("isInProduceMode() should detect when produce() is active", () => {
        const user = store.createObject<User>("User");
        let produceStatusDuringExecution = false;

        store.produce((u) => {
            produceStatusDuringExecution = store.isInProduceMode();
            u.name = "Updated Name";
        }, user);

        expect(produceStatusDuringExecution).toBe(true);
        expect(store.isInProduceMode()).toBe(false);
    });
});