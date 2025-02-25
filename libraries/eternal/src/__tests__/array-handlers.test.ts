import { EternalStore } from "../EternalStore";
import { EternalObject } from "../handlers/InternalTypes";
import { createStore, Store } from "../StoreFactory";

interface Person extends EternalObject {
    name: string;
    age: number;
    tags: string[]
}

let store: Store;
let eternalStore:EternalStore;

beforeEach(() => {
    store = createStore(new Map([
        ["User", {
            name: "User",
            properties: new Map([
                ["name", { name: "name", type: "string" }],
                ["age", { name: "age", type: "number" }],
                ["tags", { name: "tags", type: "array" }]])
        }]
    ]));
    eternalStore = store.getEternalStore();
});

test("Undo/Redo on array push operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: Person) => {
        obj.name = "Alice";
        return obj;
    }, user);

    // apply operation
    store.updateState(() => {
        user.tags.push("tag1");
    });

    // check if operation was successful
    expect(store.getObject<Person>(user.uuid)?.tags.length).toBe(1);
    expect(store.getObject<Person>(user.uuid)?.tags).toContain("tag1");

    // undo operation
    store.undo();
    // check if undo was successful
    expect(store.getObject<Person>(user.uuid)?.tags.length).toBe(0);

    // redo operation
    store.redo();
    // check if redo was successful
    expect(store.getObject<Person>(user.uuid)?.tags.length).toBe(1);
    expect(store.getObject<Person>(user.uuid)?.tags).toContain("tag1");
});

test("Undo/Redo on array element set by index operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: Person) => {
        obj.name = "Alice";
        user.tags.push("tag1");
        return obj;
    }, user);

    // apply operation
    store.updateState(() => {
        user.tags[0] = "tag1 updated";
    });

    // check if operation was successful
    expect(store.getObject<Person>(user.uuid)?.tags.length).toBe(1);
    expect(store.getObject<Person>(user.uuid)?.tags[0]).toBe("tag1 updated");

    // undo operation
    store.undo();
    // check if undo was successful
    expect(store.getObject<Person>(user.uuid)?.tags.length).toBe(1);
    expect(store.getObject<Person>(user.uuid)?.tags[0]).toBe("tag1");

    // redo operation
    store.redo();
    // check if redo was successful
    expect(store.getObject<Person>(user.uuid)?.tags.length).toBe(1);
    expect(store.getObject<Person>(user.uuid)?.tags[0]).toBe("tag1 updated");
});

test("Undo/Redo on array pop operation", () => {
    // create object

    let user: Person = store.createObject("User");
    // initialize object


    user = store.updateObject((obj: Person) => {
        obj.name = "Alice";
        obj.tags.push("tag1");
        return obj;
    }, user);

    // apply operation
    store.updateState(() => {
        user.tags.pop();
    });

    // check if operation was successful
    expect(store.getObject<Person>(user.uuid)?.tags.length).toBe(0);

    // undo operation
    store.undo();
    // check if undo was successful
    expect(store.getObject<Person>(user.uuid)?.tags.length).toBe(1);
    expect(store.getObject<Person>(user.uuid)?.tags).toContain("tag1");

    // redo operation
    store.redo();
    // check if redo was successful
    expect(store.getObject<Person>(user.uuid)?.tags.length).toBe(0);
});

test("Undo/Redo on array shift operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: Person) => {
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2");
        return obj;
    }, user);

    // apply operation
    store.updateState(() => {
        user.tags.shift();
    });

    // check if operation was successful
    expect(store.getObject<Person>(user.uuid)?.tags.length).toBe(1);
    expect(store.getObject<Person>(user.uuid)?.tags).toContain("tag2");

    // undo operation
    store.undo();
    // check if undo was successful
    expect(store.getObject<Person>(user.uuid)?.tags.length).toBe(2);
    expect(store.getObject<Person>(user.uuid)?.tags).toContain("tag1");
    expect(store.getObject<Person>(user.uuid)?.tags).toContain("tag2");

    // redo operation
    store.redo();
    // check if redo was successful
    expect(store.getObject<Person>(user.uuid)?.tags.length).toBe(1);
    expect(store.getObject<Person>(user.uuid)?.tags).toContain("tag2");
});

