import { StoreObject, uuid } from "../store/InternalTypes";
import { createStore } from "../store/createStore";
import { RegistryService } from "../registry/RegistryService";
import { Namespace, RegistryMetadata } from "../registry/NamespaceMetadata";
import { ObjectTypeMeta, PropertyMeta } from "../registry/TypeDefinitions";

// Create user schema using the new registry system
function createUserNamespace(): Namespace {
    const userTypeMeta: ObjectTypeMeta = {
        qName: "/test/User",
        category: "complex",
        kind: "object",
        properties: new Map([
            ["id", {
                name: "id",
                typeRef: "/std/string",
                optional: false
            } as PropertyMeta],
            ["name", {
                name: "name",
                typeRef: "/std/string",
                optional: false
            } as PropertyMeta],
            ["age", {
                name: "age",
                typeRef: "/std/number",
                optional: false
            } as PropertyMeta],
            ["tags", {
                name: "tags",
                typeRef: "/std/array</std/string>",
                optional: false
            } as PropertyMeta]
        ])
    };

    return {
        qName: "/test",
        version: "1.0.0",
        types: new Map([
            ["User", userTypeMeta]
        ]),
        exports: ["User"],
        imports: new Map()
    };
}

describe("Undo/Redo Functionality", () => {
    let store: ReturnType<typeof createStore>;

    beforeEach(() => {
        const registryMetadata: RegistryMetadata = {
            namespaces: new Map(),
            name: "Test Registry",
            version: "1.0.0",
            created: new Date(),
            lastModified: new Date()
        };
        
        const registry = new RegistryService(registryMetadata);
        const namespace = createUserNamespace();
        
        registry.importNamespace(namespace);
        store = createStore(registry);
    });

    interface Person extends StoreObject { uuid: string; name: string; age: number; id: string; tags: string[] }


    test("Undo should revert to the previous state", () => {
        let userAlice: Person = store.objects.create<Person>("/test/User");

        userAlice = store.objects.update((user: StoreObject) => {
            const person = user as Person;
            person.name = "Alice";
        }, userAlice)!;

        store.objects.update((user: StoreObject) => {
            const person = user as Person;
            person.name = "Bob";
        }, userAlice);

        expect(store.getEternalStore().getState().getObject<Person>(userAlice[uuid])?.name).toBe("Bob");

        store.history.undo();

        expect(store.getEternalStore().getState().getObject<Person>(userAlice[uuid])?.name).toBe("Alice");
    });

    test("Redo should reapply a reverted state", () => {
        let user: Person = store.objects.create<Person>("/test/User");

        user = store.objects.update((user: StoreObject) => {
            const person = user as Person;
            person.name = "Alice";
        }, user)!;

        user = store.objects.update((user: StoreObject) => {
            const person = user as Person;
            person.name = "Bob";
        }, user)!;

        store.history.undo();
        expect(store.getEternalStore().getState().getObject<Person>(user[uuid])?.name).toBe("Alice");

        store.history.redo();
        expect(store.getEternalStore().getState().getObject<Person>(user[uuid])?.name).toBe("Bob");
    });

    test("New changes after undo should clear redo history", () => {
        let user: Person = store.objects.create<Person>("/test/User");

        user = store.objects.update((user: StoreObject) => {
            const person = user as Person;
            person.name = "Alice";
        }, user)!;

        user = store.objects.update((user: StoreObject) => {
            const person = user as Person;
            person.name = "Bob";
        }, user)!;

        store.history.undo();
        expect(store.getEternalStore().getState().getObject<Person>(user[uuid])?.name).toBe("Alice");

        user = store.objects.update((user: StoreObject) => {
            const person = user as Person;
            person.name = "Charlie";
        }, user)!;

        expect(store.getEternalStore().getState().getObject<Person>(user[uuid])?.name).toBe("Charlie");

        expect(store.history.redo()).toBe(false); // Redo history should be cleared
    });

    test("Undo at initial state should do nothing", () => {
        expect(store.history.undo()).toBe(false);
    });

    test("Redo at latest state should do nothing", () => {
        let user: Person = store.objects.create<Person>("/test/User");

        user = store.objects.update((user: StoreObject) => {
            const person = user as Person;
            person.name = "Alice";
        }, user)!;

        user = store.objects.update((user: StoreObject) => {
            const person = user as Person;
            person.name = "Bob";
        }, user)!;

        expect(store.history.redo()).toBe(false); // Already at latest state
    });
    test("Undo/Redo on array push operation", () => {
        let user: Person = store.objects.create<Person>("/test/User");
        user = store.objects.update((obj: StoreObject) => {
            obj.name = "Alice";
        }, user)!;

        store.objects.update(() => {
            user.tags.push("tag1");
        }, user)!;

        expect(store.getEternalStore().getState().getObject<Person>(user[uuid])?.tags.length).toBe(1);
        expect(store.getEternalStore().getState().getObject<Person>(user[uuid])?.tags).toContain("tag1");

        store.history.undo();
        expect(store.getEternalStore().getState().getObject<Person>(user[uuid])?.tags.length).toBe(0);

        store.history.redo();
        expect(store.getEternalStore().getState().getObject<Person>(user[uuid])?.tags.length).toBe(1);
        expect(store.getEternalStore().getState().getObject<Person>(user[uuid])?.tags).toContain("tag1");
    });
});