import { RegistryService } from "../registry/RegistryService";
import { RegistryMetadata } from "../registry/NamespaceMetadata";
import { companyNamespace } from "./example-namespaces/company-namespace";
import { educationalNamespace } from "./example-namespaces/educational-namespace";
import { coreNamespace } from "./example-namespaces/core-namespace";
import { authNamespace } from "./example-namespaces/auth-namespace";

describe('Educational Namespace - Junction Entity Pattern', () => {
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
            }
        });
    });

    describe('Educational namespace - Junction Entity Pattern', () => {
        it('should successfully import educational namespace with Enrollment junction entity', () => {
            registry.importNamespace(educationalNamespace);
            
            // Verify core educational types exist
            expect(registry.hasType('/educational/Student')).toBe(true);
            expect(registry.hasType('/educational/Course')).toBe(true);
            expect(registry.hasType('/educational/Enrollment')).toBe(true);
            expect(registry.hasType('/educational/EnrollmentSet')).toBe(true);
        });
        
        it('should have correct bidirectional relationships with Enrollment junction entity', () => {
            registry.importNamespace(educationalNamespace);
            
            const studentType = registry.getType('/educational/Student');
            expect(studentType).toBeDefined();
            expect(studentType?.kind).toBe('entity');
            
            if (studentType && studentType.kind === 'entity') {
                // Test new normalized pattern: Student.enrollments Set
                const enrollmentsProperty = studentType.properties.get('enrollments');
                expect(enrollmentsProperty).toBeDefined();
                expect(enrollmentsProperty?.typeRef).toBe('/educational/EnrollmentSet');
                expect(enrollmentsProperty?.inverseProp).toBe('student');
                expect(enrollmentsProperty?.inverseTypeRef).toBe('/educational/Enrollment');
                
                // Verify old denormalized property is removed
                const courseGradesProperty = studentType.properties.get('courseGrades');
                expect(courseGradesProperty).toBeUndefined();
            }
            
            const courseType = registry.getType('/educational/Course');
            expect(courseType).toBeDefined();
            expect(courseType?.kind).toBe('entity');
            
            if (courseType && courseType.kind === 'entity') {
                // Test new normalized pattern: Course.enrollments Set
                const enrollmentsProperty = courseType.properties.get('enrollments');
                expect(enrollmentsProperty).toBeDefined();
                expect(enrollmentsProperty?.typeRef).toBe('/educational/EnrollmentSet');
                expect(enrollmentsProperty?.inverseProp).toBe('course');
                expect(enrollmentsProperty?.inverseTypeRef).toBe('/educational/Enrollment');
                
                // Verify old denormalized property is removed  
                const studentGradesProperty = courseType.properties.get('studentGrades');
                expect(studentGradesProperty).toBeUndefined();
            }
        });
        
        it('should have correct Enrollment junction entity definition', () => {
            registry.importNamespace(educationalNamespace);
            
            const enrollmentType = registry.getType('/educational/Enrollment');
            expect(enrollmentType).toBeDefined();
            expect(enrollmentType?.kind).toBe('entity');
            
            if (enrollmentType && enrollmentType.kind === 'entity') {
                // Verify junction entity has proper relationships
                const studentProperty = enrollmentType.properties.get('student');
                expect(studentProperty).toBeDefined();
                expect(studentProperty?.typeRef).toBe('/educational/Student');
                expect(studentProperty?.inverseProp).toBe('enrollments');
                expect(studentProperty?.inverseTypeRef).toBe('/educational/Student');
                
                const courseProperty = enrollmentType.properties.get('course');
                expect(courseProperty).toBeDefined();
                expect(courseProperty?.typeRef).toBe('/educational/Course');
                expect(courseProperty?.inverseProp).toBe('enrollments');
                expect(courseProperty?.inverseTypeRef).toBe('/educational/Course');
                
                // Verify junction entity has grade data (single source of truth)
                const gradeProperty = enrollmentType.properties.get('grade');
                expect(gradeProperty).toBeDefined();
                expect(gradeProperty?.typeRef).toBe('number');
                expect(gradeProperty?.optional).toBe(true);
                
                // Verify additional metadata properties
                const enrollmentDateProperty = enrollmentType.properties.get('enrollmentDate');
                expect(enrollmentDateProperty).toBeDefined();
                expect(enrollmentDateProperty?.typeRef).toBe('date');
                
                const completionStatusProperty = enrollmentType.properties.get('completionStatus');
                expect(completionStatusProperty).toBeDefined();
                expect(completionStatusProperty?.typeRef).toBe('string');
            }
        });
        
        it('should have correct Set collection type for enrollments', () => {
            registry.importNamespace(educationalNamespace);
            
            const enrollmentSetType = registry.getType('/educational/EnrollmentSet');
            expect(enrollmentSetType).toBeDefined();
            expect(enrollmentSetType?.kind).toBe('set');
            
            if (enrollmentSetType && enrollmentSetType.kind === 'set') {
                expect(enrollmentSetType.elementType).toBe('/educational/Enrollment');
            }
        });
        
        it('should maintain existing valid relationships unchanged', () => {
            registry.importNamespace(educationalNamespace);
            
            // Verify other relationships remain intact
            const studentType = registry.getType('/educational/Student');
            if (studentType && studentType.kind === 'entity') {
                // Student-Course many-to-many relationship should still exist
                const coursesProperty = studentType.properties.get('courses');
                expect(coursesProperty).toBeDefined();
                expect(coursesProperty?.typeRef).toBe('/educational/CourseArray');
                expect(coursesProperty?.inverseProp).toBe('enrolledStudents');
                
                // Student-Assignment one-to-many should still exist
                const assignmentsProperty = studentType.properties.get('assignments');
                expect(assignmentsProperty).toBeDefined();
                expect(assignmentsProperty?.typeRef).toBe('/educational/AssignmentArray');
                expect(assignmentsProperty?.inverseProp).toBe('student');
            }
            
            const courseType = registry.getType('/educational/Course');
            if (courseType && courseType.kind === 'entity') {
                // Course-Teacher many-to-one should still exist
                const teacherProperty = courseType.properties.get('teacher');
                expect(teacherProperty).toBeDefined();
                expect(teacherProperty?.typeRef).toBe('/educational/Teacher');
                expect(teacherProperty?.inverseProp).toBe('courses');
            }
        });

        it('should verify old denormalized Map types have been completely removed', () => {
            registry.importNamespace(educationalNamespace);
            
            // Verify the old denormalized Map types are completely gone
            expect(registry.hasType('/educational/CourseGradeMap')).toBe(false);
            expect(registry.hasType('/educational/StudentGradeMap')).toBe(false);
            
            // And the new normalized types exist instead
            expect(registry.hasType('/educational/Enrollment')).toBe(true);
            expect(registry.hasType('/educational/EnrollmentSet')).toBe(true);
        });
    });
});