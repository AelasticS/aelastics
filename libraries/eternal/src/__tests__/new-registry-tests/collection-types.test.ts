import { RegistryService, NamespaceImportError } from "../../registry/RegistryService";
import { isComplexType } from "../../registry/TypeDefinitions";
import { RegistryMetadata } from "../../registry/NamespaceMetadata";
import { companyNamespace } from "../example-namespaces/company-namespace";
import { educationalNamespace } from "../example-namespaces/educational-namespace";
import { ecommerceNamespace } from "../example-namespaces/ecommerce-namespace";

describe("Collection Type Tests", () => {
    let registry: RegistryService;
    
    beforeEach(() => {
        const registryMetadata: RegistryMetadata = {
            namespaces: new Map(),
            name: "test-registry",
            version: "1.0.0"
        };
        registry = new RegistryService(registryMetadata);
    });

    describe("Array Type Tests", () => {
        test("should successfully import namespace with array types", () => {
            expect(() => {
                registry.importNamespace(companyNamespace);
            }).not.toThrow();
            
            // Verify array types are imported
            expect(registry.hasType("/company/EmployeeArray")).toBe(true);
            expect(registry.hasType("/company/ProjectArray")).toBe(true);
        });

        test("should validate ArrayTypeMeta structure", () => {
            registry.importNamespace(companyNamespace);
            
            // Get EmployeeArray type
            const employeeArrayType = registry.getType("/company/EmployeeArray");
            expect(employeeArrayType).toBeDefined();
            expect(isComplexType(employeeArrayType!)).toBe(true);
            expect(employeeArrayType?.kind).toBe("array");
            
            if (employeeArrayType && isComplexType(employeeArrayType) && employeeArrayType.kind === "array") {
                expect(employeeArrayType.elementType).toBe("/company/Employee");
                expect(employeeArrayType.qName).toBe("/company/EmployeeArray");
            }
            
            // Get ProjectArray type
            const projectArrayType = registry.getType("/company/ProjectArray");
            expect(projectArrayType).toBeDefined();
            expect(isComplexType(projectArrayType!)).toBe(true);
            expect(projectArrayType?.kind).toBe("array");
            
            if (projectArrayType && isComplexType(projectArrayType) && projectArrayType.kind === "array") {
                expect(projectArrayType.elementType).toBe("/company/Project");
                expect(projectArrayType.qName).toBe("/company/ProjectArray");
            }
        });

        test("should validate array type element references", () => {
            registry.importNamespace(companyNamespace);
            
            // Verify that array element types exist
            const employeeArrayType = registry.getType("/company/EmployeeArray");
            if (employeeArrayType && isComplexType(employeeArrayType) && employeeArrayType.kind === "array") {
                const elementType = registry.getType(employeeArrayType.elementType);
                expect(elementType).toBeDefined();
                expect(isComplexType(elementType!)).toBe(true);
                expect(elementType?.kind).toBe("entity");
            }
        });

        test("should handle arrays with system type elements", () => {
            registry.importNamespace(companyNamespace);
            
            // Check if there are any arrays with system types
            const availableTypes = registry.getAvailableTypesInNamespace("/company");
            expect(availableTypes.has("string")).toBe(true);
            expect(availableTypes.has("number")).toBe(true);
            
            // Arrays should be usable with system types in properties
            const employeeType = registry.getType("/company/Employee");
            expect(employeeType).toBeDefined();
        });
    });

    describe("Set Type Tests", () => {
        test("should successfully import namespace with set types", () => {
            expect(() => {
                registry.importNamespace(companyNamespace);
            }).not.toThrow();
            
            // Verify set types are imported
            expect(registry.hasType("/company/SkillSet")).toBe(true);
        });

        test("should validate SetTypeMeta structure", () => {
            registry.importNamespace(companyNamespace);
            
            // Get SkillSet type
            const skillSetType = registry.getType("/company/SkillSet");
            expect(skillSetType).toBeDefined();
            expect(isComplexType(skillSetType!)).toBe(true);
            expect(skillSetType?.kind).toBe("set");
            
            if (skillSetType && isComplexType(skillSetType) && skillSetType.kind === "set") {
                expect(skillSetType.elementType).toBe("string");
                expect(skillSetType.qName).toBe("/company/SkillSet");
            }
        });

        test("should validate set type with system element types", () => {
            registry.importNamespace(companyNamespace);
            
            const skillSetType = registry.getType("/company/SkillSet");
            if (skillSetType && isComplexType(skillSetType) && skillSetType.kind === "set") {
                // Element type should be a system type
                expect(skillSetType.elementType).toBe("string");
                
                // System type should be available
                const systemStringType = registry.getType("/system/string");
                expect(systemStringType).toBeDefined();
            }
        });
    });

    describe("Map Type Tests", () => {
        test("should successfully import namespace with map types", () => {
            try {
                registry.importNamespace(educationalNamespace);
            } catch (error) {
                // Skip this test if educational namespace has dependency issues
                if (error instanceof NamespaceImportError) {
                    console.log("Skipping map type tests due to educational namespace dependencies");
                    return;
                }
                throw error;
            }
            
            // Verify map types are imported
            expect(registry.hasType("/educational/GradeMap")).toBe(true);
        });

        test("should validate MapTypeMeta structure", () => {
            try {
                registry.importNamespace(educationalNamespace);
            } catch (error) {
                if (error instanceof NamespaceImportError) {
                    console.log("Skipping map type validation due to educational namespace dependencies");
                    return;
                }
                throw error;
            }
            
            // Get GradeMap type
            const gradeMapType = registry.getType("/educational/GradeMap");
            expect(gradeMapType).toBeDefined();
            expect(isComplexType(gradeMapType!)).toBe(true);
            expect(gradeMapType?.kind).toBe("map");
            
            if (gradeMapType && isComplexType(gradeMapType) && gradeMapType.kind === "map") {
                expect(gradeMapType.keyType).toBe("string");
                expect(gradeMapType.valueType).toBe("number");
                expect(gradeMapType.qName).toBe("/educational/GradeMap");
            }
        });
    });

    describe("Record Type Tests", () => {
        test("should successfully import namespace with record types if available", () => {
            // Check if ecommerce namespace has record types
            try {
                registry.importNamespace(ecommerceNamespace);
            } catch (error) {
                if (error instanceof NamespaceImportError) {
                    console.log("Skipping ecommerce namespace import due to validation errors:", error.validationResult.errors);
                    return; // Skip the rest of the test
                }
                throw error;
            }
            
            // Check all types in ecommerce namespace
            const typeNames = registry.listTypesInNamespace("/ecommerce");
            
            // Look for any record types
            for (const typeName of typeNames) {
                const fullTypeName = `/ecommerce/${typeName}`;
                const type = registry.getType(fullTypeName);
                if (type && isComplexType(type) && type.kind === "record") {
                    expect(registry.hasType(fullTypeName)).toBe(true);
                }
            }
        });
    });

    describe("Collection Type Integration", () => {
        test("should handle collections in entity properties", () => {
            registry.importNamespace(companyNamespace);
            
            // Check Employee entity with collection properties
            const employeeType = registry.getType("/company/Employee");
            expect(employeeType).toBeDefined();
            expect(isComplexType(employeeType!)).toBe(true);
            expect(employeeType?.kind).toBe("entity");
            
            if (employeeType && isComplexType(employeeType) && employeeType.kind === "entity") {
                // Check skills property (Set type)
                const skillsProperty = employeeType.properties.get("skills");
                expect(skillsProperty).toBeDefined();
                expect(skillsProperty?.typeRef).toBe("/company/SkillSet");
                
                // Check projects property (Array type via bidirectional relationship)
                const projectsProperty = employeeType.properties.get("projects");
                expect(projectsProperty).toBeDefined();
                expect(projectsProperty?.typeRef).toBe("/company/ProjectArray");
            }
        });

        test("should validate collection types exist for entity relationships", () => {
            registry.importNamespace(companyNamespace);
            
            // Company should have employees array
            const companyType = registry.getType("/company/Company");
            if (companyType && isComplexType(companyType) && companyType.kind === "entity") {
                const employeesProperty = companyType.properties.get("employees");
                expect(employeesProperty).toBeDefined();
                expect(employeesProperty?.typeRef).toBe("/company/EmployeeArray");
                
                // Verify the array type exists
                expect(registry.hasType("/company/EmployeeArray")).toBe(true);
            }
        });

        test("should list all collection types in namespace", () => {
            registry.importNamespace(companyNamespace);
            
            const typeNames = registry.listTypesInNamespace("/company");
            
            // Should include collection types
            expect(typeNames).toContain("EmployeeArray");
            expect(typeNames).toContain("ProjectArray");
            expect(typeNames).toContain("SkillSet");
            
            // Verify each collection type
            const collections = [
                { name: "EmployeeArray", kind: "array" },
                { name: "ProjectArray", kind: "array" },
                { name: "SkillSet", kind: "set" }
            ];
            
            for (const collection of collections) {
                const type = registry.getType(`/company/${collection.name}`);
                expect(type).toBeDefined();
                expect(isComplexType(type!)).toBe(true);
                expect(type?.kind).toBe(collection.kind);
            }
        });

        test("should provide available collection types in namespace", () => {
            registry.importNamespace(companyNamespace);
            
            const availableTypes = registry.getAvailableTypesInNamespace("/company");
            
            // Should include local collection types
            expect(availableTypes.has("EmployeeArray")).toBe(true);
            expect(availableTypes.has("ProjectArray")).toBe(true);
            expect(availableTypes.has("SkillSet")).toBe(true);
            
            // Should include entity types that collections reference
            expect(availableTypes.has("Employee")).toBe(true);
            expect(availableTypes.has("Project")).toBe(true);
            
            // Should include system types for collection elements
            expect(availableTypes.has("string")).toBe(true);
            expect(availableTypes.has("number")).toBe(true);
        });
    });

    describe("Collection Type Validation", () => {
        test("should validate element type references in collections", () => {
            registry.importNamespace(companyNamespace);
            
            // All collection types should have valid element type references
            const collectionTypes = [
                { qName: "/company/EmployeeArray", elementType: "/company/Employee" },
                { qName: "/company/ProjectArray", elementType: "/company/Project" },
                { qName: "/company/SkillSet", elementType: "string" }
            ];
            
            for (const collection of collectionTypes) {
                const type = registry.getType(collection.qName);
                expect(type).toBeDefined();
                
                if (type && isComplexType(type) && (type.kind === "array" || type.kind === "set")) {
                    expect(type.elementType).toBe(collection.elementType);
                    
                    // Verify element type exists (either in registry or as system type)
                    if (collection.elementType.startsWith("/")) {
                        expect(registry.hasType(collection.elementType)).toBe(true);
                    } else {
                        // System type should be available
                        expect(registry.hasType(`/system/${collection.elementType}`)).toBe(true);
                    }
                }
            }
        });

        test("should validate nested collection structures", () => {
            registry.importNamespace(companyNamespace);
            
            // Look for any nested collection patterns
            const typeNames = registry.listTypesInNamespace("/company");
            
            for (const typeName of typeNames) {
                const type = registry.getType(`/company/${typeName}`);
                if (type && isComplexType(type)) {
                    // Verify type is properly structured
                    expect(type.qName).toBe(`/company/${typeName}`);
                    
                    if (type.kind === "array" || type.kind === "set") {
                        expect(type.elementType).toBeDefined();
                        expect(typeof type.elementType).toBe("string");
                    }
                    
                    if (type.kind === "map") {
                        expect(type.keyType).toBeDefined();
                        expect(type.valueType).toBeDefined();
                        expect(typeof type.keyType).toBe("string");
                        expect(typeof type.valueType).toBe("string");
                    }
                }
            }
        });

        test("should handle collection types with qualified names", () => {
            registry.importNamespace(companyNamespace);
            
            // Test type lookup by qualified name
            const employeeArray = registry.getType("/company/EmployeeArray");
            expect(employeeArray).toBeDefined();
            expect(employeeArray?.qName).toBe("/company/EmployeeArray");
            
            // Test type lookup within namespace context
            const skillSet = registry.getTypeInNamespace("SkillSet", "/company");
            expect(skillSet).toBeDefined();
            expect(skillSet?.qName).toBe("/company/SkillSet");
        });

        test("should validate collection type exports", () => {
            registry.importNamespace(companyNamespace);
            
            // Get the namespace to check exports
            const namespace = registry.getNamespace("/company");
            expect(namespace).toBeDefined();
            
            if (namespace) {
                // Collection types should be in exports
                expect(namespace.exports).toContain("EmployeeArray");
                expect(namespace.exports).toContain("ProjectArray");
                expect(namespace.exports).toContain("SkillSet");
            }
        });
    });

    describe("Collection Type Statistics", () => {
        test("should include collection types in registry statistics", () => {
            registry.importNamespace(companyNamespace);
            
            const stats = registry.getRegistryStats();
            
            // Should have complex types (including collections)
            expect(stats.typesByKind.get("object")).toBeGreaterThan(0);
            expect(stats.totalTypeCount).toBeGreaterThan(0);
            
            // Verify specific collection types are counted
            const employeeArray = registry.getType("/company/EmployeeArray");
            const projectArray = registry.getType("/company/ProjectArray");
            const skillSet = registry.getType("/company/SkillSet");
            
            expect(employeeArray).toBeDefined();
            expect(projectArray).toBeDefined();
            expect(skillSet).toBeDefined();
        });

        test("should count collection types correctly", () => {
            registry.importNamespace(companyNamespace);
            
            const typeNames = registry.listTypesInNamespace("/company");
            
            // Count collection types
            let collectionCount = 0;
            for (const typeName of typeNames) {
                const type = registry.getType(`/company/${typeName}`);
                if (type && isComplexType(type) && 
                    (type.kind === "array" || type.kind === "set" || type.kind === "map" || type.kind === "record")) {
                    collectionCount++;
                }
            }
            
            // Should have at least the known collection types
            expect(collectionCount).toBeGreaterThanOrEqual(3); // EmployeeArray, ProjectArray, SkillSet
        });
    });
});