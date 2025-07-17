import { RegistryService, NamespaceImportError } from "../../registry/RegistryService";
import { RegistryMetadata } from "../../registry/NamespaceMetadata";
import { companyNamespace } from "../example-namespaces/company-namespace";
import { coreNamespace } from "../example-namespaces/core-namespace";

describe("Basic Namespace Import Tests", () => {
    let registry: RegistryService;
    
    beforeEach(() => {
        const registryMetadata: RegistryMetadata = {
            namespaces: new Map(),
            name: "test-registry",
            version: "1.0.0"
        };
        registry = new RegistryService(registryMetadata);
    });

    describe("Valid import scenarios", () => {
        test("should successfully import namespace with simple object types", () => {
            // Should not throw any errors
            expect(() => {
                registry.importNamespace(coreNamespace);
            }).not.toThrow();
            
            // Verify namespace is imported
            expect(registry.hasNamespace("/core")).toBe(true);
            
            // Verify types are accessible
            expect(registry.hasType("/core/AuditableRole")).toBe(true);
            expect(registry.hasType("/core/TimestampableRole")).toBe(true);
            expect(registry.hasType("/core/VersionableRole")).toBe(true);
            expect(registry.hasType("/core/SoftDeletableRole")).toBe(true);
        });

        test("should successfully import namespace with entity types", () => {
            // Should not throw any errors
            expect(() => {
                registry.importNamespace(companyNamespace);
            }).not.toThrow();
            
            // Verify namespace is imported
            expect(registry.hasNamespace("/company")).toBe(true);
            
            // Verify entity types are accessible
            expect(registry.hasType("/company/Employee")).toBe(true);
            expect(registry.hasType("/company/Company")).toBe(true);
            expect(registry.hasType("/company/Badge")).toBe(true);
            expect(registry.hasType("/company/Project")).toBe(true);
        });

        test("should successfully import namespace with collection types", () => {
            expect(() => {
                registry.importNamespace(companyNamespace);
            }).not.toThrow();
            
            // Verify collection types are accessible
            expect(registry.hasType("/company/EmployeeArray")).toBe(true);
            expect(registry.hasType("/company/ProjectArray")).toBe(true);
            expect(registry.hasType("/company/SkillSet")).toBe(true);
        });

        test("should update type index correctly after import", () => {
            registry.importNamespace(companyNamespace);
            
            // Test direct type lookup
            const employeeType = registry.getType("/company/Employee");
            expect(employeeType).toBeDefined();
            expect(employeeType?.qName).toBe("/company/Employee");
            
            const addressType = registry.getType("/company/Address");
            expect(addressType).toBeDefined();
            expect(addressType?.qName).toBe("/company/Address");
        });

        test("should provide type lookup within namespace context", () => {
            registry.importNamespace(companyNamespace);
            
            // Test type lookup within namespace
            const employeeType = registry.getTypeInNamespace("Employee", "/company");
            expect(employeeType).toBeDefined();
            expect(employeeType?.qName).toBe("/company/Employee");
            
            const addressType = registry.getTypeInNamespace("Address", "/company");
            expect(addressType).toBeDefined();
            expect(addressType?.qName).toBe("/company/Address");
        });

        test("should list all types in namespace", () => {
            registry.importNamespace(companyNamespace);
            
            const typeNames = registry.listTypesInNamespace("/company");
            expect(typeNames).toContain("Employee");
            expect(typeNames).toContain("Company");
            expect(typeNames).toContain("Badge");
            expect(typeNames).toContain("Project");
            expect(typeNames).toContain("Address");
            expect(typeNames).toContain("EmployeeArray");
            expect(typeNames).toContain("ProjectArray");
            expect(typeNames).toContain("SkillSet");
        });

        test("should provide available types including system types", () => {
            registry.importNamespace(companyNamespace);
            
            const availableTypes = registry.getAvailableTypesInNamespace("/company");
            
            // Should include local types
            expect(availableTypes.has("Employee")).toBe(true);
            expect(availableTypes.has("Company")).toBe(true);
            expect(availableTypes.has("Address")).toBe(true);
            
            // Should include system types
            expect(availableTypes.has("string")).toBe(true);
            expect(availableTypes.has("number")).toBe(true);
            expect(availableTypes.has("boolean")).toBe(true);
            expect(availableTypes.has("date")).toBe(true);
        });

        test("should handle multiple namespace imports", () => {
            // Import multiple namespaces
            expect(() => {
                registry.importNamespace(coreNamespace);
                registry.importNamespace(companyNamespace);
            }).not.toThrow();
            
            // Verify both namespaces are accessible
            expect(registry.hasNamespace("/core")).toBe(true);
            expect(registry.hasNamespace("/company")).toBe(true);
            
            // Verify types from both namespaces are accessible
            expect(registry.hasType("/core/AuditableRole")).toBe(true);
            expect(registry.hasType("/company/Employee")).toBe(true);
        });
    });

    describe("Registry state verification", () => {
        test("should maintain registry metadata after import", () => {
            registry.importNamespace(companyNamespace);
            
            const registryInfo = registry.getRegistryInfo();
            expect(registryInfo.name).toBe("test-registry");
            expect(registryInfo.version).toBe("1.0.0");
            expect(registryInfo.namespaces.size).toBeGreaterThan(0);
        });

        test("should provide correct registry statistics", () => {
            registry.importNamespace(companyNamespace);
            
            const stats = registry.getRegistryStats();
            expect(stats.namespaceCount).toBeGreaterThan(0);
            expect(stats.totalTypeCount).toBeGreaterThan(0);
            expect(stats.typesByCategory.get("complex")).toBeGreaterThan(0);
        });

        test("should list all namespaces after import", () => {
            registry.importNamespace(coreNamespace);
            registry.importNamespace(companyNamespace);
            
            const namespaces = registry.listNamespaces();
            expect(namespaces).toContain("/core");
            expect(namespaces).toContain("/company");
            expect(namespaces).toContain("system"); // System namespace should be auto-imported
        });
    });

    describe("Error scenarios", () => {
        test("should throw NamespaceImportError for duplicate namespace", () => {
            // Import once successfully
            registry.importNamespace(companyNamespace);
            
            // Try to import again - should throw error
            expect(() => {
                registry.importNamespace(companyNamespace);
            }).toThrow(NamespaceImportError);
        });

        test("should contain specific error message for duplicate namespace", () => {
            registry.importNamespace(companyNamespace);
            
            try {
                registry.importNamespace(companyNamespace);
                fail("Should have thrown NamespaceImportError");
            } catch (error) {
                expect(error).toBeInstanceOf(NamespaceImportError);
                const importError = error as NamespaceImportError;
                expect(importError.validationResult.isValid).toBe(false);
                expect(importError.validationResult.errors).toContain("Namespace '/company' already exists");
            }
        });
    });
});