import { TypeSchema } from "../handlers/MetaDefinitions";

export const UserSchema: TypeSchema = {
    qName: "UserSchema",
    types: new Map([
        [
            "User",
            {
                qName: "User",
                properties: new Map([
                    ["id", { qName: "id", name: "id", type: "string" }],
                    ["name", { qName: "name", name: "name", type: "string" }],
                    ["age", { qName: "age", name: "age", type: "number" }],
                    [
                        "friends",
                        { qName: "friends", name: "friends", type: "array", inverseType: "User", inverseProp: "friends" }
                    ]
                ])
            }
        ],
        [
            "Post",
            {
                qName: "Post",
                properties: new Map([
                    ["id", { qName: "id", name: "id", type: "string" }],
                    ["title", { qName: "title", name: "title", type: "string" }],
                    [
                        "author",
                        { qName: "author", name: "author", type: "object", inverseType: "User", inverseProp: "posts" }
                    ]
                ])
            }
        ]
    ])
};
