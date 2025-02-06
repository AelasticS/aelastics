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

// Create a new User object
const user:any = store.createObject("User");
user.name = "Alice";

console.log(user.uuid); // Should log a unique UUID
console.log(user.name); // Should log "Alice"
console.log(user.friends); // Should log an empty observable Set
