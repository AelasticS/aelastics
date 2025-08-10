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
            let project1 = store.objects.create<Project>("/company/Project", {
                id: "proj-001",
                name: "Project Alpha"
            });

            let project2 = store.objects.create<Project>("/company/Project", {
                id: "proj-002",
                name: "Project Beta"
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
            expect(project1.assignedEmployees).toEqual([]);
            expect(project2.assignedEmployees).toEqual([]);
            expect(employee1.projects).toEqual([]);
            expect(employee2.projects).toEqual([]);

            // Test collection operations (if supported)
            // Note: This might need recipe functions for immutable updates
            // Add employee to project
            project1 = store.objects.update((proj) => {
                proj.assignedEmployees?.push(employee1);
            }, project1);

            // Refresh all related references
            employee1 = store.objects.findByUUID(store.objects.getUUID(employee1))!;
            employee2 = store.objects.findByUUID(store.objects.getUUID(employee2))!;

            // Verify bidirectional update
            expect(project1.assignedEmployees!.includes(employee1)).toBe(true);
            expect(employee1.projects!.includes(project1)).toBe(true);

            // Add employee to multiple projects
            project2 = store.objects.update((proj) => {
                proj.assignedEmployees?.push(employee1);
            }, project2);

            // Refresh all related references
            project1 = store.objects.findByUUID(store.objects.getUUID(project1))!;
            project2 = store.objects.findByUUID(store.objects.getUUID(project2))!;
            employee1 = store.objects.findByUUID(store.objects.getUUID(employee1))!;

            expect(project2.assignedEmployees!.includes(employee1)).toBe(true);
            expect(employee1.projects!.includes(project1)).toBe(true);
            expect(employee1.projects!.includes(project2)).toBe(true);
            expect(employee1.projects!.length).toBe(2);

            // Add multiple employees to project
            project1 = store.objects.update((proj) => {
                proj.assignedEmployees?.push(employee2);
            }, project1);

            // Refresh all related references
            employee1 = store.objects.findByUUID(store.objects.getUUID(employee1))!;
            employee2 = store.objects.findByUUID(store.objects.getUUID(employee2))!;
            project2 = store.objects.findByUUID(store.objects.getUUID(project2))!;

            expect(project1.assignedEmployees!.includes(employee1)).toBe(true);
            expect(project1.assignedEmployees!.includes(employee2)).toBe(true);
            expect(employee2.projects!.includes(project1)).toBe(true);
        });
    });

    describe("Set Collection Operations", () => {
        test("should handle Set operations for skills", () => {
            let employee = store.objects.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            // Test initial Set state
            expect(employee.skills).toBeInstanceOf(Set);
            expect(employee.skills!.size).toBe(0);

            // Test Set operations
            employee = store.objects.update((emp) => {
                emp.skills?.add("JavaScript");
                emp.skills?.add("TypeScript");
                emp.skills?.add("React");
            }, employee);

            expect(employee.skills!.has("JavaScript")).toBe(true);
            expect(employee.skills!.has("TypeScript")).toBe(true);
            expect(employee.skills!.has("React")).toBe(true);
            expect(employee.skills!.size).toBe(3);

            // Test duplicate handling
            employee = store.objects.update((emp) => {
                emp.skills?.add("JavaScript"); // Should not duplicate
            }, employee);

            expect(employee.skills!.size).toBe(3);

            // Test removal
            employee = store.objects.update((emp) => {
                emp.skills?.delete("React");
            }, employee);

            expect(employee.skills!.has("React")).toBe(false);
            expect(employee.skills!.size).toBe(2);
        });
    });

    describe("Collection Proxy Change Tracking", () => {
        test("should track changes in collection operations", () => {
            let company = store.objects.create<Company>("/company/Company", {
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

            // Verify initial state
            expect(company.employees).toEqual([]);

            // Test that collection operations work and update the object
            company = store.objects.update((comp) => {
                comp.employees?.push(employee);
            }, company);

            // Refresh employee reference (bidirectional relationship may have updated it)
            const updatedEmployee = store.objects.findByUUID(store.objects.getUUID(employee))!;

            // Verify the operation was successful
            expect(company.employees).toHaveLength(1);
            expect(company.employees![0]).toBe(updatedEmployee);
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

            // Test disconnect by setting relationships to undefined
            employee = store.objects.update((emp) => {
                emp.company = undefined;
                emp.badge = undefined;
            }, employee);

            // Refresh all related references after update
            company = store.objects.findByUUID(store.objects.getUUID(company))!;
            badge = store.objects.findByUUID(store.objects.getUUID(badge))!;
            
            // Verify all relationships are cleared
            expect(employee.company).toBeUndefined();
            expect(employee.badge).toBeUndefined();
            expect(company.employees!.includes(employee)).toBe(false);
            expect(badge.employee).toBeUndefined();
        });
    });

    describe("Array Inverse Integrity (inverse-managed only)", () => {
        test("should prevent duplicate entries in company.employees when inverse Employee.company already set", () => {
            let company = store.objects.create<Company>("/company/Company", { id: "comp-dup", name: "Dup Corp" });
            let employee = store.objects.create<Employee>("/company/Employee", {
                id: "emp-dup",
                firstName: "Alice",
                lastName: "Dup",
                email: "alice@company.com",
                isActive: true
            });

            // Establish via inverse side (authoritative linkage)
            employee = store.objects.update(e => { e.company = company; }, employee);
            company = store.objects.findByUUID(store.objects.getUUID(company))!;
            employee = store.objects.findByUUID(store.objects.getUUID(employee))!;

            expect(company.employees!.length).toBe(1);
            expect(company.employees![0]).toBe(employee);

            // Push same employee again directly on collection side
            company = store.objects.update(c => { c.employees?.push(employee); }, company);
            company = store.objects.findByUUID(store.objects.getUUID(company))!;

            // Should still be exactly one (treat as ordered set under inverse management)
            expect(company.employees!.length).toBe(1);
        });

        test("setByIndex should throw when attempting to introduce duplicate employee in inverse-managed company.employees", () => {
            let company = store.objects.create<Company>("/company/Company", { id: "comp-set-dup", name: "Dup Corp Set" });
            let e1 = store.objects.create<Employee>("/company/Employee", { id: "emp-set-1", firstName: "E1", lastName: "Dup", email: "e1@company.com", isActive: true });
            let e2 = store.objects.create<Employee>("/company/Employee", { id: "emp-set-2", firstName: "E2", lastName: "Dup", email: "e2@company.com", isActive: true });

            // Link both employees via inverse side
            e1 = store.objects.update(emp => { emp.company = company; }, e1);
            e2 = store.objects.update(emp => { emp.company = company; }, e2);
            company = store.objects.findByUUID(store.objects.getUUID(company))!;
            expect(company.employees!.length).toBe(2);

            // Attempt to set index 1 to the same as index 0 (duplicate) - should throw
            const attempt = () => {
                company = store.objects.update(c => { (c.employees as Employee[])[1] = e1; }, company);
            };
            expect(attempt).toThrow(/duplicate/i);
        });

        test("should prevent duplicate entries in project.assignedEmployees and employee.projects (many-to-many)", () => {
            let project = store.objects.create<Project>("/company/Project", { id: "proj-dup", name: "Dup Project" });
            let employee = store.objects.create<Employee>("/company/Employee", {
                id: "emp-mtm-dup",
                firstName: "Bob",
                lastName: "Multi",
                email: "bob@company.com",
                isActive: true
            });

            // Add employee first time
            project = store.objects.update(p => { p.assignedEmployees?.push(employee); }, project);
            project = store.objects.findByUUID(store.objects.getUUID(project))!;
            employee = store.objects.findByUUID(store.objects.getUUID(employee))!;
            expect(project.assignedEmployees!.length).toBe(1);
            expect(employee.projects!.length).toBe(1);

            // Add same employee again
            project = store.objects.update(p => { p.assignedEmployees?.push(employee); }, project);
            project = store.objects.findByUUID(store.objects.getUUID(project))!;
            employee = store.objects.findByUUID(store.objects.getUUID(employee))!;

            expect(project.assignedEmployees!.length).toBe(1);
            expect(employee.projects!.length).toBe(1);
        });

        test("removal should compact array with no empty slots (company.employees)", () => {
            let company = store.objects.create<Company>("/company/Company", { id: "comp-rem", name: "Rem Corp" });
            let e1 = store.objects.create<Employee>("/company/Employee", { id: "emp-r1", firstName: "R1", lastName: "L", email: "r1@c.com", isActive: true });
            let e2 = store.objects.create<Employee>("/company/Employee", { id: "emp-r2", firstName: "R2", lastName: "L", email: "r2@c.com", isActive: true });

            e1 = store.objects.update(e => { e.company = company; }, e1);
            e2 = store.objects.update(e => { e.company = company; }, e2);
            company = store.objects.findByUUID(store.objects.getUUID(company))!;
            expect(company.employees!.map(e => e.id)).toEqual(["emp-r1", "emp-r2"]);

            // Remove first (set inverse to undefined)
            e1 = store.objects.update(e => { e.company = undefined; }, e1);
            company = store.objects.findByUUID(store.objects.getUUID(company))!;
            e2 = store.objects.findByUUID(store.objects.getUUID(e2))!;

            // Ensure compaction (no undefined, remaining first element is e2, length ==1)
            expect(company.employees!.length).toBe(1);
            expect(company.employees![0]).toBe(e2);
            expect(company.employees!.every(e => !!e)).toBe(true);
        });
    });
});