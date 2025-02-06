import { TypeSchema } from "../handlers/MetaDefinitions";

const mySchema: TypeSchema = {
    name: "MyAppSchema",
    types: new Map([
        [
            "User",
            {
                name: "User",
                properties: new Map([
                    ["id", { name: "id", type: "string" }],
                    ["name", { name: "name", type: "string" }],
                    ["age", { name: "age", type: "number" }],
                    [
                        "friends",
                        { name: "friends", type: "array", inverseType: "User", inverseProp: "friends" }
                    ]
                ])
            }
        ],
        [
            "Post",
            {
                name: "Post",
                properties: new Map([
                    ["id", { name: "id", type: "string" }],
                    ["title", { name: "title", type: "string" }],
                    [
                        "author",
                        { name: "author", type: "object", inverseType: "User", inverseProp: "posts" }
                    ]
                ])
            }
        ]
    ])
};
