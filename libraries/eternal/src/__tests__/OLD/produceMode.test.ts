import { createStore } from "../../store/createStore";
import { RegistryService, NamespaceImportError } from "../../registry/RegistryService";
import { Namespace, RegistryMetadata } from "../../registry/NamespaceMetadata";
import { ObjectTypeMeta, PropertyMeta } from "../../registry/TypeDefinitions";

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

describe("Store API: Produce Mode Detection", () => {
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
        
        let error: NamespaceImportError | undefined;
        try {
            registry.importNamespace(namespace);
        } catch (err) {
            error = err as NamespaceImportError;
        }
        expect(error).toBeUndefined();
        store = createStore(registry);
    });

    interface User {
        uuid: string;
        name: string;
        age: number;
    }

    test("isInProduceMode() should detect when produce() is active", () => {
        const user = store.objects.create<User>("/test/User");
        let produceStatusDuringExecution = false;

        store.objects.update((u) => {
            produceStatusDuringExecution = store.history.isInUpdateMode();
            u.name = "Updated Name";
        }, user);

        expect(produceStatusDuringExecution).toBe(true);
        expect(store.history.isInUpdateMode()).toBe(false);
    });
});