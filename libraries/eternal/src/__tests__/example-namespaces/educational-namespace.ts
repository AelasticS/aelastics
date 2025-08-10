import { Namespace } from "../../registry/NamespaceMetadata";
import { ObjectTypeMeta, PropertyMeta, ArrayTypeMeta, SetTypeMeta, MapTypeMeta, TypeMeta } from "../../registry/TypeDefinitions";

// ===== COLLECTION TYPES =====

// Array type for students
const studentArrayType: ArrayTypeMeta = {
    qName: "/educational/StudentArray",
    kind: "array",
    elementType: "/educational/Student"
};

// Array type for courses
const courseArrayType: ArrayTypeMeta = {
    qName: "/educational/CourseArray",
    kind: "array",
    elementType: "/educational/Course"
};

// Array type for assignments
const assignmentArrayType: ArrayTypeMeta = {
    qName: "/educational/AssignmentArray",
    kind: "array",
    elementType: "/educational/Assignment"
};

// Set type for subjects
const subjectSetType: SetTypeMeta = {
    qName: "/educational/SubjectSet",
    kind: "set",
    elementType: "string"
};

// Map type for grades (student ID -> grade)
const gradeMapType: MapTypeMeta = {
    qName: "/educational/GradeMap",
    kind: "map",
    keyType: "string",
    valueType: "number"
};


// Set type for enrollments (replaces Map-based denormalized pattern)
const enrollmentSetType: SetTypeMeta = {
    qName: "/educational/EnrollmentSet",
    kind: "set",
    elementType: "/educational/Enrollment"
};

// ===== MAIN ENTITY TYPES =====

// Student entity
const studentType: ObjectTypeMeta = {
    qName: "/educational/Student",
    kind: "entity",
    properties: new Map<string, PropertyMeta>([
        ["id", {
            name: "id",
            typeRef: "string",
            optional: false
        }],
        ["firstName", {
            name: "firstName",
            typeRef: "string",
            optional: false
        }],
        ["lastName", {
            name: "lastName",
            typeRef: "string",
            optional: false
        }],
        ["email", {
            name: "email",
            typeRef: "string",
            optional: false
        }],
        ["dateOfBirth", {
            name: "dateOfBirth",
            typeRef: "date",
            optional: true
        }],
        ["enrollmentDate", {
            name: "enrollmentDate",
            typeRef: "date",
            optional: false
        }],
        ["isActive", {
            name: "isActive",
            typeRef: "boolean",
            optional: false
        }],
        ["courses", {
            name: "courses",
            typeRef: "/educational/CourseArray",
            optional: true,
            // Many-to-many: Student enrolls in many courses
            inverseProp: "enrolledStudents",
            inverseTypeRef: "/educational/Course",
        }],
        ["assignments", {
            name: "assignments",
            typeRef: "/educational/AssignmentArray",
            optional: true,
            // One-to-many: Student has many assignments
            inverseProp: "student",
            inverseTypeRef: "/educational/Assignment",
        }],
        ["enrollments", {
            name: "enrollments",
            typeRef: "/educational/EnrollmentSet",
            optional: true,
            // Many-to-many via junction: Student has many Enrollments
            inverseProp: "student",
            inverseTypeRef: "/educational/Enrollment"
        }]
    ]),
    identityKeys: ["id"],
    roles: ["/core/Auditable", "/core/Timestampable"]
};

// Teacher entity (inherits from imported User)
const teacherType: ObjectTypeMeta = {
    qName: "/educational/Teacher",
    kind: "entity",
    extends: "/auth/User", // Proper inheritance from auth User
    properties: new Map<string, PropertyMeta>([
        ["employeeId", {
            name: "employeeId",
            typeRef: "string",
            optional: false
        }],
        ["department", {
            name: "department",
            typeRef: "string",
            optional: false
        }],
        ["hireDate", {
            name: "hireDate",
            typeRef: "date",
            optional: false
        }],
        ["subjects", {
            name: "subjects",
            typeRef: "/educational/SubjectSet",
            optional: true
        }],
        ["courses", {
            name: "courses",
            typeRef: "/educational/CourseArray",
            optional: true,
            // One-to-many: Teacher teaches many courses
            inverseProp: "teacher",
            inverseTypeRef: "/educational/Course",
        }]
    ]),
    identityKeys: ["id"],
    roles: ["/core/Auditable", "/core/Timestampable", "/core/Versionable"]
};

