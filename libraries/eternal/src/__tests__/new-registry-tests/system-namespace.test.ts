import { RegistryService, NamespaceImportError } from "../../registry/RegistryService";
import { RegistryMetadata } from "../../registry/NamespaceMetadata";
import { companyNamespace } from "../example-namespaces/company-namespace";
import { systemConflictsNamespace, reservedSystemNamespace } from "../example-namespaces/invalid-namespaces/system-conflicts-namespace";

describe("System Namespace Auto-Import Tests", () => {
    let registry: RegistryService;
    
    beforeEach(() => {
        const registryMetadata: RegistryMetadata = {
            namespaces: new Map(),
            name: "test-registry",
            version: "1.0.0"
        };
        registry = new RegistryService(registryMetadata);
    });

    describe("System namespace presence", () => {
        test("should automatically include system namespace in new registry", () => {
            // System namespace should be present immediately after registry creation
            expect(registry.hasNamespace("/system")).toBe(true);
            
            // System types should be accessible
            expect(registry.hasType("/system/string")).toBe(true);
            expect(registry.hasType("/system/number")).toBe(true);
            expect(registry.hasType("/system/boolean")).toBe(true);
            expect(registry.hasType("/system/date")).toBe(true);
            expect(registry.hasType("/system/null")).toBe(true);
            expect(registry.hasType("/system/undefined")).toBe(true);
            expect(registry.hasType("/system/void")).toBe(true);
        });

        test("should list system namespace in available namespaces", () => {
            const namespaces = registry.listNamespaces();
            expect(namespaces).toContain("/system");
        });

        test("should include system namespace in registry statistics", () => {
            const stats = registry.getRegistryStats();
            expect(stats.namespaceCount).toBeGreaterThanOrEqual(1); // At least system namespace
            expect(stats.totalTypeCount).toBeGreaterThan(0); // System types should be counted
        });
    });

    describe("System namespace auto-import during namespace import", () => {
        test("should auto-import system namespace when importing other namespaces", () => {
            // Import a namespace that doesn't explicitly import system
            registry.importNamespace(companyNamespace);
            
            // System namespace should still be accessible
            expect(registry.hasNamespace("/system")).toBe(true);
            
            // System types should be available in the imported namespace context
            const availableTypes = registry.getAvailableTypesInNamespace("/company");
            expect(availableTypes.has("string")).toBe(true);
            expect(availableTypes.has("number")).toBe(true);
            expect(availableTypes.has("boolean")).toBe(true);
            expect(availableTypes.has("date")).toBe(true);
        });

        test("should ensure system namespace is in imports of imported namespace", () => {
            // The RegistryService should automatically add system to imports
            registry.importNamespace(companyNamespace);
            
            // Verify that namespace was modified to include system import
            const importedNamespace = registry.getNamespace("/company");
            expect(importedNamespace).toBeDefined();
            expect(importedNamespace!.imports.has("/system")).toBe(true);
            expect(importedNamespace!.imports.get("/system")).toEqual(["*"]);
        });
    });

    describe("System type accessibility", () => {
        test("should access system types by simple name in any namespace", () => {
            registry.importNamespace(companyNamespace);
            
            // System types should be accessible by simple name
            const stringType = registry.getTypeInNamespace("string", "/company");
            expect(stringType).toBeDefined();
            expect(stringType?.qName).toBe("/system/string");
            
            const numberType = registry.getTypeInNamespace("number", "/company");
            expect(numberType).toBeDefined();
            expect(numberType?.qName).toBe("/system/number");
            
            const booleanType = registry.getTypeInNamespace("boolean", "/company");
            expect(booleanType).toBeDefined();
            expect(booleanType?.qName).toBe("/system/boolean");
        });

        test("should access system types by qualified name", () => {
            registry.importNamespace(companyNamespace);
            
            // System types should also be accessible by qualified name
            const stringType = registry.getType("/system/string");
            expect(stringType).toBeDefined();
            expect(stringType?.qName).toBe("/system/string");
            expect(stringType?.category).toBe("simple");
            expect(stringType?.kind).toBe("string");
        });

        test("should prioritize system types in type resolution", () => {
            registry.importNamespace(companyNamespace);
            
            // When looking up by simple name, should always resolve to system types
            const availableTypes = registry.getAvailableTypesInNamespace("/company");
            expect(availableTypes.has("string")).toBe(true);
            expect(availableTypes.has("number")).toBe(true);
            expect(availableTypes.has("boolean")).toBe(true);
            expect(availableTypes.has("date")).toBe(true);
        });
    });

    describe("System namespace protection", () => {
        test("should prevent redefining system types", () => {
            expect(() => {
                registry.importNamespace(systemConflictsNamespace);
            }).toThrow(NamespaceImportError);
        });

        test("should contain specific error messages for system type conflicts", () => {
            try {
                registry.importNamespace(systemConflictsNamespace);
                fail("Should have thrown NamespaceImportError");
            } catch (error) {
                expect(error).toBeInstanceOf(NamespaceImportError);
                const importError = error as NamespaceImportError;
                expect(importError.validationResult.isValid).toBe(false);
                expect(importError.validationResult.errors).toEqual(
                    expect.arrayContaining([
                        "Type name 'string' conflicts with system type",
                        "Type name 'number' conflicts with system type",
                        "Type name 'boolean' conflicts with system type"
                    ])
                );
            }
        });

        test("should prevent using reserved 'system' namespace name", () => {
            expect(() => {
                registry.importNamespace(reservedSystemNamespace);
            }).toThrow(NamespaceImportError);
        });

        test("should contain specific error message for reserved namespace name", () => {
            try {
                registry.importNamespace(reservedSystemNamespace);
                fail("Should have thrown NamespaceImportError");
            } catch (error) {
                expect(error).toBeInstanceOf(NamespaceImportError);
                const importError = error as NamespaceImportError;
                expect(importError.validationResult.isValid).toBe(false);
                expect(importError.validationResult.errors).toContain(
                    "Namespace 'system' is reserved for system types"
                );
            }
        });
    });

    describe("System namespace metadata", () => {
        test("should have correct system namespace properties", () => {
            const systemNamespace = registry.getNamespace("/system");
            expect(systemNamespace).toBeDefined();
            expect(systemNamespace!.qName).toBe("/system");
            expect(systemNamespace!.version).toBe("1.0.0");
            expect(systemNamespace!.imports.size).toBe(0); // System namespace imports nothing
        });

        test("should export all system types", () => {
            const systemNamespace = registry.getNamespace("/system");
            expect(systemNamespace).toBeDefined();
            
            const exports = systemNamespace!.exports;
            expect(exports).toContain("string");
            expect(exports).toContain("number");
            expect(exports).toContain("boolean");
            expect(exports).toContain("date");
            expect(exports).toContain("null");
            expect(exports).toContain("undefined");
            expect(exports).toContain("void");
        });

        test("should have all system types defined", () => {
            const systemNamespace = registry.getNamespace("/system");
            expect(systemNamespace).toBeDefined();
            
            const typeNames = registry.listTypesInNamespace("/system");
            expect(typeNames).toContain("string");
            expect(typeNames).toContain("number");
            expect(typeNames).toContain("boolean");
            expect(typeNames).toContain("date");
            expect(typeNames).toContain("null");
            expect(typeNames).toContain("undefined");
            expect(typeNames).toContain("void");
        });
    });
});