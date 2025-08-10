import { StoreClass } from '../../store/StoreClass';
import { RegistryService } from '../../registry/RegistryService';
import { RegistryMetadata } from '../../registry/NamespaceMetadata';
import { validMapNamespace } from '../example-namespaces/valid-map-namespace';
import { coreNamespace } from '../example-namespaces/core-namespace';

describe('Map Bidirectional Inverse Relationships - VALUE-based Patterns', () => {
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
            registry.importNamespace(validMapNamespace);
            store = new StoreClass(registry);
        } catch (error) {
            console.log("Setup error:", error);
            throw error;
        }
    });

    describe('Pattern 1: Map<string, Employee> ↔ Employee.department: Department', () => {
        it('should perform bidirectional inverse updates: Map to Entity property', () => {
            // Create test objects
            let department: any = store.create("/validMap/Department", {
                id: 'dept1',
                name: 'Engineering',
                budget: 100000
            });

            let employee: any = store.create("/validMap/Employee", {
                id: 'emp1',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@company.com'
            });


            // Test the Map → Entity inverse update
            department = store.update((d: any) => {
                // setting employee role
                d.employeesByRole.set('manager', employee);
            }, department);

            employee = store.findByUUID(store.getUUID(employee))!;


            // Verify Map side was updated
            expect(department.employeesByRole.size).toBe(1);
            expect(department.employeesByRole.get('manager')).toBe(employee);

            // ✅ THIS SHOULD WORK: Employee.department should be updated to point to department
            expect(employee.department).toBe(department);
        });

        it('should ignore setting identical value for existing key (no duplicate events)', () => {
            let department: any = store.create("/validMap/Department", { id: 'deptEdge1', name: 'EdgeDept1', budget: 10 });
            let employee: any = store.create("/validMap/Employee", { id: 'empEdge1', firstName: 'Ed', lastName: 'Ge', email: 'ed@company.com' });
            department = store.update((d: any) => { d.employeesByRole.set('lead', employee); }, department);
            employee = store.findByUUID(store.getUUID(employee))!;
            expect(department.employeesByRole.size).toBe(1);
            // duplicate set of same value
            const beforeUUID = store.getUUID(employee.department);
            department = store.update((d: any) => { d.employeesByRole.set('lead', employee); }, department);
            employee = store.findByUUID(store.getUUID(employee))!;
            expect(department.employeesByRole.size).toBe(1);
            expect(store.getUUID(employee.department)).toBe(beforeUUID);
        });

        it('delete on missing key returns false and does not affect inverse', () => {
            let department: any = store.create("/validMap/Department", { id: 'deptEdge2', name: 'EdgeDept2', budget: 11 });
            let employee: any = store.create("/validMap/Employee", { id: 'empEdge2', firstName: 'Ed2', lastName: 'Ge', email: 'ed2@company.com' });
            department = store.update((d: any) => { d.employeesByRole.set('dev', employee); }, department);
            employee = store.findByUUID(store.getUUID(employee))!;
            // perform delete inside update context to satisfy write access guard
            let res: boolean = true;
            department = store.update((d: any) => { res = d.employeesByRole.delete('nonexistent'); }, department);
            expect(res).toBe(false);
            department = store.findByUUID(store.getUUID(department))!;
            expect(department.employeesByRole.size).toBe(1);
            employee = store.findByUUID(store.getUUID(employee))!;
            expect(employee.department).toBe(department);
        });

        it('clear on empty map is a no-op', () => {
            let department: any = store.create("/validMap/Department", { id: 'deptEdge3', name: 'EdgeDept3', budget: 12 });
            expect(department.employeesByRole.size).toBe(0);
            department = store.update((d: any) => { d.employeesByRole.clear(); }, department);
            expect(department.employeesByRole.size).toBe(0);
        });

        it('clear removes existing entries and updates inverse side', () => {
            let department: any = store.create("/validMap/Department", { id: 'deptEdge4', name: 'EdgeDept4', budget: 13 });
            let employee: any = store.create("/validMap/Employee", { id: 'empEdge4', firstName: 'Ed4', lastName: 'Ge', email: 'ed4@company.com' });
            department = store.update((d: any) => { d.employeesByRole.set('qa', employee); }, department);
            employee = store.findByUUID(store.getUUID(employee))!;
            expect(employee.department).toBe(department);
            department = store.update((d: any) => { d.employeesByRole.clear(); }, department);
            employee = store.findByUUID(store.getUUID(employee))!;
            expect(department.employeesByRole.size).toBe(0);
            expect(employee.department).toBeUndefined();
        });
    });

    describe('Pattern 2: Map<string, Employee> ↔ Employee.teams: Set<Team>', () => {
        it('should perform bidirectional inverse updates: Map to Entity collection', () => {
            // Create test objects
            let team: any = store.create("/validMap/Team", {
                id: 'team1',
                name: 'Frontend Team',
                project: 'WebApp'
            });

            let employee: any = store.create("/validMap/Employee", {
                id: 'emp1',
                firstName: 'Alice',
                lastName: 'Smith',
                email: 'alice.smith@company.com'
            });


            // Test the Map → Entity Collection inverse update
            team = store.update((t: any) => {
                // setting member skill
                t.membersBySkill.set('react', employee);
            }, team);

            employee = store.findByUUID(store.getUUID(employee))!;


            // Verify Map side was updated
            expect(team.membersBySkill.size).toBe(1);
            expect(team.membersBySkill.get('react')).toBe(employee);

            // ✅ THIS SHOULD WORK: Employee.teams should include the team
            expect(employee.teams.size).toBe(1);
            expect(employee.teams.has(team)).toBe(true);
        });
    });
});
