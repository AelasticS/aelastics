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

  test('unshift filters duplicate at insertion start', () => {
    const store = makeStore();
    let company = store.objects.create<Company>("/company/Company", { id: "comp-u", name: "Unshift" });
    let e1 = store.objects.create<Employee>("/company/Employee", { id: "emp-u1", firstName: "U1", lastName: "U", email: "u1@u.com", isActive: true });
    // establish via inverse
    e1 = store.objects.update(e => { e.company = company; }, e1);
    company = store.objects.findByUUID(store.objects.getUUID(company))!;
    expect(company.employees!.map(e => e.id)).toEqual(["emp-u1"]);
    // unshift duplicate
    company = store.objects.update(c => { c.employees?.unshift(e1); }, company);
    company = store.objects.findByUUID(store.objects.getUUID(company))!;
    expect(company.employees!.length).toBe(1);
  });

  test('splice insertion filters duplicates and inserts only new unique employees', () => {
    const store = makeStore();
    let company = store.objects.create<Company>("/company/Company", { id: "comp-sp", name: "Splice" });
    let e1 = store.objects.create<Employee>("/company/Employee", { id: "emp-sp1", firstName: "S1", lastName: "S", email: "s1@s.com", isActive: true });
    let e2 = store.objects.create<Employee>("/company/Employee", { id: "emp-sp2", firstName: "S2", lastName: "S", email: "s2@s.com", isActive: true });
    let e3 = store.objects.create<Employee>("/company/Employee", { id: "emp-sp3", firstName: "S3", lastName: "S", email: "s3@s.com", isActive: true });
    // link e1, e2
    e1 = store.objects.update(e => { e.company = company; }, e1);
    e2 = store.objects.update(e => { e.company = company; }, e2);
    company = store.objects.findByUUID(store.objects.getUUID(company))!;
    expect(company.employees!.map(e => e.id)).toEqual(["emp-sp1", "emp-sp2"]);
    // splice insert attempt: duplicate e1 plus new e3
    company = store.objects.update(c => { c.employees?.splice(1, 0, e1, e3); }, company);
    company = store.objects.findByUUID(store.objects.getUUID(company))!;
    expect(company.employees!.map(e => e.id)).toEqual(["emp-sp1", "emp-sp3", "emp-sp2"]);
  });

  test('project-side removal updates employee.projects (many-to-many inverse cleanup)', () => {
    const store = makeStore();
    let project = store.objects.create<Project>("/company/Project", { id: "proj-rm", name: "Removal" });
    let e1 = store.objects.create<Employee>("/company/Employee", { id: "emp-pr1", firstName: "PR1", lastName: "P", email: "pr1@p.com", isActive: true });
    let e2 = store.objects.create<Employee>("/company/Employee", { id: "emp-pr2", firstName: "PR2", lastName: "P", email: "pr2@p.com", isActive: true });
    project = store.objects.update(p => { p.assignedEmployees?.push(e1, e2); }, project);
    project = store.objects.findByUUID(store.objects.getUUID(project))!;
    e1 = store.objects.findByUUID(store.objects.getUUID(e1))!;
    e2 = store.objects.findByUUID(store.objects.getUUID(e2))!;
    expect(e1.projects!.length).toBe(1);
    expect(e2.projects!.length).toBe(1);
    // remove e1 from project side via splice
    project = store.objects.update(p => { p.assignedEmployees?.splice(0,1); }, project);
    project = store.objects.findByUUID(store.objects.getUUID(project))!;
    e1 = store.objects.findByUUID(store.objects.getUUID(e1))!;
    e2 = store.objects.findByUUID(store.objects.getUUID(e2))!;
    expect(project.assignedEmployees!.map(e => e.id)).toEqual(["emp-pr2"]);
    expect(e1.projects!.length).toBe(0);
    expect(e2.projects!.length).toBe(1);
  });

  test('index assignment replacing same element (no-op) does not throw', () => {
    const store = makeStore();
    let company = store.objects.create<Company>("/company/Company", { id: "comp-noop", name: "Noop" });
    let e1 = store.objects.create<Employee>("/company/Employee", { id: "emp-n1", firstName: "N1", lastName: "N", email: "n1@n.com", isActive: true });
    let e2 = store.objects.create<Employee>("/company/Employee", { id: "emp-n2", firstName: "N2", lastName: "N", email: "n2@n.com", isActive: true });
    e1 = store.objects.update(e => { e.company = company; }, e1);
    e2 = store.objects.update(e => { e.company = company; }, e2);
    company = store.objects.findByUUID(store.objects.getUUID(company))!;
    expect(() => { company = store.objects.update(c => { (c.employees as Employee[])[1] = c.employees![1]; }, company); }).not.toThrow();
  });

  test('pop removes last employee and clears inverse', () => {
    const store = makeStore();
    let company = store.objects.create<Company>("/company/Company", { id: "comp-pop", name: "Pop" });
    let e1 = store.objects.create<Employee>("/company/Employee", { id: "emp-pop1", firstName: "P1", lastName: "P", email: "p1@p.com", isActive: true });
    let e2 = store.objects.create<Employee>("/company/Employee", { id: "emp-pop2", firstName: "P2", lastName: "P", email: "p2@p.com", isActive: true });
    e1 = store.objects.update(e => { e.company = company; }, e1);
    e2 = store.objects.update(e => { e.company = company; }, e2);
    company = store.objects.findByUUID(store.objects.getUUID(company))!;
    expect(company.employees!.length).toBe(2);
    // pop via array side
    company = store.objects.update(c => { (c.employees as any).pop(); }, company);
    company = store.objects.findByUUID(store.objects.getUUID(company))!;
    e2 = store.objects.findByUUID(store.objects.getUUID(e2))!;
    expect(company.employees!.length).toBe(1);
    expect(company.employees![0].id).toBe('emp-pop1');
    expect(e2.company).toBeUndefined();
  });

  test('shift removes first employee and clears inverse', () => {
    const store = makeStore();
    let company = store.objects.create<Company>("/company/Company", { id: "comp-shift", name: "Shift" });
    let e1 = store.objects.create<Employee>("/company/Employee", { id: "emp-shift1", firstName: "S1", lastName: "S", email: "s1@s.com", isActive: true });
    let e2 = store.objects.create<Employee>("/company/Employee", { id: "emp-shift2", firstName: "S2", lastName: "S", email: "s2@s.com", isActive: true });
    e1 = store.objects.update(e => { e.company = company; }, e1);
    e2 = store.objects.update(e => { e.company = company; }, e2);
    company = store.objects.findByUUID(store.objects.getUUID(company))!;
    expect(company.employees!.map(e => e.id)).toEqual(['emp-shift1','emp-shift2']);
    company = store.objects.update(c => { (c.employees as any).shift(); }, company);
    company = store.objects.findByUUID(store.objects.getUUID(company))!;
    e1 = store.objects.findByUUID(store.objects.getUUID(e1))!;
    expect(company.employees!.length).toBe(1);
    expect(company.employees![0].id).toBe('emp-shift2');
    expect(e1.company).toBeUndefined();
  });

  test('splice removal removes middle employee and updates inverse', () => {
    const store = makeStore();
    let company = store.objects.create<Company>("/company/Company", { id: "comp-del", name: "Delete" });
    let e1 = store.objects.create<Employee>("/company/Employee", { id: "emp-del1", firstName: "D1", lastName: "D", email: "d1@d.com", isActive: true });
    let e2 = store.objects.create<Employee>("/company/Employee", { id: "emp-del2", firstName: "D2", lastName: "D", email: "d2@d.com", isActive: true });
    let e3 = store.objects.create<Employee>("/company/Employee", { id: "emp-del3", firstName: "D3", lastName: "D", email: "d3@d.com", isActive: true });
    e1 = store.objects.update(e => { e.company = company; }, e1);
    e2 = store.objects.update(e => { e.company = company; }, e2);
    e3 = store.objects.update(e => { e.company = company; }, e3);
    company = store.objects.findByUUID(store.objects.getUUID(company))!;
    expect(company.employees!.map(e => e.id)).toEqual(['emp-del1','emp-del2','emp-del3']);
  company = store.objects.update(c => { (c.employees as any).splice(1,1); }, company); // remove e2 via splice
    company = store.objects.findByUUID(store.objects.getUUID(company))!;
    e2 = store.objects.findByUUID(store.objects.getUUID(e2))!;
    expect(company.employees!.map(e => e.id)).toEqual(['emp-del1','emp-del3']);
    expect(e2.company).toBeUndefined();
  });

  test('reverse reorders employees', () => {
    const store = makeStore();
    let company = store.objects.create<Company>("/company/Company", { id: "comp-rev", name: "Reverse" });
    let e1 = store.objects.create<Employee>("/company/Employee", { id: "emp-rev1", firstName: "R1", lastName: "R", email: "r1@r.com", isActive: true });
    let e2 = store.objects.create<Employee>("/company/Employee", { id: "emp-rev2", firstName: "R2", lastName: "R", email: "r2@r.com", isActive: true });
    let e3 = store.objects.create<Employee>("/company/Employee", { id: "emp-rev3", firstName: "R3", lastName: "R", email: "r3@r.com", isActive: true });
    [e1,e2,e3] = [e1,e2,e3].map(e => store.objects.update(emp => { emp.company = company; }, e));
    company = store.objects.findByUUID(store.objects.getUUID(company))!;
    expect(company.employees!.map(e => e.id)).toEqual(['emp-rev1','emp-rev2','emp-rev3']);
    company = store.objects.update(c => { (c.employees as any).reverse(); }, company);
    company = store.objects.findByUUID(store.objects.getUUID(company))!;
    expect(company.employees!.map(e => e.id)).toEqual(['emp-rev3','emp-rev2','emp-rev1']);
  });

  test('fill throws for object array (unsupported)', () => {
    const store = makeStore();
    let company = store.objects.create<Company>("/company/Company", { id: "comp-fill", name: "Fill" });
    expect(() => {
      company = store.objects.update(c => { (c.employees as any).fill({} as any); }, company);
    }).toThrow(/fill/i);
  });

  test('copyWithin throws for object array (unsupported)', () => {
    const store = makeStore();
    let company = store.objects.create<Company>("/company/Company", { id: "comp-cw", name: "CopyWithin" });
    expect(() => {
      company = store.objects.update(c => { (c.employees as any).copyWithin(0,0,1); }, company);
    }).toThrow(/copyWithin/i);
  });

  test('concat filters duplicates and links only new employees', () => {
    const store = makeStore();
    let company = store.objects.create<Company>("/company/Company", { id: "comp-con", name: "Concat" });
    let e1 = store.objects.create<Employee>("/company/Employee", { id: "emp-con1", firstName: "C1", lastName: "C", email: "c1@c.com", isActive: true });
    let e2 = store.objects.create<Employee>("/company/Employee", { id: "emp-con2", firstName: "C2", lastName: "C", email: "c2@c.com", isActive: true });
    let e3 = store.objects.create<Employee>("/company/Employee", { id: "emp-con3", firstName: "C3", lastName: "C", email: "c3@c.com", isActive: true });
    e1 = store.objects.update(e => { e.company = company; }, e1);
    e2 = store.objects.update(e => { e.company = company; }, e2);
    company = store.objects.findByUUID(store.objects.getUUID(company))!;
    expect(company.employees!.map(e => e.id)).toEqual(['emp-con1','emp-con2']);
    // perform concat inside update (non-mutating) introducing duplicate e1,e2 and new e3
    company = store.objects.update(c => { (c.employees as any).concat([e1,e2,e3]); }, company);
    company = store.objects.findByUUID(store.objects.getUUID(company))!;
    e3 = store.objects.findByUUID(store.objects.getUUID(e3))!;
    // original array unchanged
    expect(company.employees!.map(e => e.id)).toEqual(['emp-con1','emp-con2']);
    // inverse link established for e3 only
    expect((e3 as any).company).toBe(company);
  });
});