test("Undo/Redo on array unshift operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: Person) => {
        obj.name = "Alice";
        return obj;
    }, user);

    // apply operation
    store.updateState(() => {
        user.tags.unshift("tag1");
    });

    // check if operation was successful
    expect(store.getObject<Person>(user.uuid)?.tags.length).toBe(1);
    expect(store.getObject<Person>(user.uuid)?.tags).toContain("tag1");

    // undo operation
    store.undo();
    // check if undo was successful
    expect(store.getObject<Person>(user.uuid)?.tags.length).toBe(0);

    // redo operation
    store.redo();
    // check if redo was successful
    expect(store.getObject<Person>(user.uuid)?.tags.length).toBe(1);
    expect(store.getObject<Person>(user.uuid)?.tags).toContain("tag1");
});

test("Undo/Redo on array splice operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: Person) => {
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2", "tag3");
        return obj;
    }, user);

    // apply operation
    store.updateState(() => {
        user.tags.splice(1, 1, "tag4");
    });

    // check if operation was successful
    expect(store.getObject<Person>(user.uuid)?.tags.length).toBe(3);
    expect(store.getObject<Person>(user.uuid)?.tags).toContain("tag1");
    expect(store.getObject<Person>(user.uuid)?.tags).toContain("tag4");
    expect(store.getObject<Person>(user.uuid)?.tags).toContain("tag3");

    // undo operation
    store.undo();
    // check if undo was successful
    expect(store.getObject<Person>(user.uuid)?.tags.length).toBe(3);
    expect(store.getObject<Person>(user.uuid)?.tags).toContain("tag1");
    expect(store.getObject<Person>(user.uuid)?.tags).toContain("tag2");
    expect(store.getObject<Person>(user.uuid)?.tags).toContain("tag3");

    // redo operation
    store.redo();
    // check if redo was successful
    expect(store.getObject<Person>(user.uuid)?.tags.length).toBe(3);
    expect(store.getObject<Person>(user.uuid)?.tags).toContain("tag1");
    expect(store.getObject<Person>(user.uuid)?.tags).toContain("tag4");
    expect(store.getObject<Person>(user.uuid)?.tags).toContain("tag3");
});

test("Undo/Redo on array reverse operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: Person) => {
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2", "tag3");
        return obj;
    }, user);

    // apply operation
    store.updateState(() => {
        user.tags.reverse();
    });

    // check if operation was successful
    expect(store.getObject<Person>(user.uuid)?.tags).toEqual(["tag3", "tag2", "tag1"]);

    // undo operation
    store.undo();
    // check if undo was successful
    expect(store.getObject<Person>(user.uuid)?.tags).toEqual(["tag1", "tag2", "tag3"]);

    // redo operation
    store.redo();
    // check if redo was successful
    expect(store.getObject<Person>(user.uuid)?.tags).toEqual(["tag3", "tag2", "tag1"]);
});

test("Undo/Redo on array sort operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: Person) => {
        obj.name = "Alice";
        obj.tags.push("tag3", "tag1", "tag2");
        return obj;
    }, user);

    // apply operation
    store.updateState(() => {
        user.tags.sort();
    });

    // check if operation was successful
    expect(store.getObject<Person>(user.uuid)?.tags).toEqual(["tag1", "tag2", "tag3"]);

    // undo operation
    store.undo();
    // check if undo was successful
    expect(store.getObject<Person>(user.uuid)?.tags).toEqual(["tag3", "tag1", "tag2"]);

    // redo operation
    store.redo();
    // check if redo was successful
    expect(store.getObject<Person>(user.uuid)?.tags).toEqual(["tag1", "tag2", "tag3"]);
});

