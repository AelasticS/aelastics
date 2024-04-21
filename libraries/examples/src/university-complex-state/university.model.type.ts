import * as t from "aelastics-types"

export const UniversitySchema = t.schema("UniversitySchema")

export const ID = t.number.derive("IDType").positive
export const Name = t.string.derive("Valid name").alphanumeric.maxLength(128)
export const Email = t.string.derive("Valid email").email
export const Age = t.number.derive("Valid student age").int8.positive.inRange(18, 99)
export const Grade = t.number.derive("Valid grade scale").int8.positive.inRange(1, 12)

export const Program = t.entity(
  {
    id: ID,
    name: Name,
    courses: t.arrayOf(t.link(UniversitySchema, "Course", "ProgramToCourseLink")),
    enrolledStudents: t.arrayOf(t.link(UniversitySchema, "Student", "ProgramToStudentLink")),
  },
  ["id"],
  "Program",
  UniversitySchema
)

export const Student = t.entity(
  {
    id: ID,
    name: Name,
    email: Email,
    enrolledProgram: Program || null,
    approvedCourses: t.arrayOf(t.link(UniversitySchema, "Course", "StudentToCourseLink")),
  },
  ["id"],
  "Student",
  UniversitySchema
)

export const Course = t.entity(
  {
    id: ID,
    name: Name,
    program: Program,
    students: t.arrayOf(Student),
    assignments: t.arrayOf(t.link(UniversitySchema, "Assignment", "CourseToAssignmentLink")),
  },
  ["id"],
  "Course",
  UniversitySchema
)

export const Assignment = t.entity(
  {
    id: ID,
    name: Name,
    description: t.string,
    course: t.link(UniversitySchema, "Course", "AssignmentToCourseLink"),
  },
  ["id"],
  "Assignment",
  UniversitySchema
)

export const Submission = t.entity(
  {
    id: ID,
    student: t.link(UniversitySchema, "Student", "SubmissionToStudentLink"),
    assignment: t.link(UniversitySchema, "Assignment", "SubmissionToAssignmentLink"),
    content: t.string,
    grade: Grade,
  },
  ["id"],
  "Submission",
  UniversitySchema
)

export type IProgram = t.TypeOf<typeof Program>
export type ICourse = t.TypeOf<typeof Course>
export type IAssignment = t.TypeOf<typeof Assignment>
export type ISubmission = t.TypeOf<typeof Submission>
export type IStudent = t.TypeOf<typeof Student>
