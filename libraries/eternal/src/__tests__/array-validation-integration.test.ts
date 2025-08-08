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
    company?: Company;
    skills?: Set<string>;
}

interface Company {
    id: string;
    name: string;
    employees?: Employee[];
}

interface Badge {
    id: string;
    badgeNumber: string;
    isActive: boolean;
}

describe("Array Validation Integration", () => {
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

    describe("Array push validation", () => {
        test("should allow valid Employee objects in employees array", () => {
            let company = store.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp"
            });

            const employee1 = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            const employee2 = store.create<Employee>("/company/Employee", {
                id: "emp-002",
                firstName: "Jane",
                lastName: "Smith",
                email: "jane@company.com",
                isActive: true
            });

            // This should work - adding valid Employee objects
            expect(() => {
                company = store.update((comp) => {
                    comp.employees!.push(employee1, employee2);
                }, company);
            }).not.toThrow();
            
            expect(company.employees!.includes(employee1)).toBe(true);
            expect(company.employees!.includes(employee2)).toBe(true);
        });

        test("should reject wrong object types in employees array", () => {
            const company = store.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp"
            });

            const badge = store.create<Badge>("/company/Badge", {
                id: "badge-001",
                badgeNumber: "B001",
                isActive: true
            });

            // This should fail - adding Badge to Employee array
            expect(() => {
                store.update((comp) => {
                    (comp.employees as any).push(badge);
                }, company);
            }).toThrow(/Type mismatch for property 'employees\[element\]'/);
        });

        test("should reject primitive values in employees array", () => {
            const company = store.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp"
            });

            // This should fail - adding string to Employee array
            expect(() => {
                store.update((comp) => {
                    (comp.employees as any).push("invalid string");
                }, company);
            }).toThrow(/Invalid element for collection property 'employees'/);
        });
    });

    describe("Array unshift validation", () => {
        test("should validate elements added via unshift", () => {
            let company = store.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp"
            });

            const employee = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            const badge = store.create<Badge>("/company/Badge", {
                id: "badge-001",
                badgeNumber: "B001",
                isActive: true
            });

            // Valid unshift should work
            expect(() => {
                company = store.update((comp) => {
                    comp.employees!.unshift(employee);
                }, company);
            }).not.toThrow();

            // Invalid unshift should fail
            expect(() => {
                store.update((comp) => {
                    (comp.employees as any).unshift(badge);
                }, company);
            }).toThrow(/Type mismatch for property 'employees\[element\]'/);
        });
    });

    describe("Array splice validation", () => {
        test("should validate elements added via splice", () => {
            let company = store.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp"
            });

            const employee1 = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            const employee2 = store.create<Employee>("/company/Employee", {
                id: "emp-002",
                firstName: "Jane",
                lastName: "Smith",
                email: "jane@company.com",
                isActive: true
            });

            const badge = store.create<Badge>("/company/Badge", {
                id: "badge-001",
                badgeNumber: "B001",
                isActive: true
            });

            // Valid splice should work
            expect(() => {
                company = store.update((comp) => {
                    comp.employees!.splice(0, 0, employee1, employee2);
                }, company);
            }).not.toThrow();

            // Invalid splice should fail
            expect(() => {
                store.update((comp) => {
                    (comp.employees as any).splice(0, 0, badge);
                }, company);
            }).toThrow(/Type mismatch for property 'employees\[element\]'/);
        });
    });

    describe("Array setByIndex validation", () => {
        test("should validate element set by index", () => {
            let company = store.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp"
            });

            const employee1 = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            const employee2 = store.create<Employee>("/company/Employee", {
                id: "emp-002",
                firstName: "Jane",
                lastName: "Smith",
                email: "jane@company.com",
                isActive: true
            });

            const badge = store.create<Badge>("/company/Badge", {
                id: "badge-001",
                badgeNumber: "B001",
                isActive: true
            });

            // First add an employee
            company = store.update((comp) => {
                comp.employees!.push(employee1);
            }, company);

            // Valid setByIndex should work
            expect(() => {
                company = store.update((comp) => {
                    comp.employees![0] = employee2;
                }, company);
            }).not.toThrow();

            // Invalid setByIndex should fail
            expect(() => {
                store.update((comp) => {
                    (comp.employees as any)[0] = badge;
                }, company);
            }).toThrow(/Type mismatch for property 'employees\[element\]'/);
        });
    });

    // Note: Set validation will be covered in Phase 2.2: Set Handler Validation
});