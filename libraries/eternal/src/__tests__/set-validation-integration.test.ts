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
    skills?: Set<string>;
}

interface Badge {
    id: string;
    badgeNumber: string;
    isActive: boolean;
}

describe("Set Validation Integration", () => {
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

    describe("Set add validation", () => {
        test("should allow valid string elements in skills set", () => {
            const employee = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            // This should work - adding valid string elements
            expect(() => {
                store.update((emp) => {
                    emp.skills!.add("JavaScript");
                    emp.skills!.add("TypeScript");
                    emp.skills!.add("React");
                }, employee);
            }).not.toThrow();
            
            expect(employee.skills!.has("JavaScript")).toBe(true);
            expect(employee.skills!.has("TypeScript")).toBe(true);
            expect(employee.skills!.has("React")).toBe(true);
        });

        test("should reject object values in string set", () => {
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

            // This should fail - adding object to string set
            expect(() => {
                store.update((emp) => {
                    (emp.skills as any).add(badge);
                }, employee);
            }).toThrow(/Expected string, but received object/);
        });

        test("should reject number values in string set", () => {
            const employee = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            // This should fail - adding number to string set
            expect(() => {
                store.update((emp) => {
                    (emp.skills as any).add(123);
                }, employee);
            }).toThrow(/Expected string, but received number/);
        });

        test("should reject boolean values in string set", () => {
            const employee = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            // This should fail - adding boolean to string set
            expect(() => {
                store.update((emp) => {
                    (emp.skills as any).add(true);
                }, employee);
            }).toThrow(/Expected string, but received boolean/);
        });

        test("should handle duplicate additions gracefully", () => {
            const employee = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            // Add the same skill multiple times - should not throw but also not duplicate
            expect(() => {
                store.update((emp) => {
                    emp.skills!.add("JavaScript");
                    emp.skills!.add("JavaScript"); // Duplicate
                    emp.skills!.add("JavaScript"); // Another duplicate
                }, employee);
            }).not.toThrow();
            
            expect(employee.skills!.has("JavaScript")).toBe(true);
            expect(employee.skills!.size).toBe(1); // Should only have one instance
        });

        test("should reject null and undefined values", () => {
            const employee = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            // These should fail - adding null/undefined to set
            expect(() => {
                store.update((emp) => {
                    (emp.skills as any).add(null);
                }, employee);
            }).toThrow(/Cannot add null or undefined to collection property 'skills'/);

            expect(() => {
                store.update((emp) => {
                    (emp.skills as any).add(undefined);
                }, employee);
            }).toThrow(/Cannot add null or undefined to collection property 'skills'/);
        });
    });

    describe("Set operations that should not require validation", () => {
        test("delete operation should work normally", () => {
            const employee = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            // Add a skill first
            store.update((emp) => {
                emp.skills!.add("JavaScript");
            }, employee);

            // Delete should work without validation
            expect(() => {
                store.update((emp) => {
                    emp.skills!.delete("JavaScript");
                }, employee);
            }).not.toThrow();
            
            expect(employee.skills!.has("JavaScript")).toBe(false);
        });

        test("clear operation should work normally", () => {
            const employee = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            // Add some skills first
            store.update((emp) => {
                emp.skills!.add("JavaScript");
                emp.skills!.add("TypeScript");
            }, employee);

            // Clear should work without validation
            expect(() => {
                store.update((emp) => {
                    emp.skills!.clear();
                }, employee);
            }).not.toThrow();
            
            expect(employee.skills!.size).toBe(0);
        });

        test("has operation should work normally", () => {
            const employee = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            // Add a skill first
            store.update((emp) => {
                emp.skills!.add("JavaScript");
            }, employee);

            // Has should work without validation
            expect(employee.skills!.has("JavaScript")).toBe(true);
            expect(employee.skills!.has("Python")).toBe(false);
        });
    });
});