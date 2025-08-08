import { RegistryService } from "../registry/RegistryService";
import { RegistryMetadata } from "../registry/NamespaceMetadata";
import { createStore } from "../store/createStore";
import { IStore } from "../interfaces/IStore";
import { IEvents } from "../interfaces/IEvents";
import { companyNamespace } from "./example-namespaces/company-namespace";

describe("Object Subscription Tests", () => {
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

    test("should subscribe to individual object updates", () => {
        const objectUpdateListener = jest.fn();
        
        // Create a company object
    let company = store.objects.create("/company/Company", {
            id: "comp-001",
            name: "Tech Corp"
        });

        // Subscribe to updates on this specific object
        const unsubscribe = events.subscribeToObject(company, objectUpdateListener);

        // Update the object
        const updatedCompany = store.objects.update((comp: any) => {
            comp.name = "Updated Tech Corp";
        }, company);

        // Verify listener was called with updated object
        expect(objectUpdateListener).toHaveBeenCalledTimes(1);
        expect(objectUpdateListener).toHaveBeenCalledWith(updatedCompany);

        unsubscribe();
    });

    test("should not trigger object listener for other objects", () => {
        const objectUpdateListener = jest.fn();
        
        // Create two company objects
        const company1 = store.objects.create("/company/Company", {
            id: "comp-001",
            name: "Tech Corp 1"
        });
        
        const company2 = store.objects.create("/company/Company", {
            id: "comp-002", 
            name: "Tech Corp 2"
        });

        // Subscribe only to company1 updates
        const unsubscribe = events.subscribeToObject(company1, objectUpdateListener);

        // Update company2 - should not trigger listener
        store.objects.update((comp: any) => {
            comp.name = "Updated Tech Corp 2";
        }, company2);

        // Verify listener was not called
        expect(objectUpdateListener).not.toHaveBeenCalled();

        // Update company1 - should trigger listener
        const updatedCompany1 = store.objects.update((comp: any) => {
            comp.name = "Updated Tech Corp 1";
        }, company1);

        // Verify listener was called only once for company1
        expect(objectUpdateListener).toHaveBeenCalledTimes(1);
        expect(objectUpdateListener).toHaveBeenCalledWith(updatedCompany1);

        unsubscribe();
    });

    test("should handle multiple listeners on same object", () => {
        const listener1 = jest.fn();
        const listener2 = jest.fn();
        
        // Create a company object
    let company = store.objects.create("/company/Company", {
            id: "comp-001",
            name: "Tech Corp"
        });

        // Subscribe multiple listeners to the same object
        const unsubscribe1 = events.subscribeToObject(company, listener1);
        const unsubscribe2 = events.subscribeToObject(company, listener2);

        // Update the object
        const updatedCompany = store.objects.update((comp: any) => {
            comp.name = "Updated Tech Corp";
        }, company);

        // Verify both listeners were called
        expect(listener1).toHaveBeenCalledTimes(1);
        expect(listener1).toHaveBeenCalledWith(updatedCompany);
        expect(listener2).toHaveBeenCalledTimes(1);
        expect(listener2).toHaveBeenCalledWith(updatedCompany);

        unsubscribe1();
        unsubscribe2();
    });

    test("should properly unsubscribe object listeners", () => {
        const objectUpdateListener = jest.fn();
        
        // Create a company object
        let company = store.objects.create("/company/Company", {
            id: "comp-001",
            name: "Tech Corp"
        });

        // Subscribe to updates
        const unsubscribe = events.subscribeToObject(company, objectUpdateListener);

        // Update the object - should trigger listener
        company = store.objects.update((comp: any) => {
            comp.name = "First Update";
        }, company);

        expect(objectUpdateListener).toHaveBeenCalledTimes(1);

        // Unsubscribe
        unsubscribe();

        // Update again - should not trigger listener
        company = store.objects.update((comp: any) => {
            comp.name = "Second Update";
        }, company);

        // Verify listener was not called after unsubscribe
        expect(objectUpdateListener).toHaveBeenCalledTimes(1);
    });

    test("should subscribe to different object types", () => {
        const companyListener = jest.fn();
        const employeeListener = jest.fn();
        
        // Create objects of different types
        const company = store.objects.create("/company/Company", {
            id: "comp-001",
            name: "Tech Corp"
        });
        
        const employee = store.objects.create("/company/Employee", {
            id: "emp-001",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            isActive: true
        });

        // Subscribe to each object
        const companyUnsubscribe = events.subscribeToObject(company, companyListener);
        const employeeUnsubscribe = events.subscribeToObject(employee, employeeListener);

        // Update company
        const updatedCompany = store.objects.update((comp: any) => {
            comp.name = "Updated Tech Corp";
        }, company);

        // Update employee
        const updatedEmployee = store.objects.update((emp: any) => {
            emp.firstName = "Jane";
        }, employee);

        // Verify each listener was called with correct object
        expect(companyListener).toHaveBeenCalledTimes(1);
        expect(companyListener).toHaveBeenCalledWith(updatedCompany);
        expect(employeeListener).toHaveBeenCalledTimes(1);
        expect(employeeListener).toHaveBeenCalledWith(updatedEmployee);

        companyUnsubscribe();
        employeeUnsubscribe();
    });

    test("should handle object subscription with property updates", () => {
        const objectUpdateListener = jest.fn();
        
        // Create an employee object
        const employee = store.objects.create("/company/Employee", {
            id: "emp-001",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            isActive: true
        });

        // Subscribe to object updates
        const unsubscribe = events.subscribeToObject(employee, objectUpdateListener);

        // Update different properties
        const updatedEmployee1 = store.objects.update((emp: any) => {
            emp.firstName = "Jane";
        }, employee);

        const updatedEmployee2 = store.objects.update((emp: any) => {
            emp.email = "jane@example.com";
        }, updatedEmployee1);

        // Verify listener was called for each update
        expect(objectUpdateListener).toHaveBeenCalledTimes(2);
        expect(objectUpdateListener).toHaveBeenNthCalledWith(1, updatedEmployee1);
        expect(objectUpdateListener).toHaveBeenNthCalledWith(2, updatedEmployee2);

        unsubscribe();
    });
});