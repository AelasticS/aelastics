import { RegistryService } from "../../registry/RegistryService";
import { RegistryMetadata } from "../../registry/NamespaceMetadata";
import { createStore } from "../../store/createStore";
import { companyNamespace } from "../example-namespaces/company-namespace";
import { coreNamespace } from "../example-namespaces/core-namespace";

// Local interfaces (mirroring namespace types for compile-time clarity)
interface Employee { id: string; firstName: string; lastName: string; email: string; isActive: boolean; company?: Company; projects?: Project[]; }
interface Company { id: string; name: string; employees?: Employee[]; }
interface Project { id: string; name: string; assignedEmployees?: Employee[]; }

function makeStore() {
  const registryMetadata: RegistryMetadata = { namespaces: new Map(), name: "test-registry", version: "1.0.0" };
  const registry = new RegistryService(registryMetadata);
  registry.importNamespace(coreNamespace);
  registry.importNamespace(companyNamespace);
  return createStore(registry);
}

// Focused suite: ordered-set semantics & inverse integrity for bidirectional ARRAY relationships only
// (Company.employees ↔ Employee.company) and (Project.assignedEmployees ↔ Employee.projects)

describe('Bidirectional Array Inverse Integrity', () => {
  test('company.employees prevents duplicate employees (push) and maintains inverse', () => {
    const store = makeStore();
    let company = store.objects.create<Company>("/company/Company", { id: "comp-a", name: "Acme" });
    let e1 = store.objects.create<Employee>("/company/Employee", { id: "emp-a1", firstName: "Alice", lastName: "A", email: "alice@a.com", isActive: true });

    // Link via inverse (employee.company)
    e1 = store.objects.update(emp => { emp.company = company; }, e1);
    company = store.objects.findByUUID(store.objects.getUUID(company))!;
    e1 = store.objects.findByUUID(store.objects.getUUID(e1))!;
    expect(company.employees!.length).toBe(1);

    // Attempt duplicate push
    company = store.objects.update(c => { c.employees?.push(e1); }, company);
    company = store.objects.findByUUID(store.objects.getUUID(company))!;
    expect(company.employees!.length).toBe(1);
    expect(e1.company).toBe(company);
  });

  test('project.assignedEmployees prevents duplicate employees (many-to-many)', () => {
    const store = makeStore();
    let project = store.objects.create<Project>("/company/Project", { id: "proj-a", name: "Apollo" });
    let e1 = store.objects.create<Employee>("/company/Employee", { id: "emp-pa1", firstName: "Pat", lastName: "X", email: "pat@x.com", isActive: true });

    project = store.objects.update(p => { p.assignedEmployees?.push(e1); }, project);
    project = store.objects.findByUUID(store.objects.getUUID(project))!;
    e1 = store.objects.findByUUID(store.objects.getUUID(e1))!;
    expect(project.assignedEmployees!.length).toBe(1);
    expect(e1.projects!.length).toBe(1);

    // Duplicate attempt
    project = store.objects.update(p => { p.assignedEmployees?.push(e1); }, project);
    project = store.objects.findByUUID(store.objects.getUUID(project))!;
    e1 = store.objects.findByUUID(store.objects.getUUID(e1))!;
    expect(project.assignedEmployees!.length).toBe(1);
    expect(e1.projects!.length).toBe(1);
  });

  test('removing from company.employees compacts and clears inverse', () => {
    const store = makeStore();
    let company = store.objects.create<Company>("/company/Company", { id: "comp-r", name: "Rem" });
    let e1 = store.objects.create<Employee>("/company/Employee", { id: "emp-r1", firstName: "R1", lastName: "R", email: "r1@r.com", isActive: true });
    let e2 = store.objects.create<Employee>("/company/Employee", { id: "emp-r2", firstName: "R2", lastName: "R", email: "r2@r.com", isActive: true });

    e1 = store.objects.update(e => { e.company = company; }, e1);
    e2 = store.objects.update(e => { e.company = company; }, e2);
    company = store.objects.findByUUID(store.objects.getUUID(company))!;
    expect(company.employees!.length).toBe(2);

    // Remove first
    e1 = store.objects.update(e => { e.company = undefined; }, e1);
    company = store.objects.findByUUID(store.objects.getUUID(company))!;
    e2 = store.objects.findByUUID(store.objects.getUUID(e2))!;
    expect(company.employees!.length).toBe(1);
    expect(company.employees![0]).toBe(e2);
    expect(e1.company).toBeUndefined();
  });

  test('index assignment (setByIndex) duplicate introduction throws', () => {
    const store = makeStore();
    let company = store.objects.create<Company>("/company/Company", { id: "comp-idx", name: "Idx" });
    let e1 = store.objects.create<Employee>("/company/Employee", { id: "emp-i1", firstName: "I1", lastName: "I", email: "i1@i.com", isActive: true });
    let e2 = store.objects.create<Employee>("/company/Employee", { id: "emp-i2", firstName: "I2", lastName: "I", email: "i2@i.com", isActive: true });
    e1 = store.objects.update(e => { e.company = company; }, e1);
    e2 = store.objects.update(e => { e.company = company; }, e2);
    company = store.objects.findByUUID(store.objects.getUUID(company))!;
    expect(company.employees!.length).toBe(2);
    const attempt = () => {
      company = store.objects.update(c => { (c.employees as Employee[])[1] = e1; }, company);
    };
    expect(attempt).toThrow(/duplicate/i);
  });
});
