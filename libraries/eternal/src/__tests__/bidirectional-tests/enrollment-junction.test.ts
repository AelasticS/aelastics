import { IStore } from '../../interfaces/IStore';
import { createStore } from '../../store/createStore';
import { RegistryService } from '../../registry/RegistryService';
import { RegistryMetadata } from '../../registry/NamespaceMetadata';
import { educationalNamespace } from '../example-namespaces/educational-namespace';
import { coreNamespace } from '../example-namespaces/core-namespace';
import { authNamespace } from '../example-namespaces/auth-namespace';

// TypeScript interfaces for the test entities
interface Student {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    enrollments?: Set<Enrollment>;
}

interface Course {
    id: string;
    title: string;
    description?: string;
    dueDate?: Date;
    enrollments?: Set<Enrollment>;
}

interface Enrollment {
    id: string;
    student: Student;
    course: Course;
    grade?: number;
    enrollmentDate: Date;
    completionStatus: string;
}

describe('Enrollment Junction Entity Pattern', () => {
    let registry: RegistryService;
    let store: IStore;

    beforeEach(() => {
        const registryMetadata: RegistryMetadata = {
            namespaces: new Map(),
            name: "test-registry",
            version: "1.0.0"
        };
        registry = new RegistryService(registryMetadata);
        
        try {
            // Import required namespaces in dependency order
            registry.importNamespace(coreNamespace);
            registry.importNamespace(authNamespace);
            registry.importNamespace(educationalNamespace);

            store = createStore(registry);
        } catch (error) {
            console.error('Failed to setup test environment:', error);
            throw error;
        }
    });

    test('should create Enrollment and update both Student and Course Sets', () => {
        // Create student and course first
        const student = store.objects.create("/educational/Student", {
            id: "student-001",
            firstName: "John",
            lastName: "Doe", 
            email: "john.doe@university.edu",
            enrollmentDate: new Date(),
            isActive: true
        });

        const course = store.objects.create("/educational/Course", {
            id: "course-001",
            code: "MATH101",
            title: "Calculus I",
            credits: 3,
            startDate: new Date(),
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days later
            isActive: true,
            // teacher property omitted to avoid inheritance issues
        });

        // Create enrollment junction entity
        const enrollment = store.objects.create("/educational/Enrollment", {
            id: "enrollment-001",
            student: student,
            course: course,
            grade: 95,
            enrollmentDate: new Date(),
            completionStatus: "enrolled"
        });

        // Refresh references to get updated relationships
        const updatedStudent = store.objects.findByUUID<Student>(store.objects.getUUID(student))!;
        const updatedCourse = store.objects.findByUUID<Course>(store.objects.getUUID(course))!;

        // Test: Enrollment appears in both Student.enrollments and Course.enrollments Sets
        expect(updatedStudent.enrollments!.has(enrollment)).toBe(true);
        expect(updatedCourse.enrollments!.has(enrollment)).toBe(true);
        expect(updatedStudent.enrollments!.size).toBe(1);
        expect(updatedCourse.enrollments!.size).toBe(1);

        // Test: Bidirectional relationships work correctly
        expect(enrollment.student).toBe(updatedStudent);
        expect(enrollment.course).toBe(updatedCourse);
    });

    test('should maintain single source of truth for grades', () => {
        const student = store.objects.create("/educational/Student", {
            id: "student-002",
            firstName: "Jane",
            lastName: "Smith",
            email: "jane.smith@university.edu", 
            enrollmentDate: new Date(),
            isActive: true
        });

        const course = store.objects.create("/educational/Course", {
            id: "course-002",
            code: "PHYS101", 
            title: "Physics I",
            credits: 4,
            startDate: new Date(),
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            isActive: true,
            // teacher property omitted to avoid inheritance issues
        });

        let enrollment = store.objects.create("/educational/Enrollment", {
            id: "enrollment-002",
            student: student,
            course: course, 
            grade: 85,
            enrollmentDate: new Date(),
            completionStatus: "enrolled"
        });

        // Test: Grade exists only in Enrollment entity (single source of truth)
        expect(enrollment.grade).toBe(85);

        // Update grade - only one place to change it
        enrollment = store.objects.update(e => { e.grade = 92; }, enrollment);
        expect(enrollment.grade).toBe(92);

        // Refresh all references after update (critical for immutable store)
        const updatedStudent = store.objects.findByUUID<Student>(store.objects.getUUID(student))!;
        const updatedCourse = store.objects.findByUUID<Course>(store.objects.getUUID(course))!;
        const updatedEnrollment = store.objects.findByUUID<Enrollment>(store.objects.getUUID(enrollment))!;
        
        // Student and Course should not have grade properties (normalized design)
        expect(updatedStudent).not.toHaveProperty('courseGrades');
        expect(updatedCourse).not.toHaveProperty('studentGrades');
    });

    test('should support Set operations on enrollments', () => {
        const student = store.objects.create("/educational/Student", {
            id: "student-003",
            firstName: "Alice",
            lastName: "Johnson",
            email: "alice.johnson@university.edu",
            enrollmentDate: new Date(),
            isActive: true
        });

        const mathCourse = store.objects.create("/educational/Course", {
            id: "course-003",
            code: "MATH201",
            title: "Calculus II", 
            credits: 3,
            startDate: new Date(),
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            isActive: true,
            // teacher property omitted to avoid inheritance issues
        });

        const physicsCourse = store.objects.create("/educational/Course", {
            id: "course-004",
            code: "PHYS201",
            title: "Physics II",
            credits: 4,
            startDate: new Date(),
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            isActive: true,
            // teacher property omitted to avoid inheritance issues
        });

        // Create multiple enrollments
        const mathEnrollment = store.objects.create("/educational/Enrollment", {
            id: "enrollment-003",
            student: student,
            course: mathCourse,
            grade: 88,
            enrollmentDate: new Date(),
            completionStatus: "enrolled"
        });

        const physicsEnrollment = store.objects.create("/educational/Enrollment", {
            id: "enrollment-004", 
            student: student,
            course: physicsCourse,
            grade: 91,
            enrollmentDate: new Date(),
            completionStatus: "enrolled"
        });

        // Refresh references
        const updatedStudent = store.objects.findByUUID<Student>(store.objects.getUUID(student))!;
        const updatedMathCourse = store.objects.findByUUID<Course>(store.objects.getUUID(mathCourse))!;
        const updatedPhysicsCourse = store.objects.findByUUID<Course>(store.objects.getUUID(physicsCourse))!;

        // Test Set operations
        expect(updatedStudent.enrollments!.has(mathEnrollment)).toBe(true);
        expect(updatedStudent.enrollments!.has(physicsEnrollment)).toBe(true); 
        expect(updatedStudent.enrollments!.size).toBe(2);

        expect(updatedMathCourse.enrollments!.has(mathEnrollment)).toBe(true);
        expect(updatedMathCourse.enrollments!.has(physicsEnrollment)).toBe(false);
        expect(updatedMathCourse.enrollments!.size).toBe(1);

        expect(updatedPhysicsCourse.enrollments!.has(physicsEnrollment)).toBe(true);
        expect(updatedPhysicsCourse.enrollments!.has(mathEnrollment)).toBe(false);
        expect(updatedPhysicsCourse.enrollments!.size).toBe(1);
    });

    test('should maintain bidirectional consistency', () => {
        const student = store.objects.create("/educational/Student", {
            id: "student-004",
            firstName: "Bob", 
            lastName: "Davis",
            email: "bob.davis@university.edu",
            enrollmentDate: new Date(),
            isActive: true
        });

        const course = store.objects.create("/educational/Course", {
            id: "course-005",
            code: "CHEM101",
            title: "General Chemistry",
            credits: 3,
            startDate: new Date(), 
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            isActive: true,
            // teacher property omitted to avoid inheritance issues
        });

        // Create enrollment
        const enrollment = store.objects.create("/educational/Enrollment", {
            id: "enrollment-005",
            student: student,
            course: course,
            grade: 87,
            enrollmentDate: new Date(),
            completionStatus: "enrolled"
        });

        // Test initial bidirectional consistency - refresh all references after creation
        let updatedStudent = store.objects.findByUUID<Student>(store.objects.getUUID(student))!;
        let updatedCourse = store.objects.findByUUID<Course>(store.objects.getUUID(course))!;
        let updatedEnrollment = store.objects.findByUUID<Enrollment>(store.objects.getUUID(enrollment))!;

        expect(updatedStudent.enrollments!.has(updatedEnrollment)).toBe(true);
        expect(updatedCourse.enrollments!.has(updatedEnrollment)).toBe(true);
        expect(updatedEnrollment.student).toBe(updatedStudent);
        expect(updatedEnrollment.course).toBe(updatedCourse);

        // TODO: Test enrollment deletion when supported
        // When enrollment is deleted, it should be removed from both Sets
        // This would require store.objects.delete() functionality
    });

    test('should store additional enrollment metadata', () => {
        const student = store.objects.create("/educational/Student", {
            id: "student-005", 
            firstName: "Carol",
            lastName: "Miller",
            email: "carol.miller@university.edu",
            enrollmentDate: new Date(),
            isActive: true
        });

        const course = store.objects.create("/educational/Course", {
            id: "course-006",
            code: "BIO101",
            title: "General Biology",
            credits: 3,
            startDate: new Date(),
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 
            isActive: true,
            // teacher property omitted to avoid inheritance issues
        });

        const enrollmentDate = new Date();
        const enrollment = store.objects.create("/educational/Enrollment", {
            id: "enrollment-006",
            student: student,
            course: course,
            grade: 93,
            enrollmentDate: enrollmentDate,
            completionStatus: "completed"
        });

        // Refresh references after enrollment creation (critical for immutable store)
        const updatedStudent = store.objects.findByUUID<Student>(store.objects.getUUID(student))!;
        const updatedCourse = store.objects.findByUUID<Course>(store.objects.getUUID(course))!;
        const updatedEnrollment = store.objects.findByUUID<Enrollment>(store.objects.getUUID(enrollment))!;

        // Test rich data model beyond simple relationship
        expect(updatedEnrollment.grade).toBe(93);
        expect(updatedEnrollment.enrollmentDate).toEqual(enrollmentDate);
        expect(updatedEnrollment.completionStatus).toBe("completed");
        expect(updatedEnrollment.student).toBe(updatedStudent);
        expect(updatedEnrollment.course).toBe(updatedCourse);

        // Test that additional metadata can be updated
        const updatedEnrollmentAfterStatusChange = store.objects.update(e => {
            e.completionStatus = "withdrawn";
        }, updatedEnrollment);

        expect(updatedEnrollmentAfterStatusChange.completionStatus).toBe("withdrawn");
        expect(updatedEnrollmentAfterStatusChange.grade).toBe(93); // Other properties unchanged
    });

    test('should handle multiple enrollments per student and course', () => {
        // Create multiple students
        const student1 = store.objects.create("/educational/Student", {
            id: "student-006",
            firstName: "David",
            lastName: "Wilson", 
            email: "david.wilson@university.edu",
            enrollmentDate: new Date(),
            isActive: true
        });

        const student2 = store.objects.create("/educational/Student", {
            id: "student-007",
            firstName: "Emily",
            lastName: "Taylor",
            email: "emily.taylor@university.edu",
            enrollmentDate: new Date(), 
            isActive: true
        });

        // Create course
        const course = store.objects.create("/educational/Course", {
            id: "course-007",
            code: "HIST101", 
            title: "World History",
            credits: 3,
            startDate: new Date(),
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            isActive: true,
            // teacher property omitted to avoid inheritance issues
        });

        // Create multiple enrollments for the same course
        const enrollment1 = store.objects.create("/educational/Enrollment", {
            id: "enrollment-007",
            student: student1,
            course: course,
            grade: 89,
            enrollmentDate: new Date(),
            completionStatus: "enrolled"
        });

        const enrollment2 = store.objects.create("/educational/Enrollment", {
            id: "enrollment-008", 
            student: student2,
            course: course,
            grade: 94,
            enrollmentDate: new Date(),
            completionStatus: "enrolled"
        });

        // Refresh references
        const updatedStudent1 = store.objects.findByUUID<Student>(store.objects.getUUID(student1))!;
        const updatedStudent2 = store.objects.findByUUID<Student>(store.objects.getUUID(student2))!;
        const updatedCourse = store.objects.findByUUID<Course>(store.objects.getUUID(course))!;

        // Test: Course has multiple students enrolled
        expect(updatedCourse.enrollments!.has(enrollment1)).toBe(true);
        expect(updatedCourse.enrollments!.has(enrollment2)).toBe(true);
        expect(updatedCourse.enrollments!.size).toBe(2);

        // Test: Each student has their own enrollment
        expect(updatedStudent1.enrollments!.has(enrollment1)).toBe(true);
        expect(updatedStudent1.enrollments!.has(enrollment2)).toBe(false);
        expect(updatedStudent1.enrollments!.size).toBe(1);

        expect(updatedStudent2.enrollments!.has(enrollment2)).toBe(true);
        expect(updatedStudent2.enrollments!.has(enrollment1)).toBe(false);
        expect(updatedStudent2.enrollments!.size).toBe(1);

        // Test: Set uniqueness - each enrollment appears only once
        expect(enrollment1.student).toBe(updatedStudent1);
        expect(enrollment2.student).toBe(updatedStudent2);
        expect(enrollment1.course).toBe(updatedCourse);
        expect(enrollment2.course).toBe(updatedCourse);
    });
});