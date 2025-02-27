import { EternalStore } from "../EternalStore";
import { EternalObject } from "../handlers/InternalTypes";
import { createStore, Store } from "../StoreFactory";

interface Person extends EternalObject {
    name: string;
    age: number;
    tags: string[]
}

let store: Store;
let eternalStore: EternalStore;

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

test("array concat operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: Person) => {
        obj.name = "Alice";
        obj.tags.push("tag1");
        return obj;
    }, user);

    // apply operation
    // store.updateState(() => {
    //     user.tags = user.tags.concat(["tag2", "tag3"]);
    // });
     //expect(store.getObject<Person>(user.uuid)?.tags).toEqual(["tag1", "tag2", "tag3"]);

    const res= user.tags.concat(["tag2", "tag3"]);

    // check if operation was successful
    expect(res).toEqual(["tag1", "tag2", "tag3"]);
});

test("array includes operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: Person) => {
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2", "tag3");
        return obj;
    }, user);

    // apply operation
    let includesTag2: boolean = user.tags.includes("tag2");

    // check if operation was successful
    expect(includesTag2).toBe(true);
});

test("array indexOf operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: Person) => {
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2", "tag3");
        return obj;
    }, user);

    // apply operation
    let indexOfTag2: number = user.tags.indexOf("tag2");

    // check if operation was successful
    expect(indexOfTag2).toBe(1);
});

test("array join operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: Person) => {
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2", "tag3");
        return obj;
    }, user);

    // apply operation
    let joinedTags: string = user.tags.join(", ");

    // check if operation was successful
    expect(joinedTags).toBe("tag1, tag2, tag3");
});

test("array lastIndexOf operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: Person) => {
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2", "tag3", "tag2");
        return obj;
    }, user);

    // apply operation
    let lastIndexOfTag2: number = user.tags.lastIndexOf("tag2");

    // check if operation was successful
    expect(lastIndexOfTag2).toBe(3);
});

test("array slice operation", () => {
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
        slicedTags = user.tags.slice(1, 3);

    // check if operation was successful
    expect(slicedTags).toEqual(["tag2", "tag3"]);
});

test("array length operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: Person) => {
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2", "tag3");
        return obj;
    }, user);

    // check if operation was successful
    expect(store.getObject<Person>(user.uuid)?.tags.length).toBe(3);
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
        foundTag = user.tags.find(tag => tag === "tag2");

    // check if operation was successful
    expect(foundTag).toBe("tag2");

});

test("array findIndex operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: EternalObject) => {
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2");
        return obj;
    }, user);

    // apply operation
    let index: number = 0;
        index = user.tags.findIndex(tag => tag === "tag2");

    // check if operation was successful
    expect(index).toBe(1);

});


test("array map operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: EternalObject) => {
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2");
        return obj;
    }, user);

    // apply operation
    let mappedTags: string[] = [];
        mappedTags = user.tags.map(tag => tag.toUpperCase());

    // check if operation was successful
    expect(mappedTags.length).toBe(2);
    expect(mappedTags).toContain("TAG1");
    expect(mappedTags).toContain("TAG2");
});

test("array filter operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: EternalObject) => {
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2", "tag3");
        return obj;
    }, user);

    // apply operation
    let filteredTags: string[] = [];
        filteredTags = user.tags.filter(tag => tag !== "tag2");

    // check if operation was successful
    expect(filteredTags.length).toBe(2);
    expect(filteredTags).toContain("tag1");
    expect(filteredTags).toContain("tag3");

});

test("array reduce operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: EternalObject) => {
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2", "tag3");
        return obj;
    }, user);

    // apply operation
    let reducedTags: string = "";
    reducedTags = user.tags.reduce((acc, tag) => acc + tag, "");

    // check if operation was successful
    expect(reducedTags).toBe("tag1tag2tag3");

});

test("array reduceRight operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: EternalObject) => {
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2", "tag3");
        return obj;
    }, user);

    // apply operation
    let reducedTags: string = "";
    reducedTags = user.tags.reduceRight((acc, tag) => acc + tag, "");

    // check if operation was successful
    expect(reducedTags).toBe("tag3tag2tag1");
});

test("array every operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: EternalObject) => {
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2", "tag3");
        return obj;
    }, user);

    // apply operation
    let everyResult: boolean = false;

    everyResult = user.tags.every(tag => tag.startsWith("tag"));

    // check if operation was successful
    expect(everyResult).toBe(true);

});

test("array some operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: EternalObject) => {
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2", "tag3");
        return obj;
    }, user);

    // apply operation
    let someResult: boolean = false;

    someResult = user.tags.some(tag => tag === "tag2");

    // check if operation was successful
    expect(someResult).toBe(true);

});

test("array forEach operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: EternalObject) => {
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2", "tag3");
        return obj;
    }, user);

    // apply operation
    let forEachResult: string[] = []
    user.tags.forEach(tag => forEachResult.push(`${tag}tag`));

    // check if operation was successful
    expect(forEachResult.length).toBe(3);
    expect(forEachResult).toContain("tag1tag");
    expect(forEachResult).toContain("tag2tag");
    expect(forEachResult).toContain("tag3tag");

});

test("Undo/Redo on array flatMap operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: EternalObject) => {
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2");
        return obj;
    }, user);

    // apply operation
    let flatMappedTags: string[] = user.tags.flatMap(tag => [tag, tag.toUpperCase()]);

    // check if operation was successful
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
        obj.name = "Alice";
        obj.tags.push(["tag1"], ["tag2"], ["tag3"]);
        return obj;
    }, user);

    // apply operation
    let flattenedTags: string[] = user.tags.flat();

    // check if operation was successful
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
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2", "tag3");
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
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2", "tag3");
        return obj;
    }, user);

    // apply operation
    let entries: IterableIterator<[number, string]> = user.tags.entries();

    // check if operation was successful
    const entriesArray = Array.from(entries);
    expect(entriesArray.length).toBe(3);
    expect(entriesArray).toContainEqual([0, "tag1"]);
    expect(entriesArray).toContainEqual([1, "tag2"]);
    expect(entriesArray).toContainEqual([2, "tag3"]);
});

test("Array.keys operation", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: EternalObject) => {
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2", "tag3");
        return obj;
    }, user);

    // apply operation
    let keys: IterableIterator<number> = user.tags.keys();

    // check if operation was successful
    const keysArray = Array.from(keys);
    expect(keysArray.length).toBe(3);
    expect(keysArray).toContain(0);
    expect(keysArray).toContain(1);
    expect(keysArray).toContain(2);

});

test("values() method", () => {
    // create object
    let user: Person = store.createObject("User");
    // initialize object
    user = store.updateObject((obj: EternalObject) => {
        obj.name = "Alice";
        obj.tags.push("tag1", "tag2", "tag3");
        return obj;
    }, user);

    // apply operation
    let values: IterableIterator<string> = user.tags.values();

    // check if operation was successful
    const valuesArray = Array.from(values);
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


