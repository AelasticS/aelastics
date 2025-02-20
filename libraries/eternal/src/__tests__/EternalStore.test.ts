import { EternalObject } from "../handlers/InternalTypes";
import { EternalStore } from "../EternalStore";

describe("Setters adn Getters Functionality", () => {
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

    test("Setters adn Getters ", () => {
        let UserClass = store.getClassByName("User") as any;
        store["inUpdateMode"] = true;
        store.makeNewState();
        let user1 = new UserClass();
        store.getState().addObject(user1, 'created');
        user1.name = "Alice";
        store.makeNewState();
        // let user2 = store.getState().createNewVersion(user1);
        console.log(user1.name);
        let user2 = store.getState().createNewVersion(user1);
        if(user1 === user2)
            console.log("Same");
        console.log(user1.name);
        let user3 = new (Object.getPrototypeOf(user1).constructor)()
        console.log(user1.name);
        if(user1 === user2)
            console.log("Same");
        user2.name = "Bob";
        if(user1 === user2)
            console.log("Same");
        user3.name = "Bob2";
        console.log(user1.name);
        store["inUpdateMode"] = false;
        console.log(user1.name);

    });
})
