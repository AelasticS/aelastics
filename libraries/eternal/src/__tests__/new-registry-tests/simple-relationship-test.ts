import { RegistryService } from "../../registry/RegistryService";
import { RegistryMetadata } from "../../registry/NamespaceMetadata";
import { createStore } from "../../store/createStore";
import { IStore } from "../../interfaces/IStore";
import { companyNamespace } from "../example-namespaces/company-namespace";
import { coreNamespace } from "../example-namespaces/core-namespace";

interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
    company?: Company;
}

interface Company {
    id: string;
    name: string;
    employees?: Employee[];
}

describe("Simple Relationship Debug", () => {
    let registry: RegistryService;
    let store: IStore;
    
    beforeEach(() => {
        const registryMetadata: RegistryMetadata = {
            namespaces: new Map(),
            name: "test-registry",
            version: "1.0.0"
        };
        registry = new RegistryService(registryMetadata);
        
        registry.importNamespace(coreNamespace);
        registry.importNamespace(companyNamespace);
        
        store = createStore(registry);
    });

    test("debug property accessors and relationship storage", () => {
        // Create objects
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

        console.log("=== BEFORE UPDATE ===");
        console.log("employee.company:", employee.company);
        console.log("company.employees:", company.employees);
        console.log("company object keys:", Object.keys(company));
        console.log("employee object keys:", Object.keys(employee));

        // Test property access through getters
        console.log("=== PROPERTY ACCESS THROUGH GETTERS ===");
        console.log("employee._company (private key):", (employee as any)._company);
        console.log("company._employees (private key):", (company as any)._employees);

        // Try to set relationship
        store.objects.update((emp) => {
            console.log("=== INSIDE UPDATE ===");
            console.log("Setting emp.company = company");
            emp.company = company;
            console.log("After assignment:");
            console.log("emp.company:", emp.company);
            console.log("company.employees:", company.employees);
        }, employee);

        console.log("=== AFTER UPDATE ===");
        console.log("employee.company:", employee.company);
        console.log("company.employees:", company.employees);
        console.log("employee._company (private key):", (employee as any)._company);
        console.log("company._employees (private key):", (company as any)._employees);

        // Verify the relationship
        expect(employee.company).toBe(company);
        expect(company.employees).toContain(employee);
    });
});