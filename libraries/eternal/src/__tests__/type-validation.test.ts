import { RegistryService } from "../registry/RegistryService";
import { RegistryMetadata } from "../registry/NamespaceMetadata";
import { StoreClass } from "../store/StoreClass";
import { TypeValidator } from "../store/TypeValidator";
import { companyNamespace } from "./example-namespaces/company-namespace";
import { coreNamespace } from "./example-namespaces/core-namespace";
import { PropertyMeta } from "../registry/TypeDefinitions";

// TypeScript interfaces matching the namespace type definitions
interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
    company?: Company;
    badge?: Badge;
    skills?: Set<string>;
}

interface Company {
    id: string;
    name: string;
    employees?: Employee[];
}

interface Badge {
    id: string;
    badgeNumber: string;
    isActive: boolean;
    employee?: Employee;
}

interface Address {
    street: string;
    city: string;
    zipCode: string;
    country?: string;
}

describe("TypeValidator Tests", () => {
    let registry: RegistryService;
    let store: StoreClass;
    let validator: TypeValidator;
    
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
        
        // Create store directly
        store = new StoreClass(registry);
        
        // Get validator from store
        validator = store.validator;
    });

    describe("validateStoreObjectType", () => {
        test("should accept valid object type assignment", () => {
            const employee = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            const badge = store.create<Badge>("/company/Badge", {
                id: "badge-001",
                badgeNumber: "B001",
                isActive: true
            });

            // This should not throw
            expect(() => {
                validator.validateStoreObjectType(badge as any, "/company/Badge", "badge");
            }).not.toThrow();
        });

        test("should reject wrong object type assignment", () => {
            const employee = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            const company = store.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp"
            });

            // This should throw - assigning Company to Badge property
            expect(() => {
                validator.validateStoreObjectType(company as any, "/company/Badge", "badge");
            }).toThrow(/Type mismatch for property 'badge'/);
        });

        test("should reject non-store objects", () => {
            const plainObject = { name: "Not a store object" };

            expect(() => {
                validator.validateStoreObjectType(plainObject as any, "/company/Employee", "employee");
            }).toThrow(/Object must be a valid store object with UUID/);
        });

        test("should reject null and undefined", () => {
            expect(() => {
                validator.validateStoreObjectType(null as any, "/company/Employee", "employee");
            }).toThrow(/Expected object of type/);

            expect(() => {
                validator.validateStoreObjectType(undefined as any, "/company/Employee", "employee");
            }).toThrow(/Expected object of type/);
        });

        test("should reject unregistered objects", () => {
            const employee = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            // Create a fake object with UUID but not registered - should fail isStoreObject check
            const fakeObject = {
                [Symbol.for("uuid")]: "fake-uuid-12345",
                name: "Fake Object"
            };

            expect(() => {
                validator.validateStoreObjectType(fakeObject as any, "/company/Employee", "employee");
            }).toThrow(/Object must be a valid store object with UUID/);
        });
    });

    describe("validateObjectProperty", () => {
        test("should accept valid object property", () => {
            const employee = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            const badge = store.create<Badge>("/company/Badge", {
                id: "badge-001",
                badgeNumber: "B001",
                isActive: true
            });

            const badgePropertyMeta: PropertyMeta = {
                name: "badge",
                typeRef: "/company/Badge",
                optional: true
            };

            expect(() => {
                validator.validateObjectProperty(badge, badgePropertyMeta);
            }).not.toThrow();
        });

        test("should reject array assigned to object property", () => {
            const badgePropertyMeta: PropertyMeta = {
                name: "badge",
                typeRef: "/company/Badge",
                optional: true
            };

            expect(() => {
                validator.validateObjectProperty([1, 2, 3], badgePropertyMeta);
            }).toThrow(/Expected an object, but received array/);
        });

        test("should reject primitive assigned to object property", () => {
            const badgePropertyMeta: PropertyMeta = {
                name: "badge",
                typeRef: "/company/Badge",
                optional: true
            };

            expect(() => {
                validator.validateObjectProperty("string value", badgePropertyMeta);
            }).toThrow(/Expected an object, but received string/);
        });

        test("should accept null and undefined for optional properties", () => {
            const badgePropertyMeta: PropertyMeta = {
                name: "badge",
                typeRef: "/company/Badge",
                optional: true
            };

            expect(() => {
                validator.validateObjectProperty(null, badgePropertyMeta);
            }).not.toThrow();

            expect(() => {
                validator.validateObjectProperty(undefined, badgePropertyMeta);
            }).not.toThrow();
        });
    });

    describe("validateCollectionElement", () => {
        test("should accept valid store object for object collection", () => {
            const employee = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            const employeesPropertyMeta: PropertyMeta = {
                name: "employees",
                typeRef: "/company/EmployeeArray",
                optional: true
            };

            expect(() => {
                validator.validateCollectionElement(employee, employeesPropertyMeta, "push");
            }).not.toThrow();
        });

        test("should reject wrong type for object collection", () => {
            const company = store.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp"
            });

            const employeesPropertyMeta: PropertyMeta = {
                name: "employees",
                typeRef: "/company/EmployeeArray",
                optional: true
            };

            expect(() => {
                validator.validateCollectionElement(company, employeesPropertyMeta, "push");
            }).toThrow(/Type mismatch for property 'employees\[element\]'/);
        });

        test("should accept valid primitive for primitive collection", () => {
            const skillsPropertyMeta: PropertyMeta = {
                name: "skills",
                typeRef: "/company/SkillSet",
                optional: true
            };

            expect(() => {
                validator.validateCollectionElement("JavaScript", skillsPropertyMeta, "add");
            }).not.toThrow();
        });

        test("should reject null/undefined for collections", () => {
            const employeesPropertyMeta: PropertyMeta = {
                name: "employees",
                typeRef: "/company/EmployeeArray",
                optional: true
            };

            expect(() => {
                validator.validateCollectionElement(null, employeesPropertyMeta, "push");
            }).toThrow(/Cannot push null or undefined to collection property 'employees'/);

            expect(() => {
                validator.validateCollectionElement(undefined, employeesPropertyMeta, "push");
            }).toThrow(/Cannot push null or undefined to collection property 'employees'/);
        });
    });

    describe("validatePrimitiveType", () => {
        test("should accept valid string", () => {
            expect(() => {
                validator.validatePrimitiveType("test string", "string", "name");
            }).not.toThrow();
        });

        test("should accept valid number", () => {
            expect(() => {
                validator.validatePrimitiveType(42, "number", "age");
            }).not.toThrow();
        });

        test("should accept valid boolean", () => {
            expect(() => {
                validator.validatePrimitiveType(true, "boolean", "isActive");
            }).not.toThrow();
        });

        test("should reject wrong primitive types", () => {
            expect(() => {
                validator.validatePrimitiveType(123, "string", "name");
            }).toThrow(/Type mismatch for property 'name': Expected string, but received number/);

            expect(() => {
                validator.validatePrimitiveType("abc", "number", "age");
            }).toThrow(/Type mismatch for property 'age': Expected number, but received string/);

            expect(() => {
                validator.validatePrimitiveType("true", "boolean", "isActive");
            }).toThrow(/Type mismatch for property 'isActive': Expected boolean, but received string/);
        });

        test("should reject NaN for number type", () => {
            expect(() => {
                validator.validatePrimitiveType(NaN, "number", "score");
            }).toThrow(/Type mismatch for property 'score': Expected number, but received number/);
        });
    });

    describe("validatePropertyAssignment", () => {
        test("should prevent direct assignment to collection properties", () => {
            const employee = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            const employeesPropertyMeta: PropertyMeta = {
                name: "employees",
                typeRef: "/company/EmployeeArray",
                optional: true
            };

            expect(() => {
                validator.validatePropertyAssignment([employee], employeesPropertyMeta);
            }).toThrow(/Cannot directly assign to collection property 'employees'/);
        });

        test("should validate object property assignments", () => {
            const badge = store.create<Badge>("/company/Badge", {
                id: "badge-001",
                badgeNumber: "B001",
                isActive: true
            });

            const badgePropertyMeta: PropertyMeta = {
                name: "badge",
                typeRef: "/company/Badge",
                optional: true
            };

            expect(() => {
                validator.validatePropertyAssignment(badge, badgePropertyMeta);
            }).not.toThrow();
        });

        test("should validate primitive property assignments", () => {
            const namePropertyMeta: PropertyMeta = {
                name: "firstName",
                typeRef: "string",
                optional: false
            };

            expect(() => {
                validator.validatePropertyAssignment("John", namePropertyMeta);
            }).not.toThrow();

            expect(() => {
                validator.validatePropertyAssignment(123, namePropertyMeta);
            }).toThrow(/Type mismatch for property 'firstName'/);
        });
    });

    describe("Edge Cases and Error Messages", () => {
        test("should provide clear error messages", () => {
            const company = store.create<Company>("/company/Company", {
                id: "comp-001",
                name: "Tech Corp"
            });

            expect(() => {
                validator.validateStoreObjectType(company as any, "/company/Badge", "badge");
            }).toThrow(/Type mismatch for property 'badge': Cannot assign object of type/);
        });

        test("should handle missing dynamic classes gracefully", () => {
            const employee = store.create<Employee>("/company/Employee", {
                id: "emp-001",
                firstName: "John",
                lastName: "Doe",
                email: "john@company.com",
                isActive: true
            });

            // This should not throw but log a warning
            expect(() => {
                validator.validateStoreObjectType(employee as any, "/nonexistent/Type", "someProperty");
            }).not.toThrow();
        });

        test("should handle collection type parsing", () => {
            const skillsPropertyMeta: PropertyMeta = {
                name: "customSkills",
                typeRef: "set<string>",
                optional: true
            };

            expect(() => {
                validator.validateCollectionElement("TypeScript", skillsPropertyMeta, "add");
            }).not.toThrow();
        });
    });
});