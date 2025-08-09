import { StoreClass } from '../../store/StoreClass';
import { RegistryService } from '../../registry/RegistryService';
import { RegistryMetadata } from '../../registry/NamespaceMetadata';
import { companyNamespace } from '../example-namespaces/company-namespace';
import { coreNamespace } from '../example-namespaces/core-namespace';

describe('Set Bidirectional Inverse Relationships', () => {
    let registry: RegistryService;
    let store: StoreClass;

    beforeEach(() => {
        const registryMetadata: RegistryMetadata = {
            namespaces: new Map(),
            name: "test-registry",
            version: "1.0.0"
        };
        registry = new RegistryService(registryMetadata);
        
        try {
            // Import required namespaces in dependency order
            registry.importNamespace(coreNamespace);
            registry.importNamespace(companyNamespace);
            store = new StoreClass(registry);
        } catch (error) {
            console.log("Setup error:", error);
            throw error;
        }
    });

    describe('Pattern: Department.employees: Set<Employee> ↔ Employee.departments: Set<Department>', () => {
        it('should perform bidirectional inverse updates: Set.add() updates both sides', () => {
            // Create test objects
            let department: any = store.create("/company/Department", {
                id: 'dept1',
                name: 'Engineering'
            });

            let employee: any = store.create("/company/Employee", {
                id: 'emp1',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@company.com',
                isActive: true
            });

            // Verify initial state
            console.log("Initial state:");
            console.log("department.employees.size:", department.employees.size);
            console.log("employee.departments.size:", employee.departments.size);

            // Test Set bidirectional inverse update: Department.employees.add(employee)
            console.log("Adding employee to department.employees");
            department = store.update((d: any) => {
                d.employees.add(employee);
            }, department);

            // Refresh employee reference after update
            employee = store.findByUUID(store.getUUID(employee))!;

            console.log("After department.employees.add(employee):");
            console.log("department.employees.size:", department.employees.size);
            console.log("department.employees.has(employee):", department.employees.has(employee));
            console.log("employee.departments.size:", employee.departments.size);
            console.log("employee.departments.has(department):", employee.departments.has(department));

            // Verify both sides were updated correctly
            expect(department.employees.size).toBe(1);
            expect(department.employees.has(employee)).toBe(true);
            
            // ✅ THIS SHOULD WORK: Employee.departments should include the department 
            expect(employee.departments.size).toBe(1);
            expect(employee.departments.has(department)).toBe(true);
        });

        it('should perform bidirectional inverse updates: Set.delete() updates both sides', () => {
            // Create test objects
            let department: any = store.create("/company/Department", {
                id: 'dept2',
                name: 'Marketing'
            });

            let employee: any = store.create("/company/Employee", {
                id: 'emp2',
                firstName: 'Alice',
                lastName: 'Smith',
                email: 'alice.smith@company.com',
                isActive: true
            });

            // First add the employee to department
            department = store.update((d: any) => {
                d.employees.add(employee);
            }, department);
            employee = store.findByUUID(store.getUUID(employee))!;

            // Verify they are connected
            expect(department.employees.has(employee)).toBe(true);
            expect(employee.departments.has(department)).toBe(true);

            console.log("Before removal:");
            console.log("department.employees.size:", department.employees.size);
            console.log("employee.departments.size:", employee.departments.size);

            // Test Set bidirectional inverse delete: Department.employees.delete(employee)
            console.log("Removing employee from department.employees");
            department = store.update((d: any) => {
                d.employees.delete(employee);
            }, department);

            // Refresh employee reference after update
            employee = store.findByUUID(store.getUUID(employee))!;

            console.log("After department.employees.delete(employee):");
            console.log("department.employees.size:", department.employees.size);
            console.log("department.employees.has(employee):", department.employees.has(employee));
            console.log("employee.departments.size:", employee.departments.size);
            console.log("employee.departments.has(department):", employee.departments.has(department));

            // Verify both sides were updated correctly
            expect(department.employees.size).toBe(0);
            expect(department.employees.has(employee)).toBe(false);
            
            // ✅ THIS SHOULD WORK: Employee.departments should no longer include the department
            expect(employee.departments.size).toBe(0);
            expect(employee.departments.has(department)).toBe(false);
        });

        it('should handle reverse direction: Employee.departments.add(department) updates both sides', () => {
            // Create test objects
            let department: any = store.create("/company/Department", {
                id: 'dept3',
                name: 'HR'
            });

            let employee: any = store.create("/company/Employee", {
                id: 'emp3',
                firstName: 'Bob',
                lastName: 'Wilson',
                email: 'bob.wilson@company.com',
                isActive: true
            });

            // Test reverse direction: Employee.departments.add(department)
            console.log("Adding department to employee.departments");
            employee = store.update((e: any) => {
                e.departments.add(department);
            }, employee);

            // Refresh department reference after update
            department = store.findByUUID(store.getUUID(department))!;

            console.log("After employee.departments.add(department):");
            console.log("employee.departments.size:", employee.departments.size);
            console.log("employee.departments.has(department):", employee.departments.has(department));
            console.log("department.employees.size:", department.employees.size);
            console.log("department.employees.has(employee):", department.employees.has(employee));

            // Verify both sides were updated correctly
            expect(employee.departments.size).toBe(1);
            expect(employee.departments.has(department)).toBe(true);
            
            // ✅ THIS SHOULD WORK: Department.employees should include the employee
            expect(department.employees.size).toBe(1);
            expect(department.employees.has(employee)).toBe(true);
        });

        it('should handle many-to-many relationships: multiple employees and departments', () => {
            // Create multiple objects
            let engineering: any = store.create("/company/Department", {
                id: 'eng',
                name: 'Engineering'
            });

            let marketing: any = store.create("/company/Department", {
                id: 'mkt',
                name: 'Marketing'
            });

            let alice: any = store.create("/company/Employee", {
                id: 'alice',
                firstName: 'Alice',
                lastName: 'Johnson',
                email: 'alice@company.com',
                isActive: true
            });

            let bob: any = store.create("/company/Employee", {
                id: 'bob',
                firstName: 'Bob',
                lastName: 'Davis',
                email: 'bob@company.com',
                isActive: true
            });

            // Alice works in both Engineering and Marketing
            engineering = store.update((d: any) => {
                d.employees.add(alice);
            }, engineering);
            alice = store.findByUUID(store.getUUID(alice))!;

            marketing = store.update((d: any) => {
                d.employees.add(alice);
            }, marketing);
            alice = store.findByUUID(store.getUUID(alice))!;

            // Bob only works in Engineering
            engineering = store.update((d: any) => {
                d.employees.add(bob);
            }, engineering);
            
            // Refresh all references
            engineering = store.findByUUID(store.getUUID(engineering))!;
            marketing = store.findByUUID(store.getUUID(marketing))!;
            alice = store.findByUUID(store.getUUID(alice))!;
            bob = store.findByUUID(store.getUUID(bob))!;

            console.log("Final state:");
            console.log("Engineering employees:", engineering.employees.size);
            console.log("Marketing employees:", marketing.employees.size);
            console.log("Alice departments:", alice.departments.size);
            console.log("Bob departments:", bob.departments.size);

            // Verify complex many-to-many relationships
            expect(engineering.employees.size).toBe(2); // Alice and Bob
            expect(marketing.employees.size).toBe(1);   // Only Alice
            expect(alice.departments.size).toBe(2);     // Engineering and Marketing
            expect(bob.departments.size).toBe(1);       // Only Engineering

            expect(engineering.employees.has(alice)).toBe(true);
            expect(engineering.employees.has(bob)).toBe(true);
            expect(marketing.employees.has(alice)).toBe(true);
            expect(marketing.employees.has(bob)).toBe(false);

            expect(alice.departments.has(engineering)).toBe(true);
            expect(alice.departments.has(marketing)).toBe(true);
            expect(bob.departments.has(engineering)).toBe(true);
            expect(bob.departments.has(marketing)).toBe(false);
        });
    });
});
