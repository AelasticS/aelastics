import { createStore } from "../store/createStore";
import { StoreObject, uuid } from "../store/InternalTypes";
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
            ["name", {
                name: "name",
                typeRef: "/std/string",
                optional: false
            } as PropertyMeta],
            ["age", {
                name: "age",
                typeRef: "/std/number",
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

describe("Store API: Historical State Access", () => {
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

    interface User extends StoreObject{
        uuid: string;
        name: string;
        age: number;
    }

    test("fromState() should retrieve object from a previous state", () => {
        let user = store.objects.create<User>("/test/User");

        user = store.objects.update((u) => {
            u.name = "Alice";
        }, user);

        user = store.objects.update((u) => {
            u.name = "Bob";
        }, user);

        const oldUser = store.history.fromState<User>(1, user[uuid]);
        expect(oldUser?.name).toBe("Alice");

        const newUser = store.objects.findByUUID<User>(user[uuid]);
        expect(newUser?.name).toBe("Bob");
    });

       test("Accessing an object from old state should throw an error", () => {
            let user = store.objects.create<User>("/test/User");
    
            store.objects.update((u) => {
                u.name = "Alice";
            }, user);  
    
            // userAlice is from an old state (state 0)
            expect(() => {
                store.objects.update((u) => {
                    u.name = "Bob";  // not allowed to access userAlice here!
                }, user);
            }).toThrow();
        });
});