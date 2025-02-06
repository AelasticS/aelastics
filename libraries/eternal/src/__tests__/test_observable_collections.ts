import { Store } from "../Store";

const store = new Store(new Map([
    ["User", {
        name: "User",
        properties: new Map([
            ["id", { name: "id", type: "string" }],
            ["name", { name: "name", type: "string" }],
            ["friends", { name: "friends", type: "set", inverseType: "User", inverseProp: "friends" }]
        ])
    }]
]));

// Create users
const user1:any = store.createObject("User");
const user2:any = store.createObject("User");

store.produce((user1:any) => {
    user1.friends.add(user2);
}, user1);

console.log(user1.friends.size); // Should be 1
console.log([...user1.friends]); // Should contain user2
