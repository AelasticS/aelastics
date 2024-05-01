import * as t from "aelastics-types"

export const UniversitySchema = t.schema("UniversitySchema")

export const ID = t.number.derive("IDType").positive
export const Name = t.string.derive("Valid name").alphanumeric.maxLength(128)
export const Email = t.string.derive("Valid email").email
export const Age = t.number.derive("Valid student age").int8.positive.inRange(18, 99)
export const Grade = t.number.derive("Valid grade scale").int8.positive.inRange(1, 12)

export const ProgramType = t.entity(
  {
    id: ID,
    name: Name,
    courses: t.arrayOf(t.link(UniversitySchema, "Course", "ProgramToCourseLink")),
    students: t.arrayOf(t.link(UniversitySchema, "Student", "ProgramToStudentLink")),
  },
  ["id"],
  "Program",
  UniversitySchema
)

export const AddressType = t.object(
  { streetName: t.string, streetNumber: t.string, city: t.string, postNumber: t.string },
  "Child",
  UniversitySchema
)

export const BookType = t.entity(
  {
    id: ID,
    bookName: t.string,
    bookAuthor: t.string,
    course: t.link(UniversitySchema, "Course", "BookToCourseLink"),
  },
  ["id"],
  "Book",
  UniversitySchema
)

export const StudentType = t.entity(
  {
    id: ID,
    name: Name,
    email: Email,
    program: ProgramType,
    courses: t.arrayOf(t.link(UniversitySchema, "Course", "StudentToCourseLink")),
    address: AddressType,
    books: t.arrayOf(BookType),
    buddy: t.link(UniversitySchema, "Student", "StudentToStudentLink"),
  },
  ["id"],
  "Student",
  UniversitySchema
)

export const CourseType = t.entity(
  {
    id: ID,
    name: Name,
    program: ProgramType,
    students: t.arrayOf(StudentType),
    assignments: t.arrayOf(t.link(UniversitySchema, "Assignment", "CourseToAssignmentLink")),
    book: t.link(UniversitySchema, "Book", "CourseToBookLink"),
  },
  ["id"],
  "Course",
  UniversitySchema
)

export const AssignmentType = t.entity(
  {
    id: ID,
    name: Name,
    description: t.string,
    course: t.link(UniversitySchema, "Course", "AssignmentToCourseLink"),
    submissions: t.arrayOf(t.link(UniversitySchema, "Submission", "AssignmentToSubmissionLink")),
  },
  ["id"],
  "Assignment",
  UniversitySchema
)

export const SubmissionType = t.entity(
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

t.inverseProps(ProgramType, "courses", CourseType, "program")
t.inverseProps(ProgramType, "students", StudentType, "program")
t.inverseProps(StudentType, "courses", CourseType, "students")
t.inverseProps(StudentType, "buddy", StudentType, "buddy")
t.inverseProps(CourseType, "assignments", AssignmentType, "course")
t.inverseProps(CourseType, "book", BookType, "course")
t.inverseProps(AssignmentType, "submissions", SubmissionType, "assignment")

export type IProgram = t.TypeOf<typeof ProgramType>
export type ICourse = t.TypeOf<typeof CourseType>
export type IAssignment = t.TypeOf<typeof AssignmentType>
export type ISubmission = t.TypeOf<typeof SubmissionType>
export type IStudent = t.TypeOf<typeof StudentType>
