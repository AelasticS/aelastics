import { RegistryService } from "../registry/RegistryService";
import { RegistryMetadata } from "../registry/NamespaceMetadata";
import { companyNamespace } from "./example-namespaces/company-namespace";
import { educationalNamespace } from "./example-namespaces/educational-namespace";
import { coreNamespace } from "./example-namespaces/core-namespace";
import { authNamespace } from "./example-namespaces/auth-namespace";

describe('Bidirectional Collections - Enhanced Namespaces', () => {
    let registry: RegistryService;
    
    beforeEach(() => {
        const registryMetadata: RegistryMetadata = {
            namespaces: new Map(),
            name: "test-registry",
            version: "1.0.0"
        };
        registry = new RegistryService(registryMetadata);
        
        // Import required namespaces in dependency order
        registry.importNamespace(coreNamespace);
        registry.importNamespace(authNamespace);
    });

    describe('Enhanced Company namespace - Set and Map collections', () => {
        it('should have correct bidirectional relationships in Department-Employee Set relationship', () => {
            registry.importNamespace(companyNamespace);
            
            const deptType = registry.getType('/company/Department');
            expect(deptType).toBeDefined();
            expect(deptType?.kind).toBe('entity');
            
            if (deptType && deptType.kind === 'entity') {
                const employeesProperty = deptType.properties.get('employees');
                expect(employeesProperty).toBeDefined();
                expect(employeesProperty?.typeRef).toBe('/company/EmployeeSet');
                expect(employeesProperty?.inverseProp).toBe('departments');
                expect(employeesProperty?.inverseTypeRef).toBe('/company/Employee');
            }
            
            const employeeType = registry.getType('/company/Employee');
            expect(employeeType).toBeDefined();
            expect(employeeType?.kind).toBe('entity');
            
            if (employeeType && employeeType.kind === 'entity') {
                const departmentsProperty = employeeType.properties.get('departments');
                expect(departmentsProperty).toBeDefined();
                expect(departmentsProperty?.typeRef).toBe('/company/DepartmentSet');
                expect(departmentsProperty?.inverseProp).toBe('employees');
                expect(departmentsProperty?.inverseTypeRef).toBe('/company/Department');
                
                const skillLevelsProperty = employeeType.properties.get('skillLevels');
                expect(skillLevelsProperty).toBeDefined();
                expect(skillLevelsProperty?.typeRef).toBe('/company/SkillLevelMap');
            }
        });
    });

    describe('Enhanced Educational namespace - Map bidirectional relationships', () => {
        it('should successfully import enhanced educational namespace with new Map collection types', () => {
            registry.importNamespace(educationalNamespace);
            
            // Verify new Map types are available
            expect(registry.hasType('/educational/CourseGradeMap')).toBe(true);
            expect(registry.hasType('/educational/StudentGradeMap')).toBe(true);
        });

        it('should have correct bidirectional Map relationships in Student-Course grade mapping', () => {
            registry.importNamespace(educationalNamespace);
            
            const studentType = registry.getType('/educational/Student');
            expect(studentType).toBeDefined();
            expect(studentType?.kind).toBe('entity');
            
            if (studentType && studentType.kind === 'entity') {
                const courseGradesProperty = studentType.properties.get('courseGrades');
                expect(courseGradesProperty).toBeDefined();
                expect(courseGradesProperty?.typeRef).toBe('/educational/CourseGradeMap');
                expect(courseGradesProperty?.inverseProp).toBe('studentGrades');
                expect(courseGradesProperty?.inverseTypeRef).toBe('/educational/Course');
            }
            
            const courseType = registry.getType('/educational/Course');
            expect(courseType).toBeDefined();
            expect(courseType?.kind).toBe('entity');
            
            if (courseType && courseType.kind === 'entity') {
                const studentGradesProperty = courseType.properties.get('studentGrades');
                expect(studentGradesProperty).toBeDefined();
                expect(studentGradesProperty?.typeRef).toBe('/educational/StudentGradeMap');
                expect(studentGradesProperty?.inverseProp).toBe('courseGrades');
                expect(studentGradesProperty?.inverseTypeRef).toBe('/educational/Student');
            }
        });
        
        it('should have correct Map type definitions for bidirectional grade relationships', () => {
            registry.importNamespace(educationalNamespace);
            
            const courseGradeMapType = registry.getType('/educational/CourseGradeMap');
            expect(courseGradeMapType).toBeDefined();
            expect(courseGradeMapType?.kind).toBe('map');
            
            if (courseGradeMapType && courseGradeMapType.kind === 'map') {
                expect(courseGradeMapType.keyType).toBe('/educational/Course');
                expect(courseGradeMapType.valueType).toBe('number');
            }
            
            const studentGradeMapType = registry.getType('/educational/StudentGradeMap');
            expect(studentGradeMapType).toBeDefined();
            expect(studentGradeMapType?.kind).toBe('map');
            
            if (studentGradeMapType && studentGradeMapType.kind === 'map') {
                expect(studentGradeMapType.keyType).toBe('/educational/Student');
                expect(studentGradeMapType.valueType).toBe('number');
            }
        });
    });
});