test("Undo/Redo on array fill operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: Person) => {
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2", "tag3");
        return obj;
    }, user);

    // apply operation
    store.updateState(() => {
        user.tags.fill("tag4", 1, 2);
    });

    // check if operation was successful
    expect(store.getObject<Person>(user.uuid)?.tags).toEqual(["tag1", "tag4", "tag3"]);

    // undo operation
    store.undo();
    // check if undo was successful
    expect(store.getObject<Person>(user.uuid)?.tags).toEqual(["tag1", "tag2", "tag3"]);

    // redo operation
    store.redo();
    // check if redo was successful
    expect(store.getObject<Person>(user.uuid)?.tags).toEqual(["tag1", "tag4", "tag3"]);
});

test("Undo/Redo on array concat operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: Person) => {
        obj.name = "Alice";
        obj.tags.push("tag1");
        return obj;
    }, user);

    // apply operation
    store.updateState(() => {
        user.tags = user.tags.concat(["tag2", "tag3"]);
    });

    // check if operation was successful
    expect(store.getObject<Person>(user.uuid)?.tags).toEqual(["tag1", "tag2", "tag3"]);

    // undo operation
    store.undo();
    // check if undo was successful
    expect(store.getObject<Person>(user.uuid)?.tags).toEqual(["tag1"]);

    // redo operation
    store.redo();
    // check if redo was successful
    expect(store.getObject<Person>(user.uuid)?.tags).toEqual(["tag1", "tag2", "tag3"]);
});

test("Undo/Redo on array includes operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: Person) => {
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2", "tag3");
        return obj;
    }, user);

    // apply operation
    let includesTag2: boolean = false;
    store.updateState(() => {
        includesTag2 = user.tags.includes("tag2");
    });

    // check if operation was successful
    expect(includesTag2).toBe(true);

    // undo operation
    store.undo();
    // check if undo was successful
    includesTag2 = user.tags.includes("tag2");
    expect(includesTag2).toBe(true);

    // redo operation
    store.redo();
    // check if redo was successful
    includesTag2 = user.tags.includes("tag2");
    expect(includesTag2).toBe(true);
});

test("Undo/Redo on array indexOf operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: Person) => {
        obj.name = "Alice";
        obj.tags.push("tag1", " tag2", "tag3");
        return obj;
    }, user);

    // apply operation
    let indexOfTag2: number = 0;
    store.updateState(() => {
        indexOfTag2 = user.tags.indexOf("tag2");
    });

    // check if operation was successful
    expect(indexOfTag2).toBe(1);

    // undo operation
    store.undo();
    // check if undo was successful
    indexOfTag2 = user.tags.indexOf("tag2");
    expect(indexOfTag2).toBe(1);

    // redo operation
    store.redo();
    // check if redo was successful
    indexOfTag2 = user.tags.indexOf("tag2");
    expect(indexOfTag2).toBe(1);
});

test("Undo/Redo on array join operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: Person) => {
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2", "tag3");
        return obj;
    }, user);

    // apply operation
    let joinedTags: string = "";
    store.updateState(() => {
        joinedTags = user.tags.join(", ");
    });

    // check if operation was successful
    expect(joinedTags).toBe("tag1, tag2, tag3");

    // undo operation
    store.undo();
    // check if undo was successful
    joinedTags = user.tags.join(", ");
    expect(joinedTags).toBe("tag1, tag2, tag3");

    // redo operation
    store.redo();
    // check if redo was successful
    joinedTags = user.tags.join(", ");
    expect(joinedTags).toBe("tag1, tag2, tag3");
});

