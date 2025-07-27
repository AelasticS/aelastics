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
    salary?: number;
    dateOfBirth?: Date;
    badge?: Badge;
    company: Company;
    skills?: Set<string>;
    metadata?: Map<string, string>;
}

interface Badge {
    id: string;
    badgeNumber: string;
    isActive: boolean;
    employee: Employee;
}

interface Company {
    id: string;
    name: string;
    foundedYear?: number;
    employees?: Employee[];
}

describe("Object Creation Validation", () => {
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

    describe("Valid object creation", () => {
        test("should allow creation with valid primitive properties", () => {
            expect(() => {
                const employee = store.create<Employee>("/company/Employee", {
                    id: "emp-001",
                    firstName: "John",
                    lastName: "Doe",
                    email: "john@company.com",
                    isActive: true,
                    salary: 75000,
                    dateOfBirth: new Date("1990-01-01")
                });
                
                expect(employee.id).toBe("emp-001");
                expect(employee.firstName).toBe("John");
                expect(employee.salary).toBe(75000);
                expect(employee.isActive).toBe(true);
            }).not.toThrow();
        });

        test("should allow creation with valid object properties", () => {
            const company = store.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp",
                foundedYear: 2010
            });

            const badge = store.create<Badge>("/company/Badge", {
                id: "badge-001",
                badgeNumber: "B001",
                isActive: true,
                employee: undefined as any // Will be set after employee creation
            });

            expect(() => {
                const employee = store.create<Employee>("/company/Employee", {
                    id: "emp-001",
                    firstName: "John",
                    lastName: "Doe",
                    email: "john@company.com",
                    isActive: true,
                    badge: badge,
                    company: company
                });
                
                expect(employee.badge).toBe(badge);
                expect(employee.company).toBe(company);
            }).not.toThrow();
        });

        test("should allow creation with valid collection properties", () => {
            const company = store.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp"
            });

            expect(() => {
                const employee = store.create<Employee>("/company/Employee", {
                    id: "emp-001",
                    firstName: "John",
                    lastName: "Doe",
                    email: "john@company.com",
                    isActive: true,
                    company: company,
                    skills: ["JavaScript", "TypeScript", "React"] as any
                });
                
                expect(employee.skills!.has("JavaScript")).toBe(true);
                expect(employee.skills!.has("TypeScript")).toBe(true);
                expect(employee.skills!.size).toBe(3);
            }).not.toThrow();
        });
    });

    describe("Invalid primitive property validation", () => {
        test("should reject wrong primitive types during creation", () => {
            expect(() => {
                store.create<Employee>("/company/Employee", {
                    id: "emp-001",
                    firstName: "John",
                    lastName: "Doe",
                    email: "john@company.com",
                    isActive: "true" as any, // Should be boolean
                    salary: 75000
                });
            }).toThrow(/Expected boolean, but received string/);
        });

        test("should reject invalid string types", () => {
            expect(() => {
                store.create<Employee>("/company/Employee", {
                    id: 123 as any, // Should be string
                    firstName: "John",
                    lastName: "Doe",
                    email: "john@company.com",
                    isActive: true
                });
            }).toThrow(/Expected string, but received number/);
        });

        test("should reject invalid number types", () => {
            expect(() => {
                store.create<Company>("/company/Company", {
                    id: "comp-001",
                    name: "Tech Corp",
                    foundedYear: "2010" as any // Should be number
                });
            }).toThrow(/Expected number, but received string/);
        });
    });

    describe("Invalid object property validation", () => {
        test("should reject wrong object types during creation", () => {
            const company = store.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp"
            });

            const badge = store.create<Badge>("/company/Badge", {
                id: "badge-001",
                badgeNumber: "B001",
                isActive: true,
                employee: undefined as any
            });

            expect(() => {
                store.create<Employee>("/company/Employee", {
                    id: "emp-001",
                    firstName: "John",
                    lastName: "Doe",
                    email: "john@company.com",
                    isActive: true,
                    badge: company as any, // Should be Badge, not Company
                    company: company
                });
            }).toThrow(/Type mismatch for property 'badge': Cannot assign object of type/);
        });

        test("should reject primitive values for object properties", () => {
            expect(() => {
                store.create<Employee>("/company/Employee", {
                    id: "emp-001",
                    firstName: "John",
                    lastName: "Doe",
                    email: "john@company.com",
                    isActive: true,
                    badge: "invalid-badge" as any // Should be Badge object
                });
            }).toThrow(/Invalid value for property 'badge'. Expected an object, but received string/);
        });

        test("should reject non-store objects for object properties", () => {
            const plainObject = { id: "plain-001", name: "Plain Object" };

            expect(() => {
                store.create<Employee>("/company/Employee", {
                    id: "emp-001",
                    firstName: "John",
                    lastName: "Doe",
                    email: "john@company.com",
                    isActive: true,
                    company: plainObject as any // Not a store object
                });
            }).toThrow(/Object assigned to property 'company' must have a UUID/);
        });
    });

    describe("Invalid collection element validation", () => {
        test("should reject wrong types in string sets during creation", () => {
            const company = store.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp"
            });

            expect(() => {
                store.create<Employee>("/company/Employee", {
                    id: "emp-001",
                    firstName: "John",
                    lastName: "Doe",
                    email: "john@company.com",
                    isActive: true,
                    company: company,
                    skills: ["JavaScript", 123, "React"] as any // Number in string set
                });
            }).toThrow(/Expected string, but received number/);
        });

        test("should reject wrong types in object arrays during creation", () => {
            const company = store.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp"
            });

            const employee1 = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true,
                company: company
            });

            const badge = store.create<Badge>("/company/Badge", {
                id: "badge-001",
                badgeNumber: "B001",
                isActive: true,
                employee: employee1
            });

            expect(() => {
                store.create<Company>("/company/Company", {
                    id: "comp-002",
                    name: "Another Corp",
                    employees: [employee1, badge] as any // Badge in Employee array
                });
            }).toThrow(/Type mismatch for property 'employees\[element\]'/);
        });

        test("should reject null/undefined elements in collections during creation", () => {
            const company = store.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp"
            });

            expect(() => {
                store.create<Employee>("/company/Employee", {
                    id: "emp-001",
                    firstName: "John",
                    lastName: "Doe",
                    email: "john@company.com",
                    isActive: true,
                    company: company,
                    skills: ["JavaScript", null, "React"] as any
                });
            }).toThrow(/Cannot initial_state null or undefined to collection property 'skills'/);
        });
    });

    describe("Property existence validation", () => {
        test("should reject creation with non-existent properties", () => {
            expect(() => {
                store.create<Employee>("/company/Employee", {
                    id: "emp-001",
                    firstName: "John",
                    lastName: "Doe",
                    email: "john@company.com",
                    isActive: true,
                    invalidProperty: "should not exist"
                } as any);
            }).toThrow(/Property 'invalidProperty' does not exist in type '\/company\/Employee'/);
        });
    });

    describe("Complex validation scenarios", () => {
        test("should handle multiple validation errors appropriately", () => {
            // Test that the first validation error is thrown and stops processing
            expect(() => {
                store.create<Employee>("/company/Employee", {
                    id: 123 as any, // Invalid: should be string
                    firstName: "John",
                    lastName: "Doe",
                    email: "john@company.com",
                    isActive: "true" as any, // Invalid: should be boolean  
                    salary: "invalid" as any // Invalid: should be number
                });
            }).toThrow(/Expected string, but received number/); // First error should be about 'id'
        });

        test("should allow optional properties to be undefined or omitted", () => {
            const company = store.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp"
            });

            expect(() => {
                const employee = store.create<Employee>("/company/Employee", {
                    id: "emp-001",
                    firstName: "John",
                    lastName: "Doe",
                    email: "john@company.com",
                    isActive: true,
                    company: company,
                    // Optional properties: salary, dateOfBirth, badge, skills, metadata
                    salary: undefined,
                    badge: undefined
                });
                
                expect(employee.salary).toBeUndefined();
                expect(employee.badge).toBeUndefined();
            }).not.toThrow();
        });
    });
});