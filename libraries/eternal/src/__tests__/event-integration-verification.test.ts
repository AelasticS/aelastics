import { RegistryService } from "../registry/RegistryService";
import { RegistryMetadata } from "../registry/NamespaceMetadata";
import { createStore } from "../store/createStore";
import { SubscriptionManager } from "../events/SubscriptionManager";
import { IStore } from "../interfaces/IStore";
import { IEvents } from "../interfaces/IEvents";
import { companyNamespace } from "./example-namespaces/company-namespace";

describe("Event Integration Verification", () => {
    let registry: RegistryService;
    let store: IStore;
    let events: IEvents;

    beforeEach(() => {
        const registryMetadata: RegistryMetadata = {
            namespaces: new Map(),
            name: "test-registry",
            version: "1.0.0"
        };
        registry = new RegistryService(registryMetadata);
        registry.importNamespace(companyNamespace);
        store = createStore(registry);
        events = store.events;
    });

    test("should verify if events are triggered during store.objects.create", () => {
        const createListener = jest.fn().mockReturnValue({ success: true });
        
        const unsubscribe = events.subscribe(
            createListener, "before", "create", "/company/Company"
        );

        // Perform a real create operation
        const company = store.objects.create("/company/Company", {
            id: "comp-001",
            name: "Tech Corp"
        });

        // Check if the listener was called
        console.log("Create listener call count:", createListener.mock.calls.length);
        console.log("Created company:", company);

        // This test will reveal whether events are integrated with real operations
        expect(createListener).toHaveBeenCalledTimes(1);

        unsubscribe();
    });

    test("should verify if events are triggered during store.objects.update", () => {
        const updateListener = jest.fn().mockReturnValue({ success: true });
        
        const unsubscribe = events.subscribe(
            updateListener, "before", "update", "/company/Company"
        );

        // Create an object first
        let company = store.objects.create("/company/Company", {
            id: "comp-001",
            name: "Tech Corp"
        });

        // Clear any potential create events
        updateListener.mockClear();

        // Perform a real update operation
        company = store.objects.update((comp: any) => {
            comp.name = "Updated Corp";
        }, company);

        // Check if the listener was called
        console.log("Update listener call count:", updateListener.mock.calls.length);
        console.log("Updated company name:", company.name);

        // This test will reveal whether events are integrated with real operations
        expect(updateListener).toHaveBeenCalledTimes(1);

        unsubscribe();
    });

    test("should verify manual event emission works correctly", () => {
        // Create separate SubscriptionManager for manual testing
        const manualSubscriptionManager = new SubscriptionManager(store.getEternalStore());
        const manualListener = jest.fn().mockReturnValue({ success: true });
        
        const unsubscribe = manualSubscriptionManager.subscribe(
            manualListener, "before", "create", "/company/Company"
        );

        // Manually emit an event
        const result = manualSubscriptionManager.emit({
            timing: "before",
            operation: "create",
            objectType: "/company/Company",
            timestamp: Date.now()
        });

        // Check if manual emission works
        console.log("Manual listener call count:", manualListener.mock.calls.length);
        console.log("Manual emission result:", result);

        // Manual emission should definitely work
        expect(manualListener).toHaveBeenCalledTimes(1);
        expect(result.success).toBe(true);

        unsubscribe();
    });
});