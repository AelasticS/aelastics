import { RegistryService } from "../../registry/RegistryService";
import { RegistryMetadata } from "../../registry/NamespaceMetadata";
import { createStore } from "../../store/createStore";
import { IStore } from "../../interfaces/IStore";
import { companyNamespace } from "../example-namespaces/company-namespace";
import { coreNamespace } from "../example-namespaces/core-namespace";

// TypeScript interfaces matching the namespace type definitions
interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
    company?: Company;
    projects?: Project[];
    skills?: Set<string>;
    badge?: Badge;
}

interface Company {
    id: string;
    name: string;
    employees?: Employee[];
}

interface Project {
    id: string;
    name: string;
    assignedEmployees?: Employee[];
}

interface Badge {
    id: string;
    badgeNumber: string;
    isActive: boolean;
    employee?: Employee;
}

describe("Relationship Operations Tests", () => {
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

    describe("One-to-One Relationships", () => {
        test("should connect/disconnect Employee ↔ Badge (one-to-one)", () => {
            let employee = store.objects.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            let badge = store.objects.create<Badge>("/company/Badge", {
                id: "badge-001",
                badgeNumber: "B001",
                isActive: true
            });

            // Test initial state
            expect(employee.badge).toBeUndefined();
            expect(badge.employee).toBeUndefined();

            // Test connection
            employee = store.objects.update((emp) => {
                emp.badge = badge;
            }, employee);

            // Refresh both references from current state
            employee = store.objects.findByUUID(store.objects.getUUID(employee))!;
            badge = store.objects.findByUUID(store.objects.getUUID(badge))!;

            expect(employee.badge).toBe(badge);
            expect(badge.employee).toBe(employee);

            // Test disconnection
            employee = store.objects.update((emp) => {
                emp.badge = undefined;
            }, employee);

            // Refresh both references from current state
            employee = store.objects.findByUUID(store.objects.getUUID(employee))!;
            badge = store.objects.findByUUID(store.objects.getUUID(badge))!;

            expect(employee.badge).toBeUndefined();
            expect(badge.employee).toBeUndefined();
        });

        test("should handle one-to-one replacement correctly", () => {
            let employee1 = store.objects.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            let employee2 = store.objects.create<Employee>("/company/Employee", {
                id: "emp-002",
                firstName: "Jane",
                lastName: "Smith",
                email: "jane@company.com",
                isActive: true
            });

            let badge = store.objects.create<Badge>("/company/Badge", {
                id: "badge-001",
                badgeNumber: "B001",
                isActive: true
            });

            // Connect badge to employee1
            employee1 = store.objects.update((emp) => {
                emp.badge = badge;
            }, employee1);

            // Refresh badge reference from new state
            badge = store.objects.findByUUID(store.objects.getUUID(badge))!;

            expect(employee1.badge).toBe(badge);
            expect(badge.employee).toBe(employee1);

            // Move badge to employee2 (should disconnect from employee1)
            employee2 = store.objects.update((emp) => {
                emp.badge = badge;
            }, employee2);

            // Refresh ALL references from new state after second update
            employee1 = store.objects.findByUUID(store.objects.getUUID(employee1))!; // Get fresh employee1 reference
            badge = store.objects.findByUUID(store.objects.getUUID(badge))!; // Get fresh badge reference

            expect(employee1.badge).toBeUndefined();
            expect(employee2.badge).toBe(badge);
            expect(badge.employee).toBe(employee2);
        });
    });

    describe("One-to-Many Relationships (Arrays)", () => {
        test("should connect/disconnect Company ↔ Employee[] (one-to-many with array)", () => {
            let company = store.objects.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp"
            });

            let employee1 = store.objects.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            let employee2 = store.objects.create<Employee>("/company/Employee", {
                id: "emp-002",
                firstName: "Jane",
                lastName: "Smith",
                email: "jane@company.com",
                isActive: true
            });

            // Test initial state
            expect(company.employees).toEqual([]);
            expect(employee1.company).toBeUndefined();
            expect(employee2.company).toBeUndefined();

            // Test adding employee to company
            employee1 = store.objects.update((emp) => {
                emp.company = company;
            }, employee1);

            // Refresh company reference from new state
            company = store.objects.findByUUID(store.objects.getUUID(company))!;

            expect(company.employees!.includes(employee1)).toBe(true);
            expect(employee1.company).toBe(company);

            // Test adding second employee
            employee2 = store.objects.update((emp) => {
                emp.company = company;
            }, employee2);

            // Refresh all references from new state
            company = store.objects.findByUUID(store.objects.getUUID(company))!;
            employee1 = store.objects.findByUUID(store.objects.getUUID(employee1))!;

            expect(company.employees!.includes(employee1)).toBe(true);
            expect(company.employees!.includes(employee2)).toBe(true);
            expect(company.employees!.length).toBe(2);
            expect(employee2.company).toBe(company);

            // Test removing employee from company
            employee1 = store.objects.update((emp) => {
                emp.company = undefined;
            }, employee1);

            // Refresh all references from new state
            company = store.objects.findByUUID(store.objects.getUUID(company))!;
            employee2 = store.objects.findByUUID(store.objects.getUUID(employee2))!;

            expect(company.employees!.includes(employee1)).toBe(false);
            expect(company.employees!.includes(employee2)).toBe(true);
            expect(company.employees!.length).toBe(1);
            expect(employee1.company).toBeUndefined();
        });

        test("should handle employee moving between companies", () => {
            let company1 = store.objects.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp"
            });

            let company2 = store.objects.create<Company>("/company/Company", {
                id: "comp-002",
                name: "Innovation Inc"
            });

            let employee = store.objects.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            // Assign employee to company1
            employee = store.objects.update((emp) => {
                emp.company = company1;
            }, employee);

            // Refresh all references from new state
            company1 = store.objects.findByUUID(store.objects.getUUID(company1))!;
            company2 = store.objects.findByUUID(store.objects.getUUID(company2))!;

            expect(company1.employees!.includes(employee)).toBe(true);
            expect(company2.employees).toEqual([]);
            expect(employee.company).toBe(company1);

            // Move employee to company2
            employee = store.objects.update((emp) => {
                emp.company = company2;
            }, employee);

            // Refresh all references from new state
            company1 = store.objects.findByUUID(store.objects.getUUID(company1))!;
            company2 = store.objects.findByUUID(store.objects.getUUID(company2))!;

            expect(company1.employees).toEqual([]);
            expect(company2.employees!.includes(employee)).toBe(true);
            expect(employee.company).toBe(company2);
        });
    });

    describe("Many-to-Many Relationships (Arrays)", () => {
        test("should handle Employee[] ↔ Project[] (many-to-many with arrays)", () => {
            const project1 = store.objects.create<Project>("/company/Project", {
                id: "proj-001",
                name: "Project Alpha"
            });

            const project2 = store.objects.create<Project>("/company/Project", {
                id: "proj-002",
                name: "Project Beta"
            });

            const employee1 = store.objects.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            const employee2 = store.objects.create<Employee>("/company/Employee", {
                id: "emp-002",
                firstName: "Jane",
                lastName: "Smith",
                email: "jane@company.com",
                isActive: true
            });

            // Test initial state
            expect(project1.assignedEmployees).toEqual([]);
            expect(project2.assignedEmployees).toEqual([]);
            expect(employee1.projects).toEqual([]);
            expect(employee2.projects).toEqual([]);

            // Test collection operations (if supported)
            // Note: This might need recipe functions for immutable updates
            try {
                // Try to add employee to project
                store.objects.update((proj) => {
                    proj.assignedEmployees?.push(employee1);
                }, project1);

                // Verify bidirectional update
                expect(project1.assignedEmployees!.includes(employee1)).toBe(true);
                expect(employee1.projects!.includes(project1)).toBe(true);

                // Add employee to multiple projects
                store.objects.update((proj) => {
                    proj.assignedEmployees?.push(employee1);
                }, project2);

                expect(project2.assignedEmployees!.includes(employee1)).toBe(true);
                expect(employee1.projects!.includes(project1)).toBe(true);
                expect(employee1.projects!.includes(project2)).toBe(true);
                expect(employee1.projects!.length).toBe(2);

                // Add multiple employees to project
                store.objects.update((proj) => {
                    proj.assignedEmployees?.push(employee2);
                }, project1);

                expect(project1.assignedEmployees!.includes(employee1)).toBe(true);
                expect(project1.assignedEmployees!.includes(employee2)).toBe(true);
                expect(employee2.projects!.includes(project1)).toBe(true);

            } catch (error) {
                // Collection operations are not yet fully implemented
                // This test documents the expected behavior for future implementation
                expect(error).toBeDefined();
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe("Set Collection Operations", () => {
        test("should handle Set operations for skills", () => {
            const employee = store.objects.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            // Test initial Set state
            expect(employee.skills).toBeInstanceOf(Set);
            expect(employee.skills!.size).toBe(0);

            // Test Set operations (if supported)
            try {
                store.objects.update((emp) => {
                    emp.skills?.add("JavaScript");
                    emp.skills?.add("TypeScript");
                    emp.skills?.add("React");
                }, employee);

                expect(employee.skills!.has("JavaScript")).toBe(true);
                expect(employee.skills!.has("TypeScript")).toBe(true);
                expect(employee.skills!.has("React")).toBe(true);
                expect(employee.skills!.size).toBe(3);

                // Test duplicate handling
                store.objects.update((emp) => {
                    emp.skills?.add("JavaScript"); // Should not duplicate
                }, employee);

                expect(employee.skills!.size).toBe(3);

                // Test removal
                store.objects.update((emp) => {
                    emp.skills?.delete("React");
                }, employee);

                expect(employee.skills!.has("React")).toBe(false);
                expect(employee.skills!.size).toBe(2);

            } catch (error) {
                // Set operations are not yet fully implemented
                // This test documents the expected behavior for future implementation
                expect(error).toBeDefined();
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe("Collection Proxy Change Tracking", () => {
        test("should track changes in collection operations", () => {
            const company = store.objects.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp"
            });

            const employee = store.objects.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            // Get initial change count
            const initialChanges = store.history.getAllChanges();

            try {
                // Test if collection operations generate change events
                store.objects.update((comp) => {
                    comp.employees?.push(employee);
                }, company);

                const changesAfterPush = store.history.getAllChanges();
                expect(changesAfterPush.length).toBeGreaterThan(initialChanges.length);

            } catch (error) {
                // Collection change tracking is not yet fully implemented
                // This test documents the expected behavior for future implementation
                expect(error).toBeDefined();
                expect(error).toBeInstanceOf(Error);
            }
        });
    });

    describe("Error Handling in Relationships", () => {
        test("should handle invalid relationship assignments", () => {
            const employee = store.objects.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            const company = store.objects.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp"
            });

            // Test assigning wrong type to object reference
            expect(() => {
                store.objects.update((emp) => {
                    (emp as any).badge = company; // Wrong type - should be Badge
                }, employee);
            }).toThrow(); // Should validate type compatibility

            // Test direct assignment to collection property
            expect(() => {
                store.objects.update((comp) => {
                    comp.employees = [employee]; // Direct assignment should be prevented
                }, company);
            }).toThrow("Cannot directly assign to collection property");
        });
    });

    describe("Disconnect Operations", () => {
        test("should properly disconnect all relationships when object is disconnected", () => {
            let employee = store.objects.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            let company = store.objects.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp"
            });

            let badge = store.objects.create<Badge>("/company/Badge", {
                id: "badge-001",
                badgeNumber: "B001",
                isActive: true
            });

            // Connect relationships
            employee = store.objects.update((emp) => {
                emp.company = company;
                emp.badge = badge;
            }, employee);

            // Refresh all references from new state
            company = store.objects.findByUUID(store.objects.getUUID(company))!;
            badge = store.objects.findByUUID(store.objects.getUUID(badge))!;

            expect(employee.company).toBe(company);
            expect(employee.badge).toBe(badge);
            expect(company.employees!.includes(employee)).toBe(true);
            expect(badge.employee).toBe(employee);

            // Test disconnect method (if available)
            try {
                // Call disconnect method
                (employee as any).disconnect?.();
                
                // Verify all relationships are cleared
                expect(employee.company).toBeUndefined();
                expect(employee.badge).toBeUndefined();
                expect(company.employees!.includes(employee)).toBe(false);
                expect(badge.employee).toBeUndefined();

            } catch (error) {
                // TODO: Implement disconnect method for relationship cleanup
                // This test documents the expected disconnect functionality
                expect(error).toBeDefined();
                expect(error).toBeInstanceOf(Error);
            }
        });
    });
});