import { createStore } from "../store/createStore";
import { TypeMeta } from "../meta/InternalSchema";

describe("Store API: Produce Mode Detection", () => {
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

    test("isInProduceMode() should detect when produce() is active", () => {
        const user = store.objectManager.create<User>("User");
        let produceStatusDuringExecution = false;

        store.objectManager.update((u) => {
            produceStatusDuringExecution = store.isInUpdateMode();
            u.name = "Updated Name";
        }, user);

        expect(produceStatusDuringExecution).toBe(true);
        expect(store.isInUpdateMode()).toBe(false);
    });
});