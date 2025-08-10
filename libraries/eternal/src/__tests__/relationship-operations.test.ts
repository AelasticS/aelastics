import { RegistryService } from "../registry/RegistryService";
import { RegistryMetadata } from "../registry/NamespaceMetadata";
import { createStore } from "../store/createStore";
import { IStore } from "../interfaces/IStore";
import { companyNamespace } from "./example-namespaces/company-namespace";
import { coreNamespace } from "./example-namespaces/core-namespace";

interface Employee { id: string; firstName: string; lastName: string; email: string; isActive: boolean; company?: Company; projects?: Project[]; skills?: Set<string>; badge?: Badge; }
interface Company { id: string; name: string; employees?: Employee[]; }
interface Project { id: string; name: string; assignedEmployees?: Employee[]; }
interface Badge { id: string; badgeNumber: string; isActive: boolean; employee?: Employee; }

describe("Relationship Operations Tests", () => {
  let registry: RegistryService;
  let store: IStore;
  beforeEach(() => {
    const registryMetadata: RegistryMetadata = { namespaces: new Map(), name: "test-registry", version: "1.0.0" };
    registry = new RegistryService(registryMetadata);
    registry.importNamespace(coreNamespace);
    registry.importNamespace(companyNamespace);
    store = createStore(registry);
  });

  describe("One-to-One Relationships", () => {
    test("should connect/disconnect Employee ↔ Badge (one-to-one)", () => {
      let employee = store.objects.create<Employee>("/company/Employee", { id: "emp-001", firstName: "John", lastName: "Doe", email: "john@company.com", isActive: true });
      let badge = store.objects.create<Badge>("/company/Badge", { id: "badge-001", badgeNumber: "B001", isActive: true });
      expect(employee.badge).toBeUndefined();
      expect(badge.employee).toBeUndefined();
      employee = store.objects.update(emp => { emp.badge = badge; }, employee);
      employee = store.objects.findByUUID(store.objects.getUUID(employee))!;
      badge = store.objects.findByUUID(store.objects.getUUID(badge))!;
      expect(employee.badge).toBe(badge);
      expect(badge.employee).toBe(employee);
      employee = store.objects.update(emp => { emp.badge = undefined; }, employee);
      employee = store.objects.findByUUID(store.objects.getUUID(employee))!;
      badge = store.objects.findByUUID(store.objects.getUUID(badge))!;
      expect(employee.badge).toBeUndefined();
      expect(badge.employee).toBeUndefined();
    });
    test("should handle one-to-one replacement correctly", () => {
      let employee1 = store.objects.create<Employee>("/company/Employee", { id: "emp-001", firstName: "John", lastName: "Doe", email: "john@company.com", isActive: true });
      let employee2 = store.objects.create<Employee>("/company/Employee", { id: "emp-002", firstName: "Jane", lastName: "Smith", email: "jane@company.com", isActive: true });
      let badge = store.objects.create<Badge>("/company/Badge", { id: "badge-001", badgeNumber: "B001", isActive: true });
      employee1 = store.objects.update(emp => { emp.badge = badge; }, employee1);
      badge = store.objects.findByUUID(store.objects.getUUID(badge))!;
      expect(employee1.badge).toBe(badge);
      expect(badge.employee).toBe(employee1);
      employee2 = store.objects.update(emp => { emp.badge = badge; }, employee2);
      employee1 = store.objects.findByUUID(store.objects.getUUID(employee1))!;
      badge = store.objects.findByUUID(store.objects.getUUID(badge))!;
      expect(employee1.badge).toBeUndefined();
      expect(employee2.badge).toBe(badge);
      expect(badge.employee).toBe(employee2);
    });
  });

  describe("One-to-Many Relationships (Arrays)", () => {
    test("should connect/disconnect Company ↔ Employee[] (one-to-many with array)", () => {
      let company = store.objects.create<Company>("/company/Company", { id: "comp-001", name: "Tech Corp" });
      let employee1 = store.objects.create<Employee>("/company/Employee", { id: "emp-001", firstName: "John", lastName: "Doe", email: "john@company.com", isActive: true });
      let employee2 = store.objects.create<Employee>("/company/Employee", { id: "emp-002", firstName: "Jane", lastName: "Smith", email: "jane@company.com", isActive: true });
      expect(company.employees).toEqual([]);
      expect(employee1.company).toBeUndefined();
      expect(employee2.company).toBeUndefined();
      employee1 = store.objects.update(emp => { emp.company = company; }, employee1);
      company = store.objects.findByUUID(store.objects.getUUID(company))!;
      expect(company.employees!.includes(employee1)).toBe(true);
      expect(employee1.company).toBe(company);
      employee2 = store.objects.update(emp => { emp.company = company; }, employee2);
      company = store.objects.findByUUID(store.objects.getUUID(company))!;
      employee1 = store.objects.findByUUID(store.objects.getUUID(employee1))!;
      expect(company.employees!.includes(employee1)).toBe(true);
      expect(company.employees!.includes(employee2)).toBe(true);
      expect(company.employees!.length).toBe(2);
      expect(employee2.company).toBe(company);
      employee1 = store.objects.update(emp => { emp.company = undefined; }, employee1);
      company = store.objects.findByUUID(store.objects.getUUID(company))!;
      employee2 = store.objects.findByUUID(store.objects.getUUID(employee2))!;
      expect(company.employees!.includes(employee1)).toBe(false);
      expect(company.employees!.includes(employee2)).toBe(true);
      expect(company.employees!.length).toBe(1);
      expect(employee1.company).toBeUndefined();
    });
    test("should handle employee moving between companies", () => {
      let company1 = store.objects.create<Company>("/company/Company", { id: "comp-001", name: "Tech Corp" });
      let company2 = store.objects.create<Company>("/company/Company", { id: "comp-002", name: "Innovation Inc" });
      let employee = store.objects.create<Employee>("/company/Employee", { id: "emp-001", firstName: "John", lastName: "Doe", email: "john@company.com", isActive: true });
      employee = store.objects.update(emp => { emp.company = company1; }, employee);
      company1 = store.objects.findByUUID(store.objects.getUUID(company1))!;
      company2 = store.objects.findByUUID(store.objects.getUUID(company2))!;
      expect(company1.employees!.includes(employee)).toBe(true);
      expect(company2.employees).toEqual([]);
      expect(employee.company).toBe(company1);
      employee = store.objects.update(emp => { emp.company = company2; }, employee);
      company1 = store.objects.findByUUID(store.objects.getUUID(company1))!;
      company2 = store.objects.findByUUID(store.objects.getUUID(company2))!;
      expect(company1.employees).toEqual([]);
      expect(company2.employees!.includes(employee)).toBe(true);
      expect(employee.company).toBe(company2);
    });
  });

  describe("Many-to-Many Relationships (Arrays)", () => {
    test("should handle Employee[] ↔ Project[] (many-to-many with arrays)", () => {
      let project1 = store.objects.create<Project>("/company/Project", { id: "proj-001", name: "Project Alpha" });
      let project2 = store.objects.create<Project>("/company/Project", { id: "proj-002", name: "Project Beta" });
      let employee1 = store.objects.create<Employee>("/company/Employee", { id: "emp-001", firstName: "John", lastName: "Doe", email: "john@company.com", isActive: true });
      let employee2 = store.objects.create<Employee>("/company/Employee", { id: "emp-002", firstName: "Jane", lastName: "Smith", email: "jane@company.com", isActive: true });
      expect(project1.assignedEmployees).toEqual([]);
      expect(project2.assignedEmployees).toEqual([]);
      expect(employee1.projects).toEqual([]);
      expect(employee2.projects).toEqual([]);
      project1 = store.objects.update(proj => { proj.assignedEmployees?.push(employee1); }, project1);
      employee1 = store.objects.findByUUID(store.objects.getUUID(employee1))!;
      employee2 = store.objects.findByUUID(store.objects.getUUID(employee2))!;
      expect(project1.assignedEmployees!.includes(employee1)).toBe(true);
      expect(employee1.projects!.includes(project1)).toBe(true);
      project2 = store.objects.update(proj => { proj.assignedEmployees?.push(employee1); }, project2);
      project1 = store.objects.findByUUID(store.objects.getUUID(project1))!;
      project2 = store.objects.findByUUID(store.objects.getUUID(project2))!;
      employee1 = store.objects.findByUUID(store.objects.getUUID(employee1))!;
      expect(project2.assignedEmployees!.includes(employee1)).toBe(true);
      expect(employee1.projects!.includes(project1)).toBe(true);
      expect(employee1.projects!.includes(project2)).toBe(true);
      expect(employee1.projects!.length).toBe(2);
      project1 = store.objects.update(proj => { proj.assignedEmployees?.push(employee2); }, project1);
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
      let employee = store.objects.create<Employee>("/company/Employee", { id: "emp-001", firstName: "John", lastName: "Doe", email: "john@company.com", isActive: true });
      expect(employee.skills).toBeInstanceOf(Set);
      expect(employee.skills!.size).toBe(0);
      employee = store.objects.update(emp => { emp.skills?.add("JavaScript"); emp.skills?.add("TypeScript"); emp.skills?.add("React"); }, employee);
      expect(employee.skills!.has("JavaScript")).toBe(true);
      expect(employee.skills!.has("TypeScript")).toBe(true);
      expect(employee.skills!.has("React")).toBe(true);
      expect(employee.skills!.size).toBe(3);
      employee = store.objects.update(emp => { emp.skills?.add("JavaScript"); }, employee);
      expect(employee.skills!.size).toBe(3);
      employee = store.objects.update(emp => { emp.skills?.delete("React"); }, employee);
      expect(employee.skills!.has("React")).toBe(false);
      expect(employee.skills!.size).toBe(2);
    });
  });

  describe("Collection Proxy Change Tracking", () => {
    test("should track changes in collection operations", () => {
      let company = store.objects.create<Company>("/company/Company", { id: "comp-001", name: "Tech Corp" });
      const employee = store.objects.create<Employee>("/company/Employee", { id: "emp-001", firstName: "John", lastName: "Doe", email: "john@company.com", isActive: true });
      expect(company.employees).toEqual([]);
      company = store.objects.update(comp => { comp.employees?.push(employee); }, company);
      const updatedEmployee = store.objects.findByUUID(store.objects.getUUID(employee))!;
      expect(company.employees).toHaveLength(1);
      expect(company.employees![0]).toBe(updatedEmployee);
    });
  });

  describe("Error Handling in Relationships", () => {
    test("should handle invalid relationship assignments", () => {
      const employee = store.objects.create<Employee>("/company/Employee", { id: "emp-001", firstName: "John", lastName: "Doe", email: "john@company.com", isActive: true });
      const company = store.objects.create<Company>("/company/Company", { id: "comp-001", name: "Tech Corp" });
      expect(() => { store.objects.update(emp => { (emp as any).badge = company; }, employee); }).toThrow();
      expect(() => { store.objects.update(comp => { comp.employees = [employee]; }, company); }).toThrow("Cannot directly assign to collection property");
    });
  });

  describe("Disconnect Operations", () => {
    test("should properly disconnect all relationships when object is disconnected", () => {
      let employee = store.objects.create<Employee>("/company/Employee", { id: "emp-001", firstName: "John", lastName: "Doe", email: "john@company.com", isActive: true });
      let company = store.objects.create<Company>("/company/Company", { id: "comp-001", name: "Tech Corp" });
      let badge = store.objects.create<Badge>("/company/Badge", { id: "badge-001", badgeNumber: "B001", isActive: true });
      employee = store.objects.update(emp => { emp.company = company; emp.badge = badge; }, employee);
      company = store.objects.findByUUID(store.objects.getUUID(company))!;
      badge = store.objects.findByUUID(store.objects.getUUID(badge))!;
      expect(employee.company).toBe(company);
      expect(employee.badge).toBe(badge);
      expect(company.employees!.includes(employee)).toBe(true);
      expect(badge.employee).toBe(employee);
      employee = store.objects.update(emp => { emp.company = undefined; emp.badge = undefined; }, employee);
      company = store.objects.findByUUID(store.objects.getUUID(company))!;
      badge = store.objects.findByUUID(store.objects.getUUID(badge))!;
      expect(employee.company).toBeUndefined();
      expect(employee.badge).toBeUndefined();
      expect(company.employees!.includes(employee)).toBe(false);
      expect(badge.employee).toBeUndefined();
    });
  });
});
