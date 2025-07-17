import { TypeSchema } from "../meta/InternalSchema"

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
            {
              qName: "friends",
              name: "friends",
              type: "array",
              itemType: "object",
              domainType: "User",
              inverseProp: "friends",
              inverseType: "array",
            },
          ],
        ]),
      },
    ],
    [
      "Post",
      {
        qName: "Post",
        properties: new Map([
          ["id", { qName: "id", name: "id", type: "string" }],
          ["title", { qName: "title", name: "title", type: "string" }],
          ["author", { qName: "author", name: "author", type: "object", domainType: "User", inverseProp: "posts" }],
        ]),
      },
    ],
  ]),
}
