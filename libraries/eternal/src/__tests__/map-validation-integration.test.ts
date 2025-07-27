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
    metadata?: Map<string, string>;
}

interface Badge {
    id: string;
    badgeNumber: string;
    isActive: boolean;
}

describe("Map Validation Integration", () => {
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

    describe("Map set validation", () => {
        test("should allow valid string values in metadata map", () => {
            const employee = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            // This should work - adding valid string values to string map
            expect(() => {
                store.update((emp) => {
                    emp.metadata!.set("department", "Engineering");
                    emp.metadata!.set("level", "Senior");
                    emp.metadata!.set("location", "Remote");
                }, employee);
            }).not.toThrow();
            
            expect(employee.metadata!.get("department")).toBe("Engineering");
            expect(employee.metadata!.get("level")).toBe("Senior");
            expect(employee.metadata!.get("location")).toBe("Remote");
        });

        test("should reject object values in string map", () => {
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

            // This should fail - adding object to string map
            expect(() => {
                store.update((emp) => {
                    (emp.metadata as any).set("badge", badge);
                }, employee);
            }).toThrow(/Expected string, but received object/);
        });

        test("should reject number values in string map", () => {
            const employee = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            // This should fail - adding number to string map
            expect(() => {
                store.update((emp) => {
                    (emp.metadata as any).set("level", 5);
                }, employee);
            }).toThrow(/Expected string, but received number/);
        });

        test("should reject boolean values in string map", () => {
            const employee = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            // This should fail - adding boolean to string map
            expect(() => {
                store.update((emp) => {
                    (emp.metadata as any).set("active", true);
                }, employee);
            }).toThrow(/Expected string, but received boolean/);
        });

        test("should handle updating existing keys gracefully", () => {
            const employee = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            // Set initial value
            store.update((emp) => {
                emp.metadata!.set("department", "Engineering");
            }, employee);

            // Update the same key with new value - should work
            expect(() => {
                store.update((emp) => {
                    emp.metadata!.set("department", "Product");
                }, employee);
            }).not.toThrow();
            
            expect(employee.metadata!.get("department")).toBe("Product");
        });

        test("should reject null and undefined values", () => {
            const employee = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            // These should fail - adding null/undefined to map
            expect(() => {
                store.update((emp) => {
                    (emp.metadata as any).set("department", null);
                }, employee);
            }).toThrow(/Cannot set null or undefined to collection property 'metadata'/);

            expect(() => {
                store.update((emp) => {
                    (emp.metadata as any).set("level", undefined);
                }, employee);
            }).toThrow(/Cannot set null or undefined to collection property 'metadata'/);
        });
    });

    describe("Map operations that should not require validation", () => {
        test("get operation should work normally", () => {
            const employee = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            // Set a value first
            store.update((emp) => {
                emp.metadata!.set("department", "Engineering");
            }, employee);

            // Get should work without validation
            expect(employee.metadata!.get("department")).toBe("Engineering");
            expect(employee.metadata!.get("nonexistent")).toBeUndefined();
        });

        test("delete operation should work normally", () => {
            const employee = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            // Set a value first
            store.update((emp) => {
                emp.metadata!.set("department", "Engineering");
            }, employee);

            // Delete should work without validation
            expect(() => {
                store.update((emp) => {
                    emp.metadata!.delete("department");
                }, employee);
            }).not.toThrow();
            
            expect(employee.metadata!.has("department")).toBe(false);
        });

        test("clear operation should work normally", () => {
            const employee = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            // Set some values first
            store.update((emp) => {
                emp.metadata!.set("department", "Engineering");
                emp.metadata!.set("level", "Senior");
            }, employee);

            // Clear should work without validation
            expect(() => {
                store.update((emp) => {
                    emp.metadata!.clear();
                }, employee);
            }).not.toThrow();
            
            expect(employee.metadata!.size).toBe(0);
        });

        test("has operation should work normally", () => {
            const employee = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            // Set a value first
            store.update((emp) => {
                emp.metadata!.set("department", "Engineering");
            }, employee);

            // Has should work without validation
            expect(employee.metadata!.has("department")).toBe(true);
            expect(employee.metadata!.has("nonexistent")).toBe(false);
        });

        test("size operation should work normally", () => {
            const employee = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            // Initially empty
            expect(employee.metadata!.size).toBe(0);

            // Set some values
            store.update((emp) => {
                emp.metadata!.set("department", "Engineering");
                emp.metadata!.set("level", "Senior");
            }, employee);

            // Size should reflect the additions
            expect(employee.metadata!.size).toBe(2);
        });
    });
});