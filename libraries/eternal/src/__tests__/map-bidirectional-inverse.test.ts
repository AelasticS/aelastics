import { StoreClass } from '../store/StoreClass';
import { RegistryService } from '../registry/RegistryService';
import { RegistryMetadata } from '../registry/NamespaceMetadata';
import { validMapNamespace } from './example-namespaces/valid-map-namespace';
import { coreNamespace } from './example-namespaces/core-namespace';

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

            console.log("Initial state:");
            console.log("department.employeesByRole.size:", department.employeesByRole.size);
            console.log("employee.department:", employee.department);

            // Test the Map → Entity inverse update
            department = store.update((d: any) => {
                console.log("Setting employeesByRole('manager', employee)");
                d.employeesByRole.set('manager', employee);
            }, department);

            employee = store.findByUUID(store.getUUID(employee))!;

            console.log("After department.employeesByRole.set('manager', employee):");
            console.log("department.employeesByRole.size:", department.employeesByRole.size);
            console.log("department.employeesByRole.get('manager'):", department.employeesByRole.get('manager')?.id);
            console.log("employee.department:", employee.department?.id);

            // Verify Map side was updated
            expect(department.employeesByRole.size).toBe(1);
            expect(department.employeesByRole.get('manager')).toBe(employee);

            // ✅ THIS SHOULD WORK: Employee.department should be updated to point to department
            expect(employee.department).toBe(department);
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

            console.log("Initial state:");
            console.log("team.membersBySkill.size:", team.membersBySkill.size);
            console.log("employee.teams.size:", employee.teams.size);

            // Test the Map → Entity Collection inverse update
            team = store.update((t: any) => {
                console.log("Setting membersBySkill('react', employee)");
                t.membersBySkill.set('react', employee);
            }, team);

            employee = store.findByUUID(store.getUUID(employee))!;

            console.log("After team.membersBySkill.set('react', employee):");
            console.log("team.membersBySkill.size:", team.membersBySkill.size);
            console.log("team.membersBySkill.get('react'):", team.membersBySkill.get('react')?.id);
            console.log("employee.teams.size:", employee.teams.size);
            console.log("employee.teams.has(team):", employee.teams.has(team));

            // Verify Map side was updated
            expect(team.membersBySkill.size).toBe(1);
            expect(team.membersBySkill.get('react')).toBe(employee);

            // ✅ THIS SHOULD WORK: Employee.teams should include the team
            expect(employee.teams.size).toBe(1);
            expect(employee.teams.has(team)).toBe(true);
        });
    });
});
