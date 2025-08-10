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

            // Test Set bidirectional inverse update: Department.employees.add(employee)
            department = store.update((d: any) => {
                d.employees.add(employee);
            }, department);

            // Refresh employee reference after update
            employee = store.findByUUID(store.getUUID(employee))!;

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

            // Test Set bidirectional inverse delete: Department.employees.delete(employee)
            department = store.update((d: any) => {
                d.employees.delete(employee);
            }, department);

            // Refresh employee reference after update
            employee = store.findByUUID(store.getUUID(employee))!;

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
            employee = store.update((e: any) => {
                e.departments.add(department);
            }, employee);

            // Refresh department reference after update
            department = store.findByUUID(store.getUUID(department))!;

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

describe('Set Bidirectional Inverse Relationships - Edge Cases', () => {
    let registry: RegistryService;
    let store: StoreClass;

    beforeEach(() => {
        const registryMetadata: RegistryMetadata = {
            namespaces: new Map(),
            name: "test-registry",
            version: "1.0.0"
        };
        registry = new RegistryService(registryMetadata);
        registry.importNamespace(coreNamespace);
        registry.importNamespace(companyNamespace);
        store = new StoreClass(registry);
    });

    it('should ignore duplicate add on Set (no duplicate inverse linkage)', () => {
        let department: any = store.create("/company/Department", { id: 'deptD', name: 'Design' });
        let employee: any = store.create("/company/Employee", { id: 'empD', firstName: 'Dan', lastName: 'Lee', email: 'dan@company.com', isActive: true });

        // First add
        department = store.update((d: any) => { d.employees.add(employee); }, department);
        employee = store.findByUUID(store.getUUID(employee))!;
        expect(department.employees.size).toBe(1);
        expect(employee.departments.size).toBe(1);

        // Duplicate add (should be ignored)
        department = store.update((d: any) => { d.employees.add(employee); }, department);
        employee = store.findByUUID(store.getUUID(employee))!;
        expect(department.employees.size).toBe(1);
        expect(employee.departments.size).toBe(1);
    });

    it('should ignore delete of non-existent element (no inverse side change)', () => {
        let department: any = store.create("/company/Department", { id: 'deptE', name: 'Editorial' });
        let employee1: any = store.create("/company/Employee", { id: 'empE1', firstName: 'Eve', lastName: 'Cole', email: 'eve@company.com', isActive: true });
        let employee2: any = store.create("/company/Employee", { id: 'empE2', firstName: 'Eli', lastName: 'Roe', email: 'eli@company.com', isActive: true });

        // Add only employee1
        department = store.update((d: any) => { d.employees.add(employee1); }, department);
        employee1 = store.findByUUID(store.getUUID(employee1))!;
        employee2 = store.findByUUID(store.getUUID(employee2))!;
        expect(department.employees.size).toBe(1);
        expect(department.employees.has(employee1)).toBe(true);

        // Attempt delete of employee2 (not present)
        department = store.update((d: any) => { d.employees.delete(employee2); }, department);
        employee1 = store.findByUUID(store.getUUID(employee1))!;
        employee2 = store.findByUUID(store.getUUID(employee2))!;
        expect(department.employees.size).toBe(1);
        expect(department.employees.has(employee1)).toBe(true);
        expect(department.employees.has(employee2)).toBe(false);
        expect(employee1.departments.size).toBe(1);
        expect(employee2.departments.size).toBe(0);
    });

    it('should no-op clear on empty Set', () => {
        let department: any = store.create("/company/Department", { id: 'deptF', name: 'Finance' });
        expect(department.employees.size).toBe(0);
        department = store.update((d: any) => { d.employees.clear(); }, department);
        expect(department.employees.size).toBe(0);
    });

    it('should clear non-empty Set and update inverses', () => {
        let department: any = store.create("/company/Department", { id: 'deptG', name: 'Growth' });
        let emp1: any = store.create("/company/Employee", { id: 'empG1', firstName: 'Gina', lastName: 'Miles', email: 'gina@company.com', isActive: true });
        let emp2: any = store.create("/company/Employee", { id: 'empG2', firstName: 'Gus', lastName: 'Nash', email: 'gus@company.com', isActive: true });

        department = store.update((d: any) => { d.employees.add(emp1); d.employees.add(emp2); }, department);
        emp1 = store.findByUUID(store.getUUID(emp1))!;
        emp2 = store.findByUUID(store.getUUID(emp2))!;
        expect(department.employees.size).toBe(2);
        expect(emp1.departments.size).toBe(1);
        expect(emp2.departments.size).toBe(1);

        department = store.update((d: any) => { d.employees.clear(); }, department);
        emp1 = store.findByUUID(store.getUUID(emp1))!;
        emp2 = store.findByUUID(store.getUUID(emp2))!;
        expect(department.employees.size).toBe(0);
        expect(emp1.departments.size).toBe(0);
        expect(emp2.departments.size).toBe(0);
    });
});
