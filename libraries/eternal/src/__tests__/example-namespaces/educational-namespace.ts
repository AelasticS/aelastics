import { Namespace } from "../../registry/NamespaceMetadata";
import { ObjectTypeMeta, PropertyMeta, ArrayTypeMeta, SetTypeMeta, MapTypeMeta, TypeMeta } from "../../registry/TypeDefinitions";

// ===== COLLECTION TYPES =====

// Array type for students
const studentArrayType: ArrayTypeMeta = {
    qName: "/educational/StudentArray",
    category: "complex",
    kind: "array",
    elementType: "/educational/Student"
};

// Array type for courses
const courseArrayType: ArrayTypeMeta = {
    qName: "/educational/CourseArray",
    category: "complex",
    kind: "array",
    elementType: "/educational/Course"
};

// Array type for assignments
const assignmentArrayType: ArrayTypeMeta = {
    qName: "/educational/AssignmentArray",
    category: "complex",
    kind: "array",
    elementType: "/educational/Assignment"
};

// Set type for subjects
const subjectSetType: SetTypeMeta = {
    qName: "/educational/SubjectSet",
    category: "complex",
    kind: "set",
    elementType: "string"
};

// Map type for grades (student ID -> grade)
const gradeMapType: MapTypeMeta = {
    qName: "/educational/GradeMap",
    category: "complex",
    kind: "map",
    keyType: "string",
    valueType: "number"
};

// ===== MAIN ENTITY TYPES =====

// Student entity
const studentType: ObjectTypeMeta = {
    qName: "/educational/Student",
    category: "complex",
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
            inverseType: "array"
        }],
        ["assignments", {
            name: "assignments",
            typeRef: "/educational/AssignmentArray",
            optional: true,
            // One-to-many: Student has many assignments
            inverseProp: "student",
            inverseTypeRef: "/educational/Assignment",
            inverseType: "object"
        }]
    ]),
    identityKeys: ["id"],
    roles: ["/core/Auditable", "/core/Timestampable"]
};

// Teacher entity (inherits from imported User)
const teacherType: ObjectTypeMeta = {
    qName: "/educational/Teacher",
    category: "complex",
    kind: "entity",
    extends: "BaseUser", // This will be resolved from imports
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
            inverseType: "object"
        }]
    ]),
    identityKeys: ["id"],
    roles: ["/core/Auditable", "/core/Timestampable", "/core/Versionable"]
};

// Course entity with many-to-many relationships
const courseType: ObjectTypeMeta = {
    qName: "/educational/Course",
    category: "complex",
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
            optional: false,
            // Many-to-one: Course has one teacher
            inverseProp: "courses",
            inverseTypeRef: "/educational/Teacher",
            inverseType: "array"
        }],
        ["enrolledStudents", {
            name: "enrolledStudents",
            typeRef: "/educational/StudentArray",
            optional: true,
            // Many-to-many: Course has many students
            inverseProp: "courses",
            inverseTypeRef: "/educational/Student",
            inverseType: "array"
        }],
        ["assignments", {
            name: "assignments",
            typeRef: "/educational/AssignmentArray",
            optional: true,
            // One-to-many: Course has many assignments
            inverseProp: "course",
            inverseTypeRef: "/educational/Assignment",
            inverseType: "object"
        }],
        ["grades", {
            name: "grades",
            typeRef: "/educational/GradeMap",
            optional: true
        }]
    ]),
    identityKeys: ["id"],
    roles: ["/core/Auditable", "/core/Timestampable", "/core/Versionable"]
};

// Assignment entity
const assignmentType: ObjectTypeMeta = {
    qName: "/educational/Assignment",
    category: "complex",
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
            inverseType: "array"
        }],
        ["student", {
            name: "student",
            typeRef: "/educational/Student",
            optional: false,
            // Many-to-one: Assignment belongs to one student
            inverseProp: "assignments",
            inverseTypeRef: "/educational/Student",
            inverseType: "array"
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
        ["StudentArray", studentArrayType],
        ["CourseArray", courseArrayType],
        ["AssignmentArray", assignmentArrayType],
        ["SubjectSet", subjectSetType],
        ["GradeMap", gradeMapType]
    ]),
    exports: ["Student", "Teacher", "Course", "Assignment", "StudentArray", "CourseArray", "AssignmentArray", "SubjectSet", "GradeMap"],
    imports: new Map([
        // Mixed import: wildcard + specific + alias
        ["/auth", ["*", { original: "User", alias: "BaseUser" }]],
        ["/core", ["AuditableRole", "TimestampableRole"]]
    ])
};