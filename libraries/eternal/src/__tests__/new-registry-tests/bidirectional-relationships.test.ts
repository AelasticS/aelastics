import { RegistryService, NamespaceImportError } from "../../registry/RegistryService";
import { RegistryMetadata } from "../../registry/NamespaceMetadata";
import { companyNamespace } from "../example-namespaces/company-namespace";
import { educationalNamespace } from "../example-namespaces/educational-namespace";

describe("Bidirectional Relationship Tests", () => {
    let registry: RegistryService;
    
    beforeEach(() => {
        const registryMetadata: RegistryMetadata = {
            namespaces: new Map(),
            name: "test-registry",
            version: "1.0.0"
        };
        registry = new RegistryService(registryMetadata);
    });

    describe("One-to-One Relationships", () => {
        test("should successfully import namespace with one-to-one bidirectional relationships", () => {
            // Company namespace has Employee ↔ Badge (one-to-one)
            expect(() => {
                registry.importNamespace(companyNamespace);
            }).not.toThrow();
            
            // Verify both types are imported
            expect(registry.hasType("/company/Employee")).toBe(true);
            expect(registry.hasType("/company/Badge")).toBe(true);
        });

        test("should validate one-to-one bidirectional relationship metadata", () => {
            registry.importNamespace(companyNamespace);
            
            // Get Employee type and check badge property
            const employeeType = registry.getType("/company/Employee");
            expect(employeeType).toBeDefined();
            expect(employeeType?.category).toBe("complex");
            expect(employeeType?.kind).toBe("entity");
            
            if (employeeType && employeeType.category === "complex" && employeeType.kind === "entity") {
                const badgeProperty = employeeType.properties.get("badge");
                expect(badgeProperty).toBeDefined();
                expect(badgeProperty?.typeRef).toBe("/company/Badge");
                expect(badgeProperty?.inverseProp).toBe("employee");
                expect(badgeProperty?.inverseTypeRef).toBe("/company/Employee");
                expect(badgeProperty?.inverseType).toBe("object"); // Badge.employee is single reference
            }
            
            // Get Badge type and check employee property
            const badgeType = registry.getType("/company/Badge");
            expect(badgeType).toBeDefined();
            expect(badgeType?.category).toBe("complex");
            expect(badgeType?.kind).toBe("entity");
            
            if (badgeType && badgeType.category === "complex" && badgeType.kind === "entity") {
                const employeeProperty = badgeType.properties.get("employee");
                expect(employeeProperty).toBeDefined();
                expect(employeeProperty?.typeRef).toBe("/company/Employee");
                expect(employeeProperty?.inverseProp).toBe("badge");
                expect(employeeProperty?.inverseTypeRef).toBe("/company/Employee");
                expect(employeeProperty?.inverseType).toBe("object"); // Employee.badge is single reference
            }
        });
    });

    describe("One-to-Many Relationships", () => {
        test("should successfully import namespace with one-to-many bidirectional relationships", () => {
            // Company namespace has Company ↔ Employees (one-to-many)
            expect(() => {
                registry.importNamespace(companyNamespace);
            }).not.toThrow();
            
            // Verify both types are imported
            expect(registry.hasType("/company/Company")).toBe(true);
            expect(registry.hasType("/company/Employee")).toBe(true);
            expect(registry.hasType("/company/EmployeeArray")).toBe(true);
        });

        test("should validate one-to-many bidirectional relationship metadata", () => {
            registry.importNamespace(companyNamespace);
            
            // Get Company type and check employees property
            const companyType = registry.getType("/company/Company");
            expect(companyType).toBeDefined();
            expect(companyType?.category).toBe("complex");
            expect(companyType?.kind).toBe("entity");
            
            if (companyType && companyType.category === "complex" && companyType.kind === "entity") {
                const employeesProperty = companyType.properties.get("employees");
                expect(employeesProperty).toBeDefined();
                expect(employeesProperty?.typeRef).toBe("/company/EmployeeArray");
                expect(employeesProperty?.inverseProp).toBe("company");
                expect(employeesProperty?.inverseTypeRef).toBe("/company/Employee");
                expect(employeesProperty?.inverseType).toBe("object"); // Employee.company is single reference
            }
            
            // Get Employee type and check company property
            const employeeType = registry.getType("/company/Employee");
            expect(employeeType).toBeDefined();
            expect(employeeType?.category).toBe("complex");
            expect(employeeType?.kind).toBe("entity");
            
            if (employeeType && employeeType.category === "complex" && employeeType.kind === "entity") {
                const companyProperty = employeeType.properties.get("company");
                expect(companyProperty).toBeDefined();
                expect(companyProperty?.typeRef).toBe("/company/Company");
                expect(companyProperty?.inverseProp).toBe("employees");
                expect(companyProperty?.inverseTypeRef).toBe("/company/Company");
                expect(companyProperty?.inverseType).toBe("array"); // Company.employees is a collection
            }
        });
    });

    describe("Many-to-Many Relationships", () => {
        test("should successfully import namespace with many-to-many bidirectional relationships", () => {
            // Company namespace has Employee ↔ Projects (many-to-many)
            expect(() => {
                registry.importNamespace(companyNamespace);
            }).not.toThrow();
            
            // Verify all types are imported
            expect(registry.hasType("/company/Employee")).toBe(true);
            expect(registry.hasType("/company/Project")).toBe(true);
            expect(registry.hasType("/company/EmployeeArray")).toBe(true);
            expect(registry.hasType("/company/ProjectArray")).toBe(true);
        });

        test("should validate many-to-many bidirectional relationship metadata", () => {
            registry.importNamespace(companyNamespace);
            
            // Get Employee type and check projects property
            const employeeType = registry.getType("/company/Employee");
            expect(employeeType).toBeDefined();
            expect(employeeType?.category).toBe("complex");
            expect(employeeType?.kind).toBe("entity");
            
            if (employeeType && employeeType.category === "complex" && employeeType.kind === "entity") {
                const projectsProperty = employeeType.properties.get("projects");
                expect(projectsProperty).toBeDefined();
                expect(projectsProperty?.typeRef).toBe("/company/ProjectArray");
                expect(projectsProperty?.inverseProp).toBe("assignedEmployees");
                expect(projectsProperty?.inverseTypeRef).toBe("/company/Project");
                expect(projectsProperty?.inverseType).toBe("array"); // Project.assignedEmployees is a collection
            }
            
            // Get Project type and check assignedEmployees property
            const projectType = registry.getType("/company/Project");
            expect(projectType).toBeDefined();
            expect(projectType?.category).toBe("complex");
            expect(projectType?.kind).toBe("entity");
            
            if (projectType && projectType.category === "complex" && projectType.kind === "entity") {
                const assignedEmployeesProperty = projectType.properties.get("assignedEmployees");
                expect(assignedEmployeesProperty).toBeDefined();
                expect(assignedEmployeesProperty?.typeRef).toBe("/company/EmployeeArray");
                expect(assignedEmployeesProperty?.inverseProp).toBe("projects");
                expect(assignedEmployeesProperty?.inverseTypeRef).toBe("/company/Employee");
                expect(assignedEmployeesProperty?.inverseType).toBe("array"); // Employee.projects is a collection
            }
        });
    });

    describe("Complex Many-to-Many Relationships", () => {
        test("should handle complex many-to-many relationships with dependencies", () => {
            // Educational namespace has Student ↔ Courses (many-to-many)
            // But first we need to import its dependencies
            expect(() => {
                registry.importNamespace(educationalNamespace);
            }).not.toThrow();
            
            // Verify all types are imported
            expect(registry.hasType("/educational/Student")).toBe(true);
            expect(registry.hasType("/educational/Course")).toBe(true);
            expect(registry.hasType("/educational/StudentArray")).toBe(true);
            expect(registry.hasType("/educational/CourseArray")).toBe(true);
        });

        test("should validate complex many-to-many relationship metadata", () => {
            registry.importNamespace(educationalNamespace);
            
            // Get Student type and check courses property
            const studentType = registry.getType("/educational/Student");
            expect(studentType).toBeDefined();
            expect(studentType?.category).toBe("complex");
            expect(studentType?.kind).toBe("entity");
            
            if (studentType && studentType.category === "complex" && studentType.kind === "entity") {
                const coursesProperty = studentType.properties.get("courses");
                expect(coursesProperty).toBeDefined();
                expect(coursesProperty?.typeRef).toBe("/educational/CourseArray");
                expect(coursesProperty?.inverseProp).toBe("enrolledStudents");
                expect(coursesProperty?.inverseTypeRef).toBe("/educational/Course");
                expect(coursesProperty?.inverseType).toBe("array"); // Course.enrolledStudents is a collection
            }
            
            // Get Course type and check enrolledStudents property
            const courseType = registry.getType("/educational/Course");
            expect(courseType).toBeDefined();
            expect(courseType?.category).toBe("complex");
            expect(courseType?.kind).toBe("entity");
            
            if (courseType && courseType.category === "complex" && courseType.kind === "entity") {
                const enrolledStudentsProperty = courseType.properties.get("enrolledStudents");
                expect(enrolledStudentsProperty).toBeDefined();
                expect(enrolledStudentsProperty?.typeRef).toBe("/educational/StudentArray");
                expect(enrolledStudentsProperty?.inverseProp).toBe("courses");
                expect(enrolledStudentsProperty?.inverseTypeRef).toBe("/educational/Student");
                expect(enrolledStudentsProperty?.inverseType).toBe("array"); // Student.courses is a collection
            }
        });
    });

    describe("Bidirectional Relationship Validation", () => {
        test("should validate that all bidirectional relationships are consistent", () => {
            // This test ensures that when we import a namespace with bidirectional relationships,
            // all inverse relationships are properly validated and stored
            
            expect(() => {
                registry.importNamespace(companyNamespace);
            }).not.toThrow();
            
            // Check that all types with bidirectional relationships are properly imported
            const allTypes = [
                "/company/Employee", 
                "/company/Badge", 
                "/company/Company", 
                "/company/Project"
            ];
            
            for (const typeQName of allTypes) {
                expect(registry.hasType(typeQName)).toBe(true);
            }
        });

        test("should handle multiple bidirectional relationships on same entity", () => {
            // Employee has relationships with Badge, Company, and Projects
            registry.importNamespace(companyNamespace);
            
            const employeeType = registry.getType("/company/Employee");
            expect(employeeType).toBeDefined();
            expect(employeeType?.category).toBe("complex");
            expect(employeeType?.kind).toBe("entity");
            
            if (employeeType && employeeType.category === "complex" && employeeType.kind === "entity") {
                // Check all bidirectional relationships on Employee
                expect(employeeType.properties.has("badge")).toBe(true); // One-to-one
                expect(employeeType.properties.has("company")).toBe(true); // Many-to-one
                expect(employeeType.properties.has("projects")).toBe(true); // Many-to-many
                
                // Verify each has proper inverse metadata
                const badgeProperty = employeeType.properties.get("badge");
                expect(badgeProperty?.inverseProp).toBe("employee");
                expect(badgeProperty?.inverseType).toBe("object");
                
                const companyProperty = employeeType.properties.get("company");
                expect(companyProperty?.inverseProp).toBe("employees");
                expect(companyProperty?.inverseType).toBe("array");
                
                const projectsProperty = employeeType.properties.get("projects");
                expect(projectsProperty?.inverseProp).toBe("assignedEmployees");
                expect(projectsProperty?.inverseType).toBe("array");
            }
        });
    });
});