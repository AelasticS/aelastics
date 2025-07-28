import { RegistryService } from "../registry/RegistryService";
import { RegistryMetadata } from "../registry/NamespaceMetadata";
import { createStore } from "../store/createStore";
import { IStore } from "../interfaces/IStore";
import { IEvents } from "../interfaces/IEvents";
import { companyNamespace } from "./example-namespaces/company-namespace";

describe("Store Subscription Tests", () => {
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

    test("should subscribe to store-wide changes", () => {
        const storeChangeListener = jest.fn();
        
        // Subscribe to store changes
        const unsubscribe = events.subscribeToStore(storeChangeListener);

        // Create an object - should trigger store change
        store.objects.create("/company/Company", {
            id: "comp-001",
            name: "Tech Corp"
        });

        // Verify store listener was called
        expect(storeChangeListener).toHaveBeenCalledTimes(1);

        unsubscribe();
    });

    test("should trigger store subscription on object updates", () => {
        const storeChangeListener = jest.fn();
        
        // Subscribe to store changes
        const unsubscribe = events.subscribeToStore(storeChangeListener);

        // Create an object
        const company = store.objects.create("/company/Company", {
            id: "comp-001",
            name: "Tech Corp"
        });

        // Clear previous calls
        storeChangeListener.mockClear();

        // Update the object - should trigger store change
        store.objects.update((comp: any) => {
            comp.name = "Updated Tech Corp";
        }, company);

        // Verify store listener was called for update
        expect(storeChangeListener).toHaveBeenCalledTimes(1);

        unsubscribe();
    });

    test("should handle multiple store subscribers", () => {
        const listener1 = jest.fn();
        const listener2 = jest.fn();
        const listener3 = jest.fn();
        
        // Subscribe multiple listeners to store changes
        const unsubscribe1 = events.subscribeToStore(listener1);
        const unsubscribe2 = events.subscribeToStore(listener2);
        const unsubscribe3 = events.subscribeToStore(listener3);

        // Create an object - should trigger all listeners
        store.objects.create("/company/Company", {
            id: "comp-001",
            name: "Tech Corp"
        });

        // Verify all listeners were called
        expect(listener1).toHaveBeenCalledTimes(1);
        expect(listener2).toHaveBeenCalledTimes(1);
        expect(listener3).toHaveBeenCalledTimes(1);

        unsubscribe1();
        unsubscribe2();
        unsubscribe3();
    });

    test("should properly unsubscribe store listeners", () => {
        const storeChangeListener = jest.fn();
        
        // Subscribe to store changes
        const unsubscribe = events.subscribeToStore(storeChangeListener);

        // Create an object - should trigger listener
        store.objects.create("/company/Company", {
            id: "comp-001",
            name: "Tech Corp"
        });

        expect(storeChangeListener).toHaveBeenCalledTimes(1);

        // Unsubscribe
        unsubscribe();

        // Create another object - should not trigger listener
        store.objects.create("/company/Employee", {
            id: "emp-001",
            name: "John Doe",
            email: "john@example.com"
        });

        // Verify listener was not called after unsubscribe
        expect(storeChangeListener).toHaveBeenCalledTimes(1);
    });

    test("should trigger store subscription for different object types", () => {
        const storeChangeListener = jest.fn();
        
        // Subscribe to store changes
        const unsubscribe = events.subscribeToStore(storeChangeListener);

        // Create objects of different types
        store.objects.create("/company/Company", {
            id: "comp-001",
            name: "Tech Corp"
        });

        store.objects.create("/company/Employee", {
            id: "emp-001",
            name: "John Doe",
            email: "john@example.com"
        });

        // Verify listener was called for each creation
        expect(storeChangeListener).toHaveBeenCalledTimes(2);

        unsubscribe();
    });

    test("should trigger store subscription for multiple operations", () => {
        const storeChangeListener = jest.fn();
        
        // Subscribe to store changes
        const unsubscribe = events.subscribeToStore(storeChangeListener);

        // Create an object
        const company = store.objects.create("/company/Company", {
            id: "comp-001",
            name: "Tech Corp"
        });

        // Update the object
        store.objects.update((comp: any) => {
            comp.name = "Updated Tech Corp";
        }, company);

        // Create another object
        store.objects.create("/company/Employee", {
            id: "emp-001",
            name: "John Doe",
            email: "john@example.com"
        });

        // Verify listener was called for each operation
        expect(storeChangeListener).toHaveBeenCalledTimes(3);

        unsubscribe();
    });

    test("should handle partial unsubscribe with multiple store listeners", () => {
        const listener1 = jest.fn();
        const listener2 = jest.fn();
        
        // Subscribe two listeners
        const unsubscribe1 = events.subscribeToStore(listener1);
        const unsubscribe2 = events.subscribeToStore(listener2);

        // Create an object - should trigger both listeners
        store.objects.create("/company/Company", {
            id: "comp-001",
            name: "Tech Corp"
        });

        expect(listener1).toHaveBeenCalledTimes(1);
        expect(listener2).toHaveBeenCalledTimes(1);

        // Unsubscribe only first listener
        unsubscribe1();

        // Create another object - should only trigger second listener
        store.objects.create("/company/Employee", {
            id: "emp-001",
            name: "John Doe",
            email: "john@example.com"
        });

        // Verify only listener2 was called for second operation
        expect(listener1).toHaveBeenCalledTimes(1);
        expect(listener2).toHaveBeenCalledTimes(2);

        unsubscribe2();
    });

    test("should work with both store and object subscriptions simultaneously", () => {
        const storeListener = jest.fn();
        const objectListener = jest.fn();
        
        // Create an object first
        const company = store.objects.create("/company/Company", {
            id: "comp-001",
            name: "Tech Corp"
        });

        // Subscribe to both store and specific object
        const storeUnsubscribe = events.subscribeToStore(storeListener);
        const objectUnsubscribe = events.subscribeToObject(company, objectListener);

        // Update the object - should trigger both listeners
        const updatedCompany = store.objects.update((comp: any) => {
            comp.name = "Updated Tech Corp";
        }, company);

        // Verify both listeners were called
        expect(storeListener).toHaveBeenCalledTimes(1);
        expect(objectListener).toHaveBeenCalledTimes(1);
        expect(objectListener).toHaveBeenCalledWith(updatedCompany);

        // Create a different object - should only trigger store listener
        store.objects.create("/company/Employee", {
            id: "emp-001",
            name: "John Doe",
            email: "john@example.com"
        });

        // Verify only store listener was called for different object
        expect(storeListener).toHaveBeenCalledTimes(2);
        expect(objectListener).toHaveBeenCalledTimes(1);

        storeUnsubscribe();
        objectUnsubscribe();
    });

    test("should handle rapid store changes", () => {
        const storeChangeListener = jest.fn();
        
        // Subscribe to store changes
        const unsubscribe = events.subscribeToStore(storeChangeListener);

        // Perform multiple rapid operations
        const company = store.objects.create("/company/Company", {
            id: "comp-001",
            name: "Tech Corp"
        });

        const employee1 = store.objects.create("/company/Employee", {
            id: "emp-001",
            name: "John Doe",
            email: "john@example.com"
        });

        const employee2 = store.objects.create("/company/Employee", {
            id: "emp-002", 
            name: "Jane Smith",
            email: "jane@example.com"
        });

        // Update multiple objects
        store.objects.update((comp: any) => {
            comp.name = "Updated Tech Corp";
        }, company);

        store.objects.update((emp: any) => {
            emp.email = "john.doe@example.com";
        }, employee1);

        // Verify listener was called for each operation
        expect(storeChangeListener).toHaveBeenCalledTimes(5);

        unsubscribe();
    });
});