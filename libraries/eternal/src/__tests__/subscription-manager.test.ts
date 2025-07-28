import { RegistryService } from "../registry/RegistryService";
import { RegistryMetadata } from "../registry/NamespaceMetadata";
import { createStore } from "../store/createStore";
import { SubscriptionManager } from "../events/SubscriptionManager";
import { EventPayload, Result } from "../events/EventTypes";
import { IStore } from "../interfaces/IStore";
import { companyNamespace } from "./example-namespaces/company-namespace";

// TypeScript interfaces matching the namespace type definitions
interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
    company?: Company;
    skills?: Set<string>;
}

interface Company {
    id: string;
    name: string;
    foundedYear?: number;
    employees: Employee[];
}

describe("SubscriptionManager", () => {
    let registry: RegistryService;
    let store: IStore;
    let subscriptionManager: SubscriptionManager;

    beforeEach(() => {
        const registryMetadata: RegistryMetadata = {
            namespaces: new Map(),
            name: "test-registry",
            version: "1.0.0"
        };
        registry = new RegistryService(registryMetadata);
        registry.importNamespace(companyNamespace);
        store = createStore(registry);
        subscriptionManager = new SubscriptionManager(store.getEternalStore());
    });

    describe("Event Pattern Subscriptions", () => {
        test("should register and trigger before.create events", () => {
            const mockListener = jest.fn().mockReturnValue({ success: true });
            
            const unsubscribe = subscriptionManager.subscribe(
                mockListener,
                "before",
                "create",
                "/company/Employee"
            );

            const testEvent: EventPayload = {
                timing: "before",
                operation: "create",
                objectType: "/company/Employee",
                timestamp: Date.now()
            };

            const result = subscriptionManager.emit(testEvent);

            expect(result.success).toBe(true);
            expect(mockListener).toHaveBeenCalledWith(testEvent);
            expect(mockListener).toHaveBeenCalledTimes(1);

            unsubscribe();
        });

        test("should register and trigger after.update events with property", () => {
            const mockListener = jest.fn().mockReturnValue({ success: true });
            
            const unsubscribe = subscriptionManager.subscribe(
                mockListener,
                "after",
                "update",
                "/company/Employee",
                "firstName"
            );

            const testEvent: EventPayload = {
                timing: "after",
                operation: "update",
                objectType: "/company/Employee",
                property: "firstName",
                timestamp: Date.now()
            };

            const result = subscriptionManager.emit(testEvent);

            expect(result.success).toBe(true);
            expect(mockListener).toHaveBeenCalledWith(testEvent);

            unsubscribe();
        });

        test("should support wildcard patterns for timing", () => {
            const mockListener = jest.fn().mockReturnValue({ success: true });
            
            const unsubscribe = subscriptionManager.subscribe(
                mockListener,
                "*",
                "create",
                "/company/Employee"
            );

            const beforeEvent: EventPayload = {
                timing: "before",
                operation: "create",
                objectType: "/company/Employee",
                timestamp: Date.now()
            };

            const afterEvent: EventPayload = {
                timing: "after",
                operation: "create",
                objectType: "/company/Employee",
                timestamp: Date.now()
            };

            subscriptionManager.emit(beforeEvent);
            subscriptionManager.emit(afterEvent);

            expect(mockListener).toHaveBeenCalledTimes(2);
            expect(mockListener).toHaveBeenCalledWith(beforeEvent);
            expect(mockListener).toHaveBeenCalledWith(afterEvent);

            unsubscribe();
        });

        test("should support wildcard patterns for operation", () => {
            const mockListener = jest.fn().mockReturnValue({ success: true });
            
            const unsubscribe = subscriptionManager.subscribe(
                mockListener,
                "after",
                "*",
                "/company/Employee"
            );

            const createEvent: EventPayload = {
                timing: "after",
                operation: "create",
                objectType: "/company/Employee",
                timestamp: Date.now()
            };

            const updateEvent: EventPayload = {
                timing: "after",
                operation: "update",
                objectType: "/company/Employee",
                timestamp: Date.now()
            };

            subscriptionManager.emit(createEvent);
            subscriptionManager.emit(updateEvent);

            expect(mockListener).toHaveBeenCalledTimes(2);

            unsubscribe();
        });

        test("should support wildcard patterns for object type", () => {
            const mockListener = jest.fn().mockReturnValue({ success: true });
            
            const unsubscribe = subscriptionManager.subscribe(
                mockListener,
                "after",
                "create",
                "*"
            );

            const employeeEvent: EventPayload = {
                timing: "after",
                operation: "create",
                objectType: "/company/Employee",
                timestamp: Date.now()
            };

            const companyEvent: EventPayload = {
                timing: "after",
                operation: "create",
                objectType: "/company/Company",
                timestamp: Date.now()
            };

            subscriptionManager.emit(employeeEvent);
            subscriptionManager.emit(companyEvent);

            expect(mockListener).toHaveBeenCalledTimes(2);

            unsubscribe();
        });

        test("should support wildcard patterns for property", () => {
            const mockListener = jest.fn().mockReturnValue({ success: true });
            
            const unsubscribe = subscriptionManager.subscribe(
                mockListener,
                "after",
                "update",
                "/company/Employee",
                "*"
            );

            const firstNameEvent: EventPayload = {
                timing: "after",
                operation: "update",
                objectType: "/company/Employee",
                property: "firstName",
                timestamp: Date.now()
            };

            const lastNameEvent: EventPayload = {
                timing: "after",
                operation: "update",
                objectType: "/company/Employee",
                property: "lastName",
                timestamp: Date.now()
            };

            subscriptionManager.emit(firstNameEvent);
            subscriptionManager.emit(lastNameEvent);

            expect(mockListener).toHaveBeenCalledTimes(2);

            unsubscribe();
        });

        test("should handle multiple listeners for same event pattern", () => {
            const mockListener1 = jest.fn().mockReturnValue({ success: true });
            const mockListener2 = jest.fn().mockReturnValue({ success: true });
            
            const unsubscribe1 = subscriptionManager.subscribe(
                mockListener1,
                "before",
                "create",
                "/company/Employee"
            );

            const unsubscribe2 = subscriptionManager.subscribe(
                mockListener2,
                "before",
                "create",
                "/company/Employee"
            );

            const testEvent: EventPayload = {
                timing: "before",
                operation: "create",
                objectType: "/company/Employee",
                timestamp: Date.now()
            };

            const result = subscriptionManager.emit(testEvent);

            expect(result.success).toBe(true);
            expect(mockListener1).toHaveBeenCalledWith(testEvent);
            expect(mockListener2).toHaveBeenCalledWith(testEvent);

            unsubscribe1();
            unsubscribe2();
        });

        test("should unsubscribe correctly", () => {
            const mockListener = jest.fn().mockReturnValue({ success: true });
            
            const unsubscribe = subscriptionManager.subscribe(
                mockListener,
                "before",
                "create",
                "/company/Employee"
            );

            const testEvent: EventPayload = {
                timing: "before",
                operation: "create",
                objectType: "/company/Employee",
                timestamp: Date.now()
            };

            subscriptionManager.emit(testEvent);
            expect(mockListener).toHaveBeenCalledTimes(1);

            unsubscribe();

            subscriptionManager.emit(testEvent);
            expect(mockListener).toHaveBeenCalledTimes(1);
        });
    });

    describe("Event Validation", () => {
        test("should cancel operation when listener returns failure", () => {
            const mockListener = jest.fn().mockReturnValue({ 
                success: false, 
                errors: [{ message: "Validation failed" }] 
            });
            
            const unsubscribe = subscriptionManager.subscribe(
                mockListener,
                "before",
                "create",
                "/company/Employee"
            );

            const testEvent: EventPayload = {
                timing: "before",
                operation: "create",
                objectType: "/company/Employee",
                timestamp: Date.now()
            };

            const result = subscriptionManager.emit(testEvent);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors[0].message).toBe("Validation failed");
            }
            expect(mockListener).toHaveBeenCalledWith(testEvent);

            unsubscribe();
        });

        test("should stop execution on first failure with multiple listeners", () => {
            const mockListener1 = jest.fn().mockReturnValue({ 
                success: false, 
                errors: [{ message: "First validation failed" }] 
            });
            const mockListener2 = jest.fn().mockReturnValue({ success: true });
            
            const unsubscribe1 = subscriptionManager.subscribe(
                mockListener1,
                "before",
                "create",
                "/company/Employee"
            );

            const unsubscribe2 = subscriptionManager.subscribe(
                mockListener2,
                "before",
                "create",
                "/company/Employee"
            );

            const testEvent: EventPayload = {
                timing: "before",
                operation: "create",
                objectType: "/company/Employee",
                timestamp: Date.now()
            };

            const result = subscriptionManager.emit(testEvent);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.errors[0].message).toBe("First validation failed");
            }
            expect(mockListener1).toHaveBeenCalledWith(testEvent);

            unsubscribe1();
            unsubscribe2();
        });

        test("should continue execution when all listeners return success", () => {
            const mockListener1 = jest.fn().mockReturnValue({ success: true });
            const mockListener2 = jest.fn().mockReturnValue({ success: true });
            
            const unsubscribe1 = subscriptionManager.subscribe(
                mockListener1,
                "before",
                "create",
                "/company/Employee"
            );

            const unsubscribe2 = subscriptionManager.subscribe(
                mockListener2,
                "before",
                "create",
                "/company/Employee"
            );

            const testEvent: EventPayload = {
                timing: "before",
                operation: "create",
                objectType: "/company/Employee",
                timestamp: Date.now()
            };

            const result = subscriptionManager.emit(testEvent);

            expect(result.success).toBe(true);
            expect(mockListener1).toHaveBeenCalledWith(testEvent);
            expect(mockListener2).toHaveBeenCalledWith(testEvent);

            unsubscribe1();
            unsubscribe2();
        });
    });

    describe("Object Subscriptions", () => {
        test("should subscribe to specific object updates", () => {
            let employee = store.objects.create("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            const mockListener = jest.fn();
            const unsubscribe = subscriptionManager.subscribeToObject(employee, mockListener);

            employee = store.objects.update((emp: Employee) => {
                emp.firstName = "Jane";
            }, employee);

            subscriptionManager.notifySubscribers();

            expect(mockListener).toHaveBeenCalledTimes(1);
            expect(mockListener).toHaveBeenCalledWith(employee);

            unsubscribe();
        });

        test("should unsubscribe from object updates", () => {
            let employee = store.objects.create("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            const mockListener = jest.fn();
            const unsubscribe = subscriptionManager.subscribeToObject(employee, mockListener);

            employee = store.objects.update((emp: Employee) => {
                emp.firstName = "Jane";
            }, employee);

            subscriptionManager.notifySubscribers();
            expect(mockListener).toHaveBeenCalledTimes(1);

            unsubscribe();

            employee = store.objects.update((emp: Employee) => {
                emp.lastName = "Smith";
            }, employee);

            subscriptionManager.notifySubscribers();
            expect(mockListener).toHaveBeenCalledTimes(1);
        });

        test("should handle multiple object subscribers", () => {
            let employee = store.objects.create("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            const mockListener1 = jest.fn();
            const mockListener2 = jest.fn();
            
            const unsubscribe1 = subscriptionManager.subscribeToObject(employee, mockListener1);
            const unsubscribe2 = subscriptionManager.subscribeToObject(employee, mockListener2);

            employee = store.objects.update((emp: Employee) => {
                emp.firstName = "Jane";
            }, employee);

            subscriptionManager.notifySubscribers();

            expect(mockListener1).toHaveBeenCalledWith(employee);
            expect(mockListener2).toHaveBeenCalledWith(employee);

            unsubscribe1();
            unsubscribe2();
        });

        test("should throw error for objects without UUID", () => {
            const plainObject = { name: "test" };

            expect(() => {
                subscriptionManager.subscribeToObject(plainObject, () => {});
            }).toThrow("Object does not have a UUID");
        });
    });

    describe("Store Subscriptions", () => {
        test("should subscribe to store.objects updates", () => {
            const mockListener = jest.fn();
            const unsubscribe = subscriptionManager.subscribeToStore(mockListener);

            store.objects.create("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            subscriptionManager.notifySubscribers();

            expect(mockListener).toHaveBeenCalledTimes(1);

            unsubscribe();
        });

        test("should unsubscribe from store.objects updates", () => {
            const mockListener = jest.fn();
            const unsubscribe = subscriptionManager.subscribeToStore(mockListener);

            store.objects.create("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            subscriptionManager.notifySubscribers();
            expect(mockListener).toHaveBeenCalledTimes(1);

            unsubscribe();

            store.objects.create("/company/Employee", {
                id: "emp-002",
                firstName: "Jane",
                lastName: "Smith",
                email: "jane@company.com",
                isActive: true
            });

            subscriptionManager.notifySubscribers();
            expect(mockListener).toHaveBeenCalledTimes(1);
        });

        test("should handle multiple store.objects subscribers", () => {
            const mockListener1 = jest.fn();
            const mockListener2 = jest.fn();
            
            const unsubscribe1 = subscriptionManager.subscribeToStore(mockListener1);
            const unsubscribe2 = subscriptionManager.subscribeToStore(mockListener2);

            store.objects.create("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            subscriptionManager.notifySubscribers();

            expect(mockListener1).toHaveBeenCalledTimes(1);
            expect(mockListener2).toHaveBeenCalledTimes(1);

            unsubscribe1();
            unsubscribe2();
        });
    });

    describe("Event Pattern Construction", () => {
        test("should construct correct event patterns", () => {
            const { constructEventPattern } = require("../events/SubscriptionManager");
            
            expect(constructEventPattern("before", "create", "/company/Employee"))
                .toBe("before.create./company/Employee");
            
            expect(constructEventPattern("after", "update", "/company/Employee", "firstName"))
                .toBe("after.update./company/Employee.firstName");
            
            expect(constructEventPattern("*", "*", "*"))
                .toBe("*.*.*");
            
            expect(constructEventPattern("beforeCommit", "delete", "/company/Company"))
                .toBe("beforeCommit.delete./company/Company");
        });
    });

    describe("Change Log Integration", () => {
        test("should retrieve object changes", () => {
            let employee = store.objects.create("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            const objectId = store.objects.getUUID(employee);

            employee = store.objects.update((emp: Employee) => {
                emp.firstName = "Jane";
            }, employee);

            const changes = subscriptionManager.getObjectChanges(objectId);
            
            expect(changes.length).toBeGreaterThan(0);
            expect(changes.some(change => change.objectId === objectId)).toBe(true);
        });
    });

    describe("Complex Event Scenarios", () => {
        test("should handle cascading events in object relationships", () => {
            const beforeCreateListener = jest.fn().mockReturnValue({ success: true });
            const afterCreateListener = jest.fn().mockReturnValue({ success: true });
            const updateListener = jest.fn().mockReturnValue({ success: true });

            const unsubscribe1 = subscriptionManager.subscribe(
                beforeCreateListener, "before", "create", "/company/Employee"
            );
            const unsubscribe2 = subscriptionManager.subscribe(
                afterCreateListener, "after", "create", "/company/Employee"
            );
            const unsubscribe3 = subscriptionManager.subscribe(
                updateListener, "after", "update", "/company/Company", "employees"
            );

            let company = store.objects.create("/company/Company", {
                id: "comp-001",
                name: "Tech Corp"
            });

            subscriptionManager.emit({
                timing: "before",
                operation: "create",
                objectType: "/company/Employee",
                timestamp: Date.now()
            });

            subscriptionManager.emit({
                timing: "after",
                operation: "create",
                objectType: "/company/Employee",
                timestamp: Date.now()
            });

            subscriptionManager.emit({
                timing: "after",
                operation: "update",
                objectType: "/company/Company",
                property: "employees",
                timestamp: Date.now()
            });

            expect(beforeCreateListener).toHaveBeenCalledTimes(1);
            expect(afterCreateListener).toHaveBeenCalledTimes(1);
            expect(updateListener).toHaveBeenCalledTimes(1);

            unsubscribe1();
            unsubscribe2();
            unsubscribe3();
        });

        test("should handle event timing scenarios", () => {
            const beforeCommitListener = jest.fn().mockReturnValue({ success: true });
            const afterCommitListener = jest.fn().mockReturnValue({ success: true });

            const unsubscribe1 = subscriptionManager.subscribe(
                beforeCommitListener, "beforeCommit", "*", "*"
            );
            const unsubscribe2 = subscriptionManager.subscribe(
                afterCommitListener, "afterCommit", "*", "*"
            );

            subscriptionManager.emit({
                timing: "beforeCommit",
                operation: "create",
                objectType: "/company/Employee",
                timestamp: Date.now()
            });

            subscriptionManager.emit({
                timing: "afterCommit",
                operation: "create",
                objectType: "/company/Employee",
                timestamp: Date.now()
            });

            expect(beforeCommitListener).toHaveBeenCalledTimes(1);
            expect(afterCommitListener).toHaveBeenCalledTimes(1);

            unsubscribe1();
            unsubscribe2();
        });
    });
});