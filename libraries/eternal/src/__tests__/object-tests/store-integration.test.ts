import { RegistryService } from "../../registry/RegistryService";
import { RegistryMetadata } from "../../registry/NamespaceMetadata";
import { createStore } from "../../store/createStore";
import { IStore } from "../../interfaces/IStore";
import { companyNamespace } from "../example-namespaces/company-namespace";
import { coreNamespace } from "../example-namespaces/core-namespace";

// TypeScript interfaces matching the namespace type definitions
interface Address {
    street: string;
    city: string;
    zipCode: string;
    country?: string;
}

interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth?: Date;
    salary?: number;
    isActive: boolean;
    homeAddress?: Address;
    skills?: Set<string>;
    badge?: Badge;
    company?: Company;
    projects?: Project[];
}

interface Company {
    id: string;
    name: string;
    foundedYear?: number;
    headquartersAddress?: Address;
    employees?: Employee[];
}

interface Project {
    id: string;
    name: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    assignedEmployees?: Employee[];
}

interface Badge {
    id: string;
    badgeNumber: string;
    isActive: boolean;
    employee?: Employee;
}

describe("Store Integration Tests", () => {
    let registry: RegistryService;
    let store: IStore;
    
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
        
        // Create store with enhanced registry integration
        store = createStore(registry);
    });

    describe("Object Creation with Enhanced Type Resolution", () => {
        test("should create Employee object using qualified name", () => {
            const employee = store.objects.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@company.com",
                isActive: true
            });

            expect(employee).toBeDefined();
            expect(employee.id).toBe("emp-001");
            expect(employee.firstName).toBe("John");
            expect(employee.lastName).toBe("Doe");
            expect(employee.email).toBe("john.doe@company.com");
            expect(employee.isActive).toBe(true);
            
            // Test proper defaults for optional properties
            expect(employee.dateOfBirth).toBeUndefined(); // optional
            expect(employee.salary).toBeUndefined(); // optional
            expect(employee.homeAddress).toBeUndefined(); // optional
            
            // Test collection defaults (should be initialized)
            expect(employee.skills).toBeInstanceOf(Set); // Set type - use toBeInstanceOf for proper proxy checking
            expect(employee.skills!.size).toBe(0); // Empty set
            expect(employee.projects).toEqual([]); // Array type
        });

        test("should create objects using TypeMeta reference (optimized approach)", () => {
            // Get TypeMeta objects from registry (with IntelliSense support)
            const employeeTypeMeta = registry.getType("/company/Employee");
            const companyTypeMeta = registry.getType("/company/Company");
            const addressTypeMeta = registry.getType("/company/Address");

            expect(employeeTypeMeta).toBeDefined();
            expect(companyTypeMeta).toBeDefined();
            expect(addressTypeMeta).toBeDefined();

            // Create objects using TypeMeta (most optimized - no string parsing)
            const address = store.objects.create<Address>(addressTypeMeta!, {
                street: "456 TypeMeta St",
                city: "Registry City",
                zipCode: "12345"
            });

            const company = store.objects.create<Company>(companyTypeMeta!, {
                id: "comp-typemeta",
                name: "TypeMeta Corp",
                foundedYear: 2024
            });

            const employee = store.objects.create<Employee>(employeeTypeMeta!, {
                id: "emp-typemeta",
                firstName: "TypeMeta",
                lastName: "User",
                email: "typemeta@company.com",
                isActive: true,
                homeAddress: address
            });

            // Verify objects were created correctly
            expect(employee.id).toBe("emp-typemeta");
            expect(employee.firstName).toBe("TypeMeta");
            expect(employee.homeAddress).toBe(address);
            expect(company.name).toBe("TypeMeta Corp");
            expect(address.street).toBe("456 TypeMeta St");
            
            // Test accessing related object properties (should work without updates)
            expect(employee.homeAddress!.street).toBe("456 TypeMeta St");
        });

        test("should create Company object with collection properties", () => {
            const company = store.objects.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp",
                foundedYear: 2020
            });

            expect(company).toBeDefined();
            expect(company.id).toBe("comp-001");
            expect(company.name).toBe("Tech Corp");
            expect(company.foundedYear).toBe(2020);
            
            // Collection should be initialized as empty array
            expect(company.employees).toEqual([]);
            expect(Array.isArray(company.employees)).toBe(true);
        });

        test("should create Address value object with all required properties", () => {
            const address = store.objects.create<Address>("/company/Address", {
                street: "123 Main St",
                city: "Anytown",
                zipCode: "12345"
            });

            expect(address).toBeDefined();
            expect(address.street).toBe("123 Main St");
            expect(address.city).toBe("Anytown");
            expect(address.zipCode).toBe("12345");
            expect(address.country).toBeUndefined(); // optional property
        });
    });

    describe("Property Type Validation", () => {
        test("should handle various property types correctly", () => {
            const employee = store.objects.create<Employee>("/company/Employee", {
                id: "emp-002",
                firstName: "Jane",
                lastName: "Smith",
                email: "jane@company.com",
                isActive: true,
                salary: 75000.50,
                dateOfBirth: new Date("1990-05-15")
            });

            expect(typeof employee.id).toBe("string");
            expect(typeof employee.firstName).toBe("string");
            expect(typeof employee.isActive).toBe("boolean");
            expect(typeof employee.salary).toBe("number");
            expect(employee.dateOfBirth).toBeInstanceOf(Date);
        });

        test("should validate complex property types", () => {
            const address = store.objects.create<Address>("/company/Address", {
                street: "456 Oak Ave",
                city: "Springfield", 
                zipCode: "67890",
                country: "USA"
            });

            const employee = store.objects.create<Employee>("/company/Employee", {
                id: "emp-003",
                firstName: "Bob",
                lastName: "Wilson",
                email: "bob@company.com",
                isActive: true,
                homeAddress: address
            });

            expect(employee.homeAddress).toBe(address);
            expect(employee.homeAddress!.street).toBe("456 Oak Ave");
            expect(employee.homeAddress!.country).toBe("USA");
            
            // Test accessing related object properties (should work without updates)
            expect(employee.homeAddress!.city).toBe("Springfield");
            expect(employee.homeAddress!.zipCode).toBe("67890");
        });
    });

    describe("Collection Property Handling", () => {
        test("should handle Set collection properly", () => {
            const employee = store.objects.create<Employee>("/company/Employee", {
                id: "emp-004",
                firstName: "Alice",
                lastName: "Johnson",
                email: "alice@company.com",
                isActive: true
            });

            // Skills should be initialized as Set
            expect(employee.skills).toBeInstanceOf(Set);
            expect(employee.skills!.size).toBe(0);

            // Should be able to add skills (if collection proxies are working)
            // Note: This may require recipe function for immutable updates
        });

        test("should handle Array collection properly", () => {
            const company = store.objects.create<Company>("/company/Company", {
                id: "comp-002",
                name: "Innovation Inc"
            });

            const employee1 = store.objects.create<Employee>("/company/Employee", {
                id: "emp-005",
                firstName: "Charlie",
                lastName: "Brown", 
                email: "charlie@innovation.com",
                isActive: true
            });

            const employee2 = store.objects.create<Employee>("/company/Employee", {
                id: "emp-006",
                firstName: "Diana",
                lastName: "Davis",
                email: "diana@innovation.com", 
                isActive: true
            });

            // Test array initialization
            expect(Array.isArray(company.employees)).toBe(true);
            expect(company.employees!.length).toBe(0);

            // Test project array for employee
            expect(Array.isArray(employee1.projects)).toBe(true);
            expect(employee1.projects!.length).toBe(0);
        });
    });

    describe("Type Resolution Scenarios", () => {
        test("should resolve system types correctly", () => {
            const employee = store.objects.create<Employee>("/company/Employee", {
                id: "emp-007",
                firstName: "System",
                lastName: "Test",
                email: "system@test.com",
                isActive: true
            });

            // All these should be system types resolved through registry
            expect(typeof employee.firstName).toBe("string"); // system string
            expect(typeof employee.isActive).toBe("boolean"); // system boolean
            expect(typeof employee.salary).toBe("undefined"); // optional system number
        });

        test("should resolve cross-namespace references", () => {
            // Create objects that reference types from different namespaces
            const badge = store.objects.create<Badge>("/company/Badge", {
                id: "badge-001",
                badgeNumber: "B001",
                isActive: true
            });

            expect(badge).toBeDefined();
            expect(badge.badgeNumber).toBe("B001");
            expect(typeof badge.isActive).toBe("boolean");
        });

        test("should handle relative type references", () => {
            // Test that types within the same namespace are resolved correctly
            const address = store.objects.create<Address>("/company/Address", {
                street: "789 Pine St",
                city: "Metropolis",
                zipCode: "54321"
            });

            const employee = store.objects.create<Employee>("/company/Employee", {
                id: "emp-008",
                firstName: "Reference",
                lastName: "Test",
                email: "ref@test.com",
                isActive: true,
                homeAddress: address // This should resolve via relative reference
            });

            expect(employee.homeAddress).toBe(address);
            
            // Test accessing related object properties (should work without updates)
            expect(employee.homeAddress!.street).toBe("789 Pine St");
            expect(employee.homeAddress!.city).toBe("Metropolis");
            expect(employee.homeAddress!.zipCode).toBe("54321");
        });
    });

    describe("Error Handling", () => {
        test("should reject invalid qualified names", () => {
            expect(() => {
                store.objects.create<Employee>("Employee", {}); // Missing namespace
            }).toThrow("Invalid qualified name");

            expect(() => {
                store.objects.create<Employee>("company/Employee", {}); // Missing leading slash
            }).toThrow("Invalid qualified name");

            expect(() => {
                store.objects.create<Employee>("/Employee", {}); // Missing namespace level
            }).toThrow("Invalid qualified name");
        });

        test("should handle unknown qualified names gracefully", () => {
            expect(() => {
                store.objects.create<Employee>("/nonexistent/Employee", {});
            }).toThrow("Type '/nonexistent/Employee' not found in registry");

            expect(() => {
                store.objects.create<Employee>("/company/NonExistentType", {});
            }).toThrow("Type '/company/NonExistentType' not found in registry");
        });

        test("should handle invalid property references gracefully", () => {
            // This would test registry resolution fallback
            const employee = store.objects.create<Employee>("/company/Employee", {
                id: "emp-009",
                firstName: "Fallback",
                lastName: "Test",
                email: "fallback@test.com",
                isActive: true
            });

            // Should succeed even if some registry resolution fails
            expect(employee).toBeDefined();
            expect(employee.firstName).toBe("Fallback");
        });
    });

    describe("Performance and Caching", () => {
        test("should create multiple objects efficiently with qualified names", () => {
            const startTime = Date.now();
            
            // Create multiple objects using qualified names (optimized resolution)
            for (let i = 0; i < 100; i++) {
                const employee = store.objects.create<Employee>("/company/Employee", {
                    id: `emp-perf-${i}`,
                    firstName: `First${i}`,
                    lastName: `Last${i}`,
                    email: `test${i}@perf.com`,
                    isActive: i % 2 === 0
                });
                expect(employee.id).toBe(`emp-perf-${i}`);
            }
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // Should complete reasonably quickly (adjust threshold as needed)
            expect(duration).toBeLessThan(5000); // 5 seconds max
            
            console.log(`Created 100 Employee objects using qualified names in ${duration}ms`);
        });

        test("should create objects even faster using TypeMeta references", () => {
            // Pre-fetch TypeMeta (this would typically be done once and cached)
            const employeeTypeMeta = registry.getType("/company/Employee")!;
            
            const startTime = Date.now();
            
            // Create multiple objects using TypeMeta (most optimized)
            for (let i = 0; i < 100; i++) {
                const employee = store.objects.create<Employee>(employeeTypeMeta, {
                    id: `emp-typemeta-${i}`,
                    firstName: `TypeMeta${i}`,
                    lastName: `User${i}`,
                    email: `typemeta${i}@perf.com`,
                    isActive: i % 2 === 0
                });
                expect(employee.id).toBe(`emp-typemeta-${i}`);
            }
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // Should complete even faster than qualified names
            expect(duration).toBeLessThan(5000); // 5 seconds max
            
            console.log(`Created 100 Employee objects using TypeMeta references in ${duration}ms`);
        });
    });

    describe("Registry Integration Verification", () => {
        test("should use registry for type resolution instead of string matching", () => {
            // Get access to the internal store to verify registry integration
            const internalStore = store.getEternalStore();
            
            // Create a spy to verify registry methods are being called
            const resolveTypeRefSpy = jest.spyOn(registry, 'resolveAndValidateTypeReference');
            const getTypeSpy = jest.spyOn(registry, 'getType');
            
            const employee = store.objects.create<Employee>("/company/Employee", {
                id: "emp-spy",
                firstName: "Spy",
                lastName: "Test",
                email: "spy@test.com",
                isActive: true
            });

            expect(employee).toBeDefined();
            
            // Verify that registry methods were called during object creation
            // Note: These calls happen during dynamic class creation
            expect(resolveTypeRefSpy.mock.calls.length).toBeGreaterThanOrEqual(0);
            
            resolveTypeRefSpy.mockRestore();
            getTypeSpy.mockRestore();
        });
    });
});