test("Undo/Redo on array lastIndexOf operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: Person) => {
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2", "tag3", "tag2");
        return obj;
    }, user);

    // apply operation
    let lastIndexOfTag2: number = 0;
    store.updateState(() => {
        lastIndexOfTag2 = user.tags.lastIndexOf("tag2");
    });

    // check if operation was successful
    expect(lastIndexOfTag2).toBe(3);

    // undo operation
    store.undo();
    // check if undo was successful
    lastIndexOfTag2 = user.tags.lastIndexOf("tag2");
    expect(lastIndexOfTag2).toBe(3);

    // redo operation
    store.redo();
    // check if redo was successful
    lastIndexOfTag2 = user.tags.lastIndexOf("tag2");
    expect(lastIndexOfTag2).toBe(3);
});

test("Undo/Redo on array slice operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: Person) => {
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2", "tag3");
        return obj;
    }, user);

    // apply operation
    let slicedTags: string[] = [];
    store.updateState(() => {
        slicedTags = user.tags.slice(1, 3);
    });

    // check if operation was successful
    expect(slicedTags).toEqual(["tag2", "tag3"]);

    // undo operation
    store.undo();
    // check if undo was successful
    slicedTags = user.tags.slice(1, 3);
    expect(slicedTags).toEqual(["tag2", "tag3"]);

    // redo operation
    store.redo();
    // check if redo was successful
    slicedTags = user.tags.slice(1, 3);
    expect(slicedTags).toEqual(["tag2", "tag3"]);
});

test("Undo/Redo on array length operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: Person) => {
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2", "tag3");
        return obj;
    }, user);

    // apply operation
    store.updateState(() => {
        user.tags.length = 2;
    });

    // check if operation was successful
    expect(store.getObject<Person>(user.uuid)?.tags.length).toBe(2);

    // undo operation
    store.undo();
    // check if undo was successful
    expect(store.getObject<Person>(user.uuid)?.tags.length).toBe(3);

    // redo operation
    store.redo();
    // check if redo was successful
    expect(store.getObject<Person>(user.uuid)?.tags.length).toBe(2);
});

test("Undo/Redo on array size operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: Person) => {
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2", "tag3");
        return obj;
    }, user);

    // apply operation
    store.updateState(() => {
        user.tags.length = 2;
    });

    // check if operation was successful
    expect(store.getObject<Person>(user.uuid)?.tags.length).toBe(2);

    // undo operation
    store.undo();
    // check if undo was successful
    expect(store.getObject<Person>(user.uuid)?.tags.length).toBe(3);

    // redo operation
    store.redo();
    // check if redo was successful
    expect(store.getObject<Person>(user.uuid)?.tags.length).toBe(2);
});

test("Undo/Redo on array find operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: Person) => {
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2", "tag3");
        return obj;
    }, user);

    // apply operation
    let foundTag: string | undefined;
    store.updateState(() => {
        foundTag = user.tags.find(tag => tag === "tag2");
    });

    // check if operation was successful
    expect(foundTag).toBe("tag2");

    // undo operation
    store.undo();
    // check if undo was successful
    foundTag = user.tags.find(tag => tag === "tag2");
    expect(foundTag).toBe("tag2");

    // redo operation
    store.redo();
    // check if redo was successful
    foundTag = user.tags.find(tag => tag === "tag2");
    expect(foundTag).toBe("tag2");
});

test("Undo/Redo on array findIndex operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: EternalObject) => {
        obj = store.createObject<Person>("User");
        obj.name = "Alice";
        obj.tags = ["tag1", "tag2"];
        return obj;
    }, user);

    // apply operation
    let index: number = 0;
    store.updateState(() => {
        index = user.tags.findIndex(tag => tag === "tag2");
    });

    // check if operation was successful
    expect(index).toBe(1);

    // undo operation
    store.undo();
    // check if undo was successful
    expect(index).toBeUndefined();

    // redo operation
    store.redo();
    // check if redo was successful
    expect(index).toBe(1);
});


