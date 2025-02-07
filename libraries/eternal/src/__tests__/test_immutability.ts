import { EternalStore } from "../EternalStore";

const store = new EternalStore(new Map([
    ["User", {
        name: "User",
        properties: new Map([
            ["id", { name: "id", type: "string" }],
            ["name", { name: "name", type: "string" }]
        ])
    }]
]));

// Create a user
const user:any = store.createObject("User");
user.name = "Alice";

try {
    user.name = "Eve"; // Should throw error because it's outside produce()
} catch (e) {
    if (e instanceof Error) {
        console.error(e.message); // "Cannot modify property 'name' outside of produce()"
    } else {
        console.error(e); // Handle unexpected error types
    }
}

// Modify inside produce()
store.produce(() => {
    user.name = "Eve";
}, user);

console.log(user.name); // Should be "Eve"
