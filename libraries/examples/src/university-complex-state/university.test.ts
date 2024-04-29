import { ImmutableStore } from "aelastics-store"
import {
  AddressType,
  AssignmentType,
  BookType,
  CourseType,
  ProgramType,
  StudentType,
  SubmissionType,
  UniversitySchema,
} from "./university.model.type"
import { v4 as uuidv4 } from "uuid"

export const uuidv4Generator = () => {
  return uuidv4()
}

// describe("create new object in immutable store", () => {
//   const immutableStore = new ImmutableStore()
//   const softwareDesign = immutableStore.newObject(Program, {
//     id: uuidv4Generator(),
//     name: "Software Design",
//     courses: [],
//     enrolledStudents: [],
//   })

//   const pcpp = immutableStore.newObject(Course, {
//     id: uuidv4Generator(),
//     name: "PCPP",
//     program: softwareDesign,
//     students: [],
//     assignments: [],
//   })

//   const pcppAssignment = immutableStore.newObject(Assignment, {
//     id: uuidv4Generator(),
//     name: "PCPP Assignment",
//     description: "PCPP assignment description",
//     course: pcpp,
//   })
// })

describe("One-to-One Relationship with ID", () => {
  const immutableStore = new ImmutableStore()

  const course1 = immutableStore.newObject(CourseType, {
    id: "c1",
    name: "Course 1",
    program: undefined,
    students: [],
    assignments: [],
    book: undefined,
  })

  const course2 = immutableStore.newObject(CourseType, {
    id: "c2",
    name: "Course 2",
    program: undefined,
    students: [],
    assignments: [],
    book: undefined,
  })

  const Program1 = immutableStore.newObject(ProgramType, {
    id: "p1",
    name: "Program 1",
    courses: [],
    students: [],
  })

  // create new book:
  const book1 = immutableStore.newObject(BookType, {
    id: "b1",
    bookName: "Book 1",
    bookAuthor: "Author 1",
    course: undefined,
  })

  const book2 = immutableStore.newObject(BookType, {
    id: "b1",
    bookName: "Book 2",
    bookAuthor: "Author 2",
    course: undefined,
  })

  const student1 = immutableStore.newObject(StudentType, {
    id: "s1",
    name: "Student 1",
    email: "student1@example.com",
    program: undefined,
    courses: [],
    address: undefined,
    books: [],
    buddy: undefined,
  })

  const student2 = immutableStore.newObject(StudentType, {
    id: "s1",
    name: "Student 1",
    email: "student1@example.com",
    program: Program1,
    courses: [course1],
    address: undefined,
    books: [book1],
    buddy: student1,
  })

  test("should set and get one-to-one relationship with ID", () => {
    course1.book = book1
    book2.course = course2

    expect(course1.book).toBe(book1)
    expect(book1.course).toBe(course1)

    expect(course2.book).toBe(book2)
    expect(book2.course).toBe(course2)

    // course1.addStudents(student1)
    // student1.program = Program1
  })
})

describe("One-to-Many Relationship with ID", () => {
  const immutableStore = new ImmutableStore()

  const program1 = immutableStore.newObject(ProgramType, {
    id: "p1",
    name: "Program 1",
    courses: [],
    students: [],
  })

  const course1 = immutableStore.newObject(CourseType, {
    id: "c1",
    name: "Course 1",
    program: undefined,
    students: [],
    assignments: [],
    book: undefined,
  })

  const course2 = immutableStore.newObject(CourseType, {
    id: "c2",
    name: "Course 2",
    program: undefined,
    students: [],
    assignments: [],
    book: undefined,
  })

  test("should set and get one-to-many relationship with ID", () => {
    program1.addCourses(course1)
    program1.addCourses(course2)
    expect(program1.courses).toStrictEqual([course1, course2])

    program1.removeCourses(course2)
    expect(program1.courses).toStrictEqual([course1])

    program1.removeCourses(course1)
    expect(course1.program).toBe(undefined)
  })
})

describe("Many-to-Many Relationship with ID", () => {
  const immutableStore = new ImmutableStore()

  const student1 = immutableStore.newObject(StudentType, {
    id: "s1",
    name: "Student 1",
    email: "student1@example.com",
    program: undefined,
    courses: [],
    address: undefined,
    books: [],
    buddy: undefined,
  })

  const course1 = immutableStore.newObject(CourseType, {
    id: "c1",
    name: "Course 1",
    program: undefined,
    students: [],
    assignments: [],
    book: undefined,
  })

  const course2 = immutableStore.newObject(CourseType, {
    id: "c2",
    name: "Course 2",
    program: undefined,
    students: [],
    assignments: [],
    book: undefined,
  })

  test("should set and get many-to-many relationship with ID", () => {
    student1.addCourses(course1)
    student1.addCourses(course2)

    expect(student1.courses).toStrictEqual([course1, course2])
    expect(course1.students).toStrictEqual([student1])

    student1.removeCourses(course2)
    expect(student1.courses).toStrictEqual([course1])
    expect(course2.students).toStrictEqual([])
  })
})

describe("defineComplexObjectProp", () => {
  const immutableStore = new ImmutableStore()

  const student1 = immutableStore.newObject(StudentType, {
    id: "s1",
    name: "Student 1",
    email: "student1@example.com",
    program: undefined,
    courses: [],
    address: undefined,
    books: [],
    buddy: undefined,
  })

  const address = immutableStore.newObject(AddressType, {
    streetName: "street",
    streetNumber: "1",
    city: "city",
    postNumber: "1",
  })

  it("should set and get complex object property for Student", () => {
    student1.address = address
    expect(student1.address).toBe(address)
  })
})

describe("defineComplexArrayProp", () => {
  const immutableStore = new ImmutableStore()

  const student1 = immutableStore.newObject(StudentType, {
    id: "s1",
    name: "Student 1",
    email: "student1@example.com",
    program: undefined,
    courses: [],
    address: undefined,
    books: [],
    buddy: undefined,
  })

  const book1 = immutableStore.newObject(BookType, {
    id: "b1",
    bookName: "Book 1",
    bookAuthor: "Author 1",
    course: undefined,
  })

  const book2 = immutableStore.newObject(BookType, {
    id: "b2",
    bookName: "Book 2",
    bookAuthor: "Author 2",
    course: undefined,
  })

  it("should add and remove items from complex array property for Student", () => {
    student1.addBooks(book1)
    student1.addBooks(book2)
    expect(student1.books).toStrictEqual([book1, book2])

    student1.removeBooks(book2)
    expect(student1.books).toStrictEqual([book1])
  })
})