test("Undo/Redo on array map operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: EternalObject) => {
        obj = store.createObject<Person>("User");
        obj.name = "Alice";
        obj.tags = ["tag1", "tag2"];
        return obj;
    }, user);

    // apply operation
    let mappedTags: string[] = [];
    store.updateState(() => {
        mappedTags = user.tags.map(tag => tag.toUpperCase());
    });

    // check if operation was successful
    expect(mappedTags.length).toBe(2);
    expect(mappedTags).toContain("TAG1");
    expect(mappedTags).toContain("TAG2");

    // undo operation
    store.undo();
    // check if undo was successful
    expect(mappedTags).toBeUndefined();

    // redo operation
    store.redo();
    // check if redo was successful
    expect(mappedTags.length).toBe(2);
    expect(mappedTags).toContain("TAG1");
    expect(mappedTags).toContain("TAG2");
});

test("Undo/Redo on array filter operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: EternalObject) => {
        obj = store.createObject<Person>("User");
        obj.name = "Alice";
        obj.tags = ["tag1", "tag2", "tag3"];
        return obj;
    }, user);

    // apply operation
    let filteredTags: string[] = [];
    store.updateState(() => {
        filteredTags = user.tags.filter(tag => tag !== "tag2");
    });

    // check if operation was successful
    expect(filteredTags.length).toBe(2);
    expect(filteredTags).toContain("tag1");
    expect(filteredTags).toContain("tag3");

    // undo operation
    store.undo();
    // check if undo was successful
    expect(filteredTags).toBeUndefined();

    // redo operation
    store.redo();
    // check if redo was successful
    expect(filteredTags.length).toBe(2);
    expect(filteredTags).toContain("tag1");
    expect(filteredTags).toContain("tag3");
});

test("Undo/Redo on array reduce operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: EternalObject) => {
        obj = store.createObject<Person>("User");
        obj.name = "Alice";
        obj.tags = ["tag1", "tag2", "tag3"];
        return obj;
    }, user);

    // apply operation
    let reducedTags: string = "";
    store.updateState(() => {
        reducedTags = user.tags.reduce((acc, tag) => acc + tag, "");
    });

    // check if operation was successful
    expect(reducedTags).toBe("tag1tag2tag3");

    // undo operation
    store.undo();
    // check if undo was successful
    expect(reducedTags).toBeUndefined();

    // redo operation
    store.redo();
    // check if redo was successful
    expect(reducedTags).toBe("tag1tag2tag3");
});

test("Undo/Redo on array reduceRight operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: EternalObject) => {
        obj = store.createObject<Person>("User");
        obj.name = "Alice";
        obj.tags = ["tag1", "tag2", "tag3"];
        return obj;
    }, user);

    // apply operation
    let reducedTags: string = "";
    store.updateState(() => {
        reducedTags = user.tags.reduceRight((acc, tag) => acc + tag, "");
    });

    // check if operation was successful
    expect(reducedTags).toBe("tag3tag2tag1");

    // undo operation
    store.undo();
    // check if undo was successful
    expect(reducedTags).toBeUndefined();

    // redo operation
    store.redo();
    // check if redo was successful
    expect(reducedTags).toBe("tag3tag2tag1");
});

test("Undo/Redo on array every operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: EternalObject) => {
        obj = store.createObject<Person>("User");
        obj.name = "Alice";
        obj.tags = ["tag1", "tag2", "tag3"];
        return obj;
    }, user);

    // apply operation
    let everyResult: boolean = false;
    store.updateState(() => {
        everyResult = user.tags.every(tag => tag.startsWith("tag"));
    });

    // check if operation was successful
    expect(everyResult).toBe(true);

    // undo operation
    store.undo();
    // check if undo was successful
    expect(everyResult).toBeUndefined();

    // redo operation
    store.redo();
    // check if redo was successful
    expect(everyResult).toBe(true);
});

test("Undo/Redo on array some operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: EternalObject) => {
        obj = store.createObject<Person>("User");
        obj.name = "Alice";
        obj.tags = ["tag1", "tag2", "tag3"];
        return obj;
    }, user);

    // apply operation
    let someResult: boolean = false;
    store.updateState(() => {
        someResult = user.tags.some(tag => tag === "tag2");
    });

    // check if operation was successful
    expect(someResult).toBe(true);

    // undo operation
    store.undo();
    // check if undo was successful
    expect(someResult).toBeUndefined();

    // redo operation
    store.redo();
    // check if redo was successful
    expect(someResult).toBe(true);
});

