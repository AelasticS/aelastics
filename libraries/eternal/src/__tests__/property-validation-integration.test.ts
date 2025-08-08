import { RegistryService } from "../registry/RegistryService";
import { RegistryMetadata } from "../registry/NamespaceMetadata";
import { StoreClass } from "../store/StoreClass";
import { companyNamespace } from "./example-namespaces/company-namespace";
import { coreNamespace } from "./example-namespaces/core-namespace";

// TypeScript interfaces matching the namespace type definitions
interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
    badge?: Badge;
}

interface Badge {
    id: string;
    badgeNumber: string;
    isActive: boolean;
    employee?: Employee;
}

interface Company {
    id: string;
    name: string;
    employees?: Employee[];
}

describe("PropertyAccessors Type Validation Integration", () => {
    let registry: RegistryService;
    let store: StoreClass;
    
    beforeEach(() => {
        const registryMetadata: RegistryMetadata = {
            namespaces: new Map(),
            name: "test-registry",
            version: "1.0.0"
        };
        registry = new RegistryService(registryMetadata);
        
        // Import required namespaces
        registry.importNamespace(coreNamespace);
        registry.importNamespace(companyNamespace);
        
        // Create store directly
        store = new StoreClass(registry);
    });

    test("should allow valid object property assignment", () => {
        let employee = store.create<Employee>("/company/Employee", {
            id: "emp-001",
            firstName: "John",
            lastName: "Doe",
            email: "john@company.com",
            isActive: true
        });

        let badge = store.create<Badge>("/company/Badge", {
            id: "badge-001",
            badgeNumber: "B001",
            isActive: true
        });

        // This should work - assigning correct type using update
        expect(() => {
            store.update((emp) => {
                emp.badge = badge;
            }, employee);
        }).not.toThrow();
        employee = store.findByUUID<Employee>(store.getUUID(employee))!;
        badge = store.findByUUID<Badge>(store.getUUID(badge))!;
        expect(employee.badge).toBe(badge);
    });

    test("should reject wrong object type assignment", () => {
        const employee = store.create<Employee>("/company/Employee", {
            id: "emp-001",
            firstName: "John",
            lastName: "Doe",
            email: "john@company.com",
            isActive: true
        });

        const company = store.create<Company>("/company/Company", {
            id: "comp-001",
            name: "Tech Corp"
        });

        // This should fail - assigning Company to Badge property
        expect(() => {
            store.update((emp) => {
                (emp as any).badge = company;
            }, employee);
        }).toThrow(/Type mismatch for property 'badge': Cannot assign object of type/);
    });

    test("should allow undefined assignments for optional properties", () => {
        const employee = store.create<Employee>("/company/Employee", {
            id: "emp-001",
            firstName: "John",
            lastName: "Doe",
            email: "john@company.com",
            isActive: true
        });

        // This should work - clearing the connection
        expect(() => {
            store.update((emp) => {
                emp.badge = undefined;
            }, employee);
        }).not.toThrow();
    });

    test("should reject primitive values for object properties", () => {
        const employee = store.create<Employee>("/company/Employee", {
            id: "emp-001",
            firstName: "John",
            lastName: "Doe",
            email: "john@company.com",
            isActive: true
        });

        // This should fail at basic validation level (before TypeValidator)
        expect(() => {
            store.update((emp) => {
                (emp as any).badge = "invalid string";
            }, employee);
        }).toThrow(/Invalid value for property "badge". Expected an object, null, or undefined/);
    });
});