// Course entity with many-to-many relationships
const courseType: ObjectTypeMeta = {
    qName: "/educational/Course",
    kind: "entity",
    properties: new Map<string, PropertyMeta>([
        ["id", {
            name: "id",
            typeRef: "string",
            optional: false
        }],
        ["code", {
            name: "code",
            typeRef: "string",
            optional: false
        }],
        ["title", {
            name: "title",
            typeRef: "string",
            optional: false
        }],
        ["description", {
            name: "description",
            typeRef: "string",
            optional: true
        }],
        ["credits", {
            name: "credits",
            typeRef: "number",
            optional: false
        }],
        ["startDate", {
            name: "startDate",
            typeRef: "date",
            optional: false
        }],
        ["endDate", {
            name: "endDate",
            typeRef: "date",
            optional: false
        }],
        ["isActive", {
            name: "isActive",
            typeRef: "boolean",
            optional: false
        }],
        ["teacher", {
            name: "teacher",
            typeRef: "/educational/Teacher",
            optional: true,  // Made optional to avoid inheritance issues in tests
            // Many-to-one: Course has one teacher
            inverseProp: "courses",
            inverseTypeRef: "/educational/Teacher",
        }],
        ["enrolledStudents", {
            name: "enrolledStudents",
            typeRef: "/educational/StudentArray",
            optional: true,
            // Many-to-many: Course has many students
            inverseProp: "courses",
            inverseTypeRef: "/educational/Student",
        }],
        ["assignments", {
            name: "assignments",
            typeRef: "/educational/AssignmentArray",
            optional: true,
            // One-to-many: Course has many assignments
            inverseProp: "course",
            inverseTypeRef: "/educational/Assignment",
        }],
        ["grades", {
            name: "grades",
            typeRef: "/educational/GradeMap",
            optional: true
        }],
        ["enrollments", {
            name: "enrollments",
            typeRef: "/educational/EnrollmentSet", 
            optional: true,
            // Many-to-many via junction: Course has many Enrollments
            inverseProp: "course",
            inverseTypeRef: "/educational/Enrollment"
        }]
    ]),
    identityKeys: ["id"],
    roles: ["/core/Auditable", "/core/Timestampable", "/core/Versionable"]
};

// Enrollment junction entity (replaces denormalized courseGrades ↔ studentGrades Maps)
const enrollmentType: ObjectTypeMeta = {
    qName: "/educational/Enrollment",
    kind: "entity",
    properties: new Map<string, PropertyMeta>([
        ["id", {
            name: "id",
            typeRef: "string",
            optional: false
        }],
        ["student", {
            name: "student",
            typeRef: "/educational/Student",
            optional: false,
            // Bidirectional: Enrollment.student ↔ Student.enrollments
            inverseProp: "enrollments",
            inverseTypeRef: "/educational/Student"
        }],
        ["course", {
            name: "course",
            typeRef: "/educational/Course",
            optional: false,
            // Bidirectional: Enrollment.course ↔ Course.enrollments
            inverseProp: "enrollments",
            inverseTypeRef: "/educational/Course"
        }],
        ["grade", {
            name: "grade",
            typeRef: "number",
            optional: true  // Single source of truth for grade data
        }],
        ["enrollmentDate", {
            name: "enrollmentDate",
            typeRef: "date",
            optional: false
        }],
        ["completionStatus", {
            name: "completionStatus",
            typeRef: "string",
            optional: false
        }]
    ]),
    identityKeys: ["id"],
    roles: ["/core/Auditable", "/core/Timestampable"]
};

// Assignment entity
const assignmentType: ObjectTypeMeta = {
    qName: "/educational/Assignment",
    kind: "entity",
    properties: new Map<string, PropertyMeta>([
        ["id", {
            name: "id",
            typeRef: "string",
            optional: false
        }],
        ["title", {
            name: "title",
            typeRef: "string",
            optional: false
        }],
        ["description", {
            name: "description",
            typeRef: "string",
            optional: true
        }],
        ["dueDate", {
            name: "dueDate",
            typeRef: "date",
            optional: false
        }],
        ["maxPoints", {
            name: "maxPoints",
            typeRef: "number",
            optional: false
        }],
        ["submittedAt", {
            name: "submittedAt",
            typeRef: "date",
            optional: true
        }],
        ["grade", {
            name: "grade",
            typeRef: "number",
            optional: true
        }],
        ["course", {
            name: "course",
            typeRef: "/educational/Course",
            optional: false,
            // Many-to-one: Assignment belongs to one course
            inverseProp: "assignments",
            inverseTypeRef: "/educational/Course",
        }],
        ["student", {
            name: "student",
            typeRef: "/educational/Student",
            optional: false,
            // Many-to-one: Assignment belongs to one student
            inverseProp: "assignments",
            inverseTypeRef: "/educational/Student",
        }]
    ]),
    identityKeys: ["id"],
    roles: ["/core/Auditable", "/core/Timestampable"]
};

// Export the educational namespace with mixed imports
export const educationalNamespace: Namespace = {
    qName: "/educational",
    version: "1.0.0",
    types: new Map<string, TypeMeta>([
        ["Student", studentType],
        ["Teacher", teacherType],
        ["Course", courseType],
        ["Assignment", assignmentType],
        ["Enrollment", enrollmentType],
        ["StudentArray", studentArrayType],
        ["CourseArray", courseArrayType],
        ["AssignmentArray", assignmentArrayType],
        ["SubjectSet", subjectSetType],
        ["EnrollmentSet", enrollmentSetType],
        ["GradeMap", gradeMapType],
    ]),
    exports: ["Student", "Teacher", "Course", "Assignment", "Enrollment", "StudentArray", "CourseArray", "AssignmentArray", "SubjectSet", "EnrollmentSet", "GradeMap"],
    imports: new Map([
        // Import User from auth namespace
        ["/auth", ["User"]],
        ["/core", ["AuditableRole", "TimestampableRole"]]
    ])
};