test("Undo/Redo on array forEach operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: EternalObject) => {
        obj = store.createObject<Person>("User");
        obj.name = "Alice";
        obj.tags = ["tag1", "tag2", "tag3"];
        return obj;
    }, user);

    // apply operation
    let forEachResult: string[] = [];
    store.updateState(() => {
        user.tags.forEach(tag => forEachResult.push(tag));
    });

    // check if operation was successful
    expect(forEachResult.length).toBe(3);
    expect(forEachResult).toContain("tag1");
    expect(forEachResult).toContain("tag2");
    expect(forEachResult).toContain("tag3");

    // undo operation
    store.undo();
    // check if undo was successful
    expect(forEachResult.length).toBe(0);

    // redo operation
    store.redo();
    // check if redo was successful
    expect(forEachResult.length).toBe(3);
    expect(forEachResult).toContain("tag1");
    expect(forEachResult).toContain("tag2");
    expect(forEachResult).toContain("tag3");
});

test("Undo/Redo on array flatMap operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: EternalObject) => {
        obj = store.createObject<Person>("User");
        obj.name = "Alice";
        obj.tags = ["tag1", "tag2"];
        return obj;
    }, user);

    // apply operation
    let flatMappedTags: string[] = [];
    store.updateState(() => {
        flatMappedTags = user.tags.flatMap(tag => [tag, tag.toUpperCase()]);
    });

    // check if operation was successful
    expect(flatMappedTags.length).toBe(4);
    expect(flatMappedTags).toContain("tag1");
    expect(flatMappedTags).toContain("TAG1");
    expect(flatMappedTags).toContain("tag2");
    expect(flatMappedTags).toContain("TAG2");

    // undo operation
    store.undo();
    // check if undo was successful
    expect(flatMappedTags).toBeUndefined();

    // redo operation
    store.redo();
    // check if redo was successful
    expect(flatMappedTags.length).toBe(4);
    expect(flatMappedTags).toContain("tag1");
    expect(flatMappedTags).toContain("TAG1");
    expect(flatMappedTags).toContain("tag2");
    expect(flatMappedTags).toContain("TAG2");
});

test("Undo/Redo on array flat operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: EternalObject) => {
        obj = store.createObject<Person>("User");
        obj.name = "Alice";
        obj.tags = [["tag1"], ["tag2", "tag3"]];
        return obj;
    }, user);

    // apply operation
    let flattenedTags: string[] = [];;
    store.updateState(() => {
        flattenedTags = user.tags.flat();
    });

    // check if operation was successful
    expect(flattenedTags.length).toBe(3);
    expect(flattenedTags).toContain("tag1");
    expect(flattenedTags).toContain("tag2");
    expect(flattenedTags).toContain("tag3");

    // undo operation
    store.undo();
    // check if undo was successful
    expect(flattenedTags).toBeUndefined();

    // redo operation
    store.redo();
    // check if redo was successful
    expect(flattenedTags.length).toBe(3);
    expect(flattenedTags).toContain("tag1");
    expect(flattenedTags).toContain("tag2");
    expect(flattenedTags).toContain("tag3");
});

test("Undo/Redo on array copyWithin operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: EternalObject) => {
        obj = store.createObject<Person>("User");
        obj.name = "Alice";
        obj.tags = ["tag1", "tag2", "tag3"];
        return obj;
    }, user);

    // apply operation
    store.updateState(() => {
        user.tags.copyWithin(1, 0, 2);
    });

    // check if operation was successful
    expect(store.getObject<Person>(user.uuid)?.tags).toEqual(["tag1", "tag1", "tag2"]);

    // undo operation
    store.undo();
    // check if undo was successful
    expect(store.getObject<Person>(user.uuid)?.tags).toEqual(["tag1", "tag2", "tag3"]);

    // redo operation
    store.redo();
    // check if redo was successful
    expect(store.getObject<Person>(user.uuid)?.tags).toEqual(["tag1", "tag1", "tag2"]);
});

