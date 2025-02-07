import { EternalStore } from "../EternalStore";

const store = new EternalStore(new Map([
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

user1.name = "Alice";
user2.name = "Bob";

// Establish bidirectional friendship
store.produce((user:any) => {
    user.friends.add(user2);
}, user1);

console.log(user1.friends.has(user2)); // Should be true
console.log(user2.friends.has(user1)); // Should be true
