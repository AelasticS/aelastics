import * as t from "aelastics-types"

export const UniversitySchema = t.schema("UniversitySchema")

export const ID = t.number.derive("Valid id").positive
export const Name = t.string.derive('Valid name').alphanumeric.maxLength(128)
export const Email = t.string.derive("Valid email").email
export const Age = t.number.derive('Valid student age').int8.positive.inRange(18, 45);
export const BirthDate = t.date // new Date('1995-12-17')

// Create an enum to check the program type.
// Software Design
// Computer Science
// Data Science

export const Assignment = t.entity({
    id: ID,
    name: Name,
    description: t.string.alphanumeric.maxLength(250)
 }, ["id"], "Assignment", UniversitySchema)

export const Module = t.entity({
    id: ID,
    name: Name,
    // course:  make it a link to a specific course
    assignments: t.arrayOf(Assignment)
}, ["id"], "Module", UniversitySchema)

// Course type definition
export const Course = t.entity({
    id: ID,
    name: Name,
    program: t.string, // Replace this with Enum
    modules: t.arrayOf(Module)
}, ["id"], "Course", UniversitySchema)

// Student type definition
export const Student = t.entity({
    id: ID,
    name: Name,
    email: Email,
    age: Age,
    birthDate: BirthDate,
    // program: typeof ProgramName,
    enrolledCourses: t.arrayOf(Course),
}, ["id"], "Student", UniversitySchema)


// University type definition
export const University = t.entity({}, ["id"], "University", UniversitySchema)

export type IAssignment = t.TypeOf<typeof Assignment>
export type IModule = t.TypeOf<typeof Module>
export type ICourse = t.TypeOf<typeof Course>
export type IStudent = t.TypeOf<typeof Student>
export type IUniversity = t.TypeOf<typeof University>