test("Undo/Redo on array entries operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: EternalObject) => {
        obj = store.createObject<Person>("User");
        obj.name = "Alice";
        obj.tags = ["tag1", "tag2", "tag3"];
        return obj;
    }, user);

    // apply operation
    let entries: IterableIterator<[number, string]> = new Map().entries();
    store.updateState(() => {
        entries = user.tags.entries();
    });

    // check if operation was successful
    const entriesArray = Array.from(entries);
    expect(entriesArray.length).toBe(3);
    expect(entriesArray).toContainEqual([0, "tag1"]);
    expect(entriesArray).toContainEqual([1, "tag2"]);
    expect(entriesArray).toContainEqual([2, "tag3"]);

    // undo operation
    store.undo();
    // check if undo was successful
    expect(entriesArray.length).toBe(0);

    // redo operation
    store.redo();
    // check if redo was successful
    expect(entriesArray.length).toBe(3);
    expect(entriesArray).toContainEqual([0, "tag1"]);
    expect(entriesArray).toContainEqual([1, "tag2"]);
    expect(entriesArray).toContainEqual([2, "tag3"]);
});

test("Undo/Redo on array keys operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: EternalObject) => {
        obj = store.createObject<Person>("User");
        obj.name = "Alice";
        obj.tags = ["tag1", "tag2", "tag3"];
        return obj;
    }, user);

    // apply operation
    let keys: IterableIterator<number> = new Map().keys();
    store.updateState(() => {
        keys = user.tags.keys();
    });

    // check if operation was successful
    const keysArray = Array.from(keys);
    expect(keysArray.length).toBe(3);
    expect(keysArray).toContain(0);
    expect(keysArray).toContain(1);
    expect(keysArray).toContain(2);

    // undo operation
    store.undo();
    // check if undo was successful
    expect(keysArray.length).toBe(0);

    // redo operation
    store.redo();
    // check if redo was successful
    expect(keysArray.length).toBe(3);
    expect(keysArray).toContain(0);
    expect(keysArray).toContain(1);
    expect(keysArray).toContain(2);
});

test("Undo/Redo on array values operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: EternalObject) => {
        obj = store.createObject<Person>("User");
        obj.name = "Alice";
        obj.tags = ["tag1", "tag2", "tag3"];
        return obj;
    }, user);

    // apply operation
    let values: IterableIterator<string> = new Map().values();
    store.updateState(() => {
        values = user.tags.values();
    });

    // check if operation was successful
    const valuesArray = Array.from(values);
    expect(valuesArray.length).toBe(3);
    expect(valuesArray).toContain("tag1");
    expect(valuesArray).toContain("tag2");
    expect(valuesArray).toContain("tag3");

    // undo operation
    store.undo();
    // check if undo was successful
    expect(valuesArray.length).toBe(0);

    // redo operation
    store.redo();
    // check if redo was successful
    expect(valuesArray.length).toBe(3);
    expect(valuesArray).toContain("tag1");
    expect(valuesArray).toContain("tag2");
    expect(valuesArray).toContain("tag3");
});

test("Undo/Redo on array delete operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: Person) => {
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2", "tag3");
        return obj;
    }, user);

    // apply operation
    store.updateState(() => {
        delete user.tags[1];
    });

    // check if operation was successful
    expect(store.getObject<Person>(user.uuid)?.tags[1]).toBeUndefined();

    // undo operation
    store.undo();
    // check if undo was successful
    expect(store.getObject<Person>(user.uuid)?.tags[1]).toBe("tag2");

    // redo operation
    store.redo();
    // check if redo was successful
    expect(store.getObject<Person>(user.uuid)?.tags[1]).toBeUndefined();
});


