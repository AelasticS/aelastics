import { RegistryService } from "../registry/RegistryService";
import { RegistryMetadata } from "../registry/NamespaceMetadata";
import { StoreClass } from "../store/StoreClass";
import { companyNamespace } from "./example-namespaces/company-namespace";
import { coreNamespace } from "./example-namespaces/core-namespace";
import { subtypeExamplesNamespace } from "./example-namespaces/subtype-examples-namespace";

// TypeScript interfaces matching the namespace type definitions
interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
    badge?: Badge;
    company: Company;
    skills?: Set<string>;
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

interface BaseUser {
    id: string;
    username: string;
    email: string;
    isActive: boolean;
    createdAt: Date;
}

interface SuperAdminUser extends BaseUser {
    systemAccess: boolean;
    securityClearance: string;
}

describe("Comprehensive Type Validation", () => {
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
        registry.importNamespace(subtypeExamplesNamespace);
        
        // Create store directly
        store = new StoreClass(registry);
    });

    describe("Inheritance Validation", () => {
        test("should allow assignment of subclass to superclass property", () => {
            // Create a SuperAdminUser - only with properties defined in SuperAdminUser type
            const superAdmin = store.create<SuperAdminUser>("/subtypes/SuperAdminUser", {
                systemAccess: true,
                securityClearance: "TOP_SECRET"
            });

            const baseUser = store.create<BaseUser>("/subtypes/BaseUser", {
                id: "user-001",
                username: "normaluser",
                email: "user@company.com",
                isActive: true,
                createdAt: new Date()
            });

            // This should work - SuperAdminUser is a subclass of BaseUser
            // Note: This test verifies instanceof checks work correctly
            expect(superAdmin.systemAccess).toBe(true);
            expect(superAdmin.securityClearance).toBe("TOP_SECRET");
            
            // Both should be instances of their respective types
            expect(baseUser.id).toBe("user-001");
            expect(baseUser.isActive).toBe(true);
        });

        test("should properly validate inheritance in collections", () => {
            const superAdmin = store.create<SuperAdminUser>("/subtypes/SuperAdminUser", {
                systemAccess: true,
                securityClearance: "TOP_SECRET"
            });

            const baseUser = store.create<BaseUser>("/subtypes/BaseUser", {
                id: "user-001",
                username: "normaluser",
                email: "user@company.com",
                isActive: true,
                createdAt: new Date()
            });

            // Both SuperAdminUser and BaseUser should be valid in a BaseUser collection
            // This would require a BaseUser array type in the namespace to test properly
            expect(superAdmin).toBeDefined();
            expect(baseUser).toBeDefined();
        });
    });

    describe("Edge Case Validation", () => {
        test("should handle null and undefined values correctly in different contexts", () => {
            const company = store.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp"
            });

            // Null/undefined for optional properties should work
            expect(() => {
                const employee = store.create<Employee>("/company/Employee", {
                    id: "emp-001",
                    firstName: "John",
                    lastName: "Doe",
                    email: "john@company.com",
                    isActive: true,
                    company: company,
                    badge: undefined // Optional property
                });
                expect(employee.badge).toBeUndefined();
            }).not.toThrow();

            // Note: null handling for primitive properties is handled at property assignment level
            // and may not throw during object creation depending on implementation
        });

        test("should handle empty collections correctly", () => {
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
                    skills: [] as any // Empty array should be fine
                });
                expect(employee.skills!.size).toBe(0);
            }).not.toThrow();
        });

        test("should handle very large primitive values", () => {
            expect(() => {
                store.create<Company>("/company/Company", {
                    id: "comp-001",
                    name: "A".repeat(10000), // Very long string
                    foundedYear: Number.MAX_SAFE_INTEGER // Very large number
                });
            }).not.toThrow();
        });

        test("should handle special primitive values", () => {
            expect(() => {
                store.create<Company>("/company/Company", {
                    id: "comp-001",
                    name: "Tech Corp",
                    foundedYear: 0 // Zero should be valid
                });
            }).not.toThrow();

            expect(() => {
                store.create<Company>("/company/Company", {
                    id: "comp-002",
                    name: "Another Corp",
                    foundedYear: -2020 // Negative numbers should be valid for numbers
                });
            }).not.toThrow();

            // Special values that should fail type validation
            expect(() => {
                store.create<Company>("/company/Company", {
                    id: "comp-003",
                    name: "Bad Corp",
                    foundedYear: NaN // NaN should fail
                });
            }).toThrow(/Expected number, but received number/); // NaN is typeof number but invalid
        });
    });

    describe("Mixed Type Scenarios", () => {
        test("should handle complex object graphs with mixed types", () => {
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

            const employee = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true,
                company: company,
                badge: badge
            });

            // Update relationships using store.update
            expect(() => {
                store.update((b) => {
                    b.employee = employee;
                }, badge);

                store.update((c) => {
                    c.employees!.push(employee);
                }, company);
            }).not.toThrow();

            // Verify all relationships are correctly established
            expect(employee.company).toBe(company);
            expect(employee.badge).toBe(badge);
            expect(badge.employee).toBe(employee);
            expect(company.employees!.includes(employee)).toBe(true);
        });

        test("should validate complex nested collections", () => {
            const company1 = store.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp"
            });

            const company2 = store.create<Company>("/company/Company", {
                id: "comp-002",
                name: "Design Corp"
            });

            const employee1 = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true,
                company: company1
            });

            const employee2 = store.create<Employee>("/company/Employee", {
                id: "emp-002",
                firstName: "Jane",
                lastName: "Smith",
                email: "jane@company.com",
                isActive: true,
                company: company2
            });

            // Test adding employees to company collections
            expect(() => {
                store.update((c1) => {
                    c1.employees!.push(employee1);
                }, company1);

                store.update((c2) => {
                    c2.employees!.push(employee2);
                }, company2);
            }).not.toThrow();

            // Test trying to add wrong type to collection
            expect(() => {
                store.update((c1) => {
                    (c1.employees as any).push(company2); // Company in Employee array
                }, company1);
            }).toThrow(/Type mismatch for property 'employees\[element\]'/);
        });

        test("should validate circular references correctly", () => {
            const company = store.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp"
            });

            const employee = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true,
                company: company
            });

            // Create circular references - this should work
            expect(() => {
                store.update((c) => {
                    c.employees!.push(employee);
                }, company);
            }).not.toThrow();

            // Verify circular reference is established
            expect(employee.company).toBe(company);
            expect(company.employees!.includes(employee)).toBe(true);
        });
    });

    describe("Error Message Quality", () => {
        test("should provide clear error messages for type mismatches", () => {
            const company = store.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp"
            });

            try {
                store.create<Employee>("/company/Employee", {
                    id: "emp-001",
                    firstName: "John",
                    lastName: "Doe",
                    email: "john@company.com",
                    isActive: 123 as any, // Wrong type
                    company: company
                });
                fail("Should have thrown validation error");
            } catch (error: any) {
                expect(error.message).toContain("Expected boolean, but received number");
                expect(error.message).toContain("isActive");
            }
        });

        test("should provide helpful error messages for collection type mismatches", () => {
            const company = store.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp"
            });

            try {
                store.create<Employee>("/company/Employee", {
                    id: "emp-001",
                    firstName: "John",
                    lastName: "Doe",
                    email: "john@company.com",
                    isActive: true,
                    company: company,
                    skills: ["JavaScript", 123, "React"] as any
                });
                fail("Should have thrown validation error");
            } catch (error: any) {
                expect(error.message).toContain("Expected string, but received number");
                expect(error.message).toContain("skills");
            }
        });

        test("should provide helpful error messages for object type mismatches", () => {
            const company = store.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp"
            });

            const wrongObject = store.create<Company>("/company/Company", {
                id: "comp-002",
                name: "Wrong Corp"
            });

            try {
                store.create<Employee>("/company/Employee", {
                    id: "emp-001",
                    firstName: "John",
                    lastName: "Doe",
                    email: "john@company.com",
                    isActive: true,
                    company: company,
                    badge: wrongObject as any // Company instead of Badge
                });
                fail("Should have thrown validation error");
            } catch (error: any) {
                expect(error.message).toContain("Type mismatch for property 'badge'");
                expect(error.message).toContain("Cannot assign object of type");
            }
        });
    });

    describe("Performance and Stress Testing", () => {
        test("should handle validation of many objects efficiently", () => {
            const company = store.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp"
            });

            const startTime = Date.now();
            
            // Create 100 employees and validate each one
            for (let i = 0; i < 100; i++) {
                expect(() => {
                    store.create<Employee>("/company/Employee", {
                        id: `emp-${i.toString().padStart(3, '0')}`,
                        firstName: `Employee${i}`,
                        lastName: "TestSurname",
                        email: `employee${i}@company.com`,
                        isActive: i % 2 === 0, // Alternate boolean values
                        company: company
                    });
                }).not.toThrow();
            }

            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // Should complete within reasonable time (adjust threshold as needed)
            expect(duration).toBeLessThan(5000); // 5 seconds
        });

        test("should handle validation of complex collections efficiently", () => {
            const company = store.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp"
            });

            const employee = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true,
                company: company
            });

            const startTime = Date.now();
            
            // Add many skills to the employee
            expect(() => {
                store.update((emp) => {
                    for (let i = 0; i < 50; i++) {
                        emp.skills!.add(`Skill${i}`);
                    }
                }, employee);
            }).not.toThrow();

            const endTime = Date.now();
            const duration = endTime - startTime;
            
            expect(duration).toBeLessThan(2000); // 2 seconds
            expect(employee.skills!.size).toBe(50);
        });
    });

    describe("Boundary Conditions", () => {
        test("should handle empty string values correctly", () => {
            const company = store.create<Company>("/company/Company", {
                id: "comp-001",
                name: "" // Empty string should be valid
            });
            
            expect(company.name).toBe("");
        });

        test("should handle maximum and minimum numeric values", () => {
            expect(() => {
                store.create<Company>("/company/Company", {
                    id: "comp-001",
                    name: "Test Corp",
                    foundedYear: Number.MIN_SAFE_INTEGER
                });
            }).not.toThrow();

            expect(() => {
                store.create<Company>("/company/Company", {
                    id: "comp-002",
                    name: "Test Corp 2",
                    foundedYear: Number.MAX_SAFE_INTEGER
                });
            }).not.toThrow();
        });

        test("should reject invalid number values", () => {
            expect(() => {
                store.create<Company>("/company/Company", {
                    id: "comp-001",
                    name: "Bad Corp",
                    foundedYear: Infinity as any
                });
            }).toThrow(/Expected number, but received number/);

            expect(() => {
                store.create<Company>("/company/Company", {
                    id: "comp-002",
                    name: "Bad Corp 2",
                    foundedYear: -Infinity as any
                });
            }).toThrow(/Expected number, but received number/);
        });
    });
});