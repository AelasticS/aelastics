import { createStore } from "../StoreFactory";
import { TypeMeta } from "../handlers/MetaDefinitions";

describe("Immutable Collections (Arrays, Sets, Maps)", () => {
    let store: ReturnType<typeof createStore>;

    beforeEach(() => {
        const metaInfo = new Map<string, TypeMeta>([
            ["Person", {
                name: "Person",
                properties: new Map([
                    ["name", { name: "name", type: "string" }],
                    ["friends", { name: "friends", type: "array", inverseType: "Person", inverseProp: "friends" }],
                    ["tags", { name: "tags", type: "set" }],
                    ["properties", { name: "properties", type: "map" }]
                ])
            }]
        ]);
        store = createStore(metaInfo);
    });

    interface Person {
        uuid: string;
        name: string;
        friends: Person[];
        tags: Set<string>;
        properties: Map<string, string>;
    }

    test("Arrays: Should initialize as empty observable arrays", () => {
        const person = store.createObject<Person>("Person");
        expect(person.friends).toBeInstanceOf(Array);
        expect(person.friends.length).toBe(0);
    });

    test("Sets: Should initialize as empty observable sets", () => {
        const person = store.createObject<Person>("Person");
        expect(person.tags).toBeInstanceOf(Set);
        expect(person.tags.size).toBe(0);
    });

    test("Maps: Should initialize as empty observable maps", () => {
        const person = store.createObject<Person>("Person");
        expect(person.properties).toBeInstanceOf(Map);
        expect(person.properties.size).toBe(0);
    });

    test("Prevent direct assignment to collections", () => {
        const person = store.createObject<Person>("Person");

        expect(() => { (person.friends as any) = []; }).toThrow();
        expect(() => { (person.tags as any) = new Set(); }).toThrow();
        expect(() => { (person.properties as any) = new Map(); }).toThrow();
    });

    test("Array: Adding an item should be tracked and cause versioning", () => {
        const person = store.createObject<Person>("Person");
        const friend = store.createObject<Person>("Person");

        store.updateObject((p) => {
            p.friends.push(friend);
        }, person);

        expect(store.getObject<Person>(person.uuid)?.friends.length).toBe(1);
        expect(store.getObject<Person>(person.uuid)?.friends[0]).toBe(friend);
    });

    test("Set: Adding an item should be tracked and cause versioning", () => {
        const person = store.createObject<Person>("Person");

        store.updateObject((p) => {
            p.tags.add("developer");
        }, person);

        expect(store.getObject<Person>(person.uuid)?.tags.has("developer")).toBe(true);
    });

    test("Map: Adding an item should be tracked and cause versioning", () => {
        const person = store.createObject<Person>("Person");

        store.updateObject((p) => {
            p.properties.set("role", "admin");
        }, person);

        expect(store.getObject<Person>(person.uuid)?.properties.get("role")).toBe("admin");
    });

    test("Undo should revert collection modifications", () => {
        const person = store.createObject<Person>("Person");
        const friend = store.createObject<Person>("Person");

        store.updateObject((p) => {
            p.friends.push(friend);
            p.tags.add("developer");
            p.properties.set("role", "admin");
        }, person);

        store.undo();

        expect(store.getObject<Person>(person.uuid)?.friends.length).toBe(0);
        expect(store.getObject<Person>(person.uuid)?.tags.size).toBe(0);
        expect(store.getObject<Person>(person.uuid)?.properties.size).toBe(0);
    });

    test("Redo should reapply collection modifications", () => {
        const person = store.createObject<Person>("Person");
        const friend = store.createObject<Person>("Person");

        store.updateObject((p) => {
            p.friends.push(friend);
            p.tags.add("developer");
            p.properties.set("role", "admin");
        }, person);

        store.undo();
        store.redo();

        expect(store.getObject<Person>(person.uuid)?.friends.length).toBe(1);
        expect(store.getObject<Person>(person.uuid)?.tags.has("developer")).toBe(true);
        expect(store.getObject<Person>(person.uuid)?.properties.get("role")).toBe("admin");
    });

    test("Bidirectional updates should work in arrays", () => {
        const personA = store.createObject<Person>("Person");
        const personB = store.createObject<Person>("Person");

        store.updateObject((p) => {
            p.friends.push(personB);
        }, personA);

        expect(store.getObject<Person>(personA.uuid)?.friends.includes(personB)).toBe(true);
        expect(store.getObject<Person>(personB.uuid)?.friends.includes(personA)).toBe(true);
    });
});
