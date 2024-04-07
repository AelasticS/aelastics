import * as t from "aelastics-types"

export const UniversitySchema = t.schema("UniversitySchema")

export const ID = t.number.derive("Valid id").positive
export const Name = t.string.derive('Valid name').alphanumeric.maxLength(128)
export const Email = t.string.derive("Valid email").email
export const Age = t.number.derive('Valid student age').int8.positive.inRange(18, 45);
export const BirthDate = t.date // new Date('1995-12-17')


export const Assignment = t.entity({
    id: ID,
    name: Name,
    description: t.string.alphanumeric.maxLength(250)
 }, ["id"], "Assignment", UniversitySchema)

export const Module = t.entity({
    id: ID,
    name: Name,
    course: t.link(UniversitySchema, 'Course', 'ModuleToCourseLink'),
    assignments: t.arrayOf(Assignment)
}, ["id"], "Module", UniversitySchema)

export const Course = t.entity({
    id: ID,
    name: Name,
    program: t.link(UniversitySchema, 'Program', 'CourseToProgramLink'),
    modules: t.arrayOf(t.link(UniversitySchema, 'Module', 'CourseToModuleLink'))
}, ["id"], "Course", UniversitySchema)

export const Student = t.entity({
    id: ID,
    name: Name,
    email: Email,
    enrolledProgram: t.string, // link to specific program?
    approvedCourses: t.arrayOf(t.link(UniversitySchema, 'Course', 'StudentToCourseLink')),
    approvedAssignments: t.arrayOf(t.link(UniversitySchema, 'Assignment', 'StudentToAssignmentLink')) 
}, ["id"], "Student", UniversitySchema)

export const Program = t.entity({
    id: ID,
    name: Name,
    courses: t.arrayOf(t.link(UniversitySchema, "Course", "ProgramToCourseLink")) 
}, ["id"], "Program", UniversitySchema)

export const University = t.entity({
    id: ID,
    name: Name,
    programs: t.string, // Replace this with Enum
    students: t.arrayOf(t.link(UniversitySchema, "Student", "UniversityToStudentLink")) 
}, ["id"], "University", UniversitySchema)


export type IAssignment = t.TypeOf<typeof Assignment>
export type IModule = t.TypeOf<typeof Module>
export type ICourse = t.TypeOf<typeof Course>
export type IStudent = t.TypeOf<typeof Student>
export type IProgram = t.TypeOf<typeof Program>
export type IUniversity = t.TypeOf<typeof University>