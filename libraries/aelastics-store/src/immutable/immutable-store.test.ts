import * as t from "aelastics-types"
import { ImmutableStore } from "./immutable-store"
import { ImmutableObject } from "../common/CommonConstants"

describe("ImmutableStore", () => {
  // Define the schema for the university domain
  const UniversitySchema = t.schema("UniversitySchema")

  // Define the object types for the university domain
  const ProgramType = t.entity(
    {
      id: t.string,
      name: t.string,
      courses: t.arrayOf(t.link(UniversitySchema, "Course", "CourseType")),
      students: t.arrayOf(t.link(UniversitySchema, "Student", "StudentType")),
    },
    ["id"],
    "Program",
    UniversitySchema
  )

  const AddressType = t.object(
    { streetName: t.string, streetNumber: t.string, city: t.string, postNumber: t.string },
    "Child",
    UniversitySchema
  )

  const BookType = t.entity(
    {
      id: t.string,
      bookName: t.string,
      bookAuthor: t.string,
      course: t.optional(t.link(UniversitySchema, "Course", "BookToCourseLink")),
    },
    ["id"],
    "Book",
    UniversitySchema
  )

  const StudentType = t.entity(
    {
      id: t.string,
      name: t.string,
      program: t.optional(ProgramType),
      courses: t.arrayOf(t.link(UniversitySchema, "Course", "StudentToCourseLink")),
      address: t.optional(AddressType),
      books: t.arrayOf(BookType),
      buddy: t.optional(t.link(UniversitySchema, "Student", "StudentToStudentLink")),
    },
    ["id"],
    "Student",
    UniversitySchema
  )

  const CourseType = t.entity(
    {
      id: t.string,
      name: t.string,
      program: t.optional(ProgramType),
      students: t.arrayOf(StudentType),
      assignments: t.arrayOf(t.link(UniversitySchema, "Assignment", "CourseToAssignmentLink")),
      book: t.optional(t.link(UniversitySchema, "Book", "CourseToBookLink")),
    },
    ["id"],
    "Course",
    UniversitySchema
  )

  // Define the inverse properties for the university domain
  t.inverseProps(ProgramType, "courses", CourseType, "program")
  t.inverseProps(ProgramType, "students", StudentType, "program")
  t.inverseProps(StudentType, "courses", CourseType, "students")
  t.inverseProps(StudentType, "buddy", StudentType, "buddy")
  t.inverseProps(CourseType, "book", BookType, "course")

  // Define the interface types for the university domain
  type IProgramType = t.TypeOf<typeof ProgramType>
  type ICourseType = t.TypeOf<typeof CourseType>
  type IStudentType = t.TypeOf<typeof StudentType>
  type IBookType = t.TypeOf<typeof BookType>
  type IAdressType = t.TypeOf<typeof AddressType>

  describe("createRoot method", () => {
    test("should initialize a root state", () => {
      // Arrange
      const student: IStudentType = {
        id: "1",
        name: "student 1",
        program: undefined,
        courses: [],
        address: undefined,
        books: [],
        buddy: undefined,
      }

      // Act
      let immutableStore: ImmutableStore<IStudentType> = new ImmutableStore<IStudentType>(StudentType)
      const root: ImmutableObject = immutableStore.createRoot(student, "1") as unknown as ImmutableObject

      // Assert
      expect(root).toBeDefined()
    })
  })

  describe("produce method", () => {
    test("should create a new instance of the state root when a simple prop of it is updated", () => {
      // Arrange
      const program: IProgramType = {
        id: "1",
        name: "program 1",
        courses: [],
        students: [],
      }

      let immutableStore: ImmutableStore<IProgramType> = new ImmutableStore<IProgramType>(ProgramType)
      const root = immutableStore.createRoot(program, "1") as unknown as IProgramType

      // Act
      const updatedProgram = immutableStore.produce((draft) => {
        draft.name = "program 1 updated"
      })

      // Assert
      expect(root).not.toBe(updatedProgram)
      expect(root.name).toBe("program 1")
      expect(updatedProgram.name).toEqual("program 1 updated")
    })

    test("should create a new instance of the state root when a simple prop of a nested object is updated", () => {
      // Arrange

      const course: ICourseType = {
        id: "3",
        name: "course 1",
        program: undefined,
        students: [],
        assignments: [],
        book: undefined,
      }

      let immutableStore: ImmutableStore<ICourseType> = new ImmutableStore<ICourseType>(CourseType)
      const _ = immutableStore.createRoot(course, "1") as unknown as ICourseType

      // Act
      const updatedCourse = immutableStore.produce((draft: any) => {
        const program = immutableStore.newObject(ProgramType, {
          id: "1",
          name: "program 1",
          courses: [],
          students: [],
        })

        draft.program = program
        draft.program.name = "program 1 updated"
      })

      // Assert
      expect(true).toBe(true)
      expect(course).not.toBe(updatedCourse)
      expect(updatedCourse.program).toBeDefined()
      expect(updatedCourse?.program?.name).toEqual("program 1 updated")
    })

    // TODO: uncomment this test when the one-to-many relationships are correctly implemented
    // test("should correctly define one-way one-to-many relationships", () => {
    //   // Arrange
    //   const student: IStudentType = {
    //     id: "1",
    //     name: "student 1",
    //     program: undefined,
    //     courses: [],
    //     address: undefined,
    //     books: [],
    //     buddy: undefined,
    //   }

    //   let immutableStore = new ImmutableStore<IStudentType>(StudentType)
    //   const _ = immutableStore.createRoot(student, "1") as unknown as IStudentType

    //   // Act
    //   const updatedStudent = immutableStore.produce((draft: any) => {
    //     const book1 = immutableStore.newObject(BookType, {
    //       id: "2",
    //       bookName: "book 1",
    //       bookAuthor: "author 1",
    //       course: undefined,
    //     })
    //     const book2 = immutableStore.newObject(BookType, {
    //       id: "3",
    //       bookName: "book 2",
    //       bookAuthor: "author 2",
    //       course: undefined,
    //     })

    //     draft.books.push(book1)
    //     draft.books.push(book2)
    //     draft.books[0].bookName = "book 1 updated"
    //   })

    //   // Assert
    //   expect(student).not.toBe(updatedStudent)
    //   expect(updatedStudent.books.length).toBe(2)
    //   expect(updatedStudent.books[0].bookName).toBe("book 1 updated")
    // })

    // TODO: uncomment this test when the one-to-one relationships are correctly implemented
    // test("should correctly define bi-directional one-to-one relationships", () => {
    //   // Arrange
    //   const course: ICourseType = {
    //     id: "1",
    //     name: "course 1",
    //     program: undefined,
    //     students: [],
    //     assignments: [],
    //     book: undefined,
    //   }

    //   let immutableStore = new ImmutableStore<ICourseType>(CourseType)
    //   const _ = immutableStore.createRoot(course, "1") as unknown as ICourseType

    // const book = immutableStore.newObject(BookType, {
    //   id: "2",
    //   bookName: "book 1",
    //   bookAuthor: "author 1",
    //   course: undefined,
    // })

    //   // Act
    //   const updatedCourse = immutableStore.produce((draft) => {
    //     draft.book = book
    //     draft.book.bookName = "book 1 updated"
    //   })
    //   const updatedCourseFromState = immutableStore.getState()

    //   // Assert
    //   expect(course).not.toBe(updatedCourse)
    //   expect(book.name).toBe("book 1")
    //   expect(updatedCourse.book).not.toBe(book)
    //   expect(updatedCourse.book.bookName).toBe("book 1 updated")
    //   expect(updatedCourse.book.course).toBe(updatedCourseFromState)
    // })

    // TODO: uncomment this test when the one-to-one relationships are correctly implemented
    // test("should correctly define one-to-many/many-to-one relationships", () => {
    //   // Arrange
    //   const program: IProgramType = {
    //     id: "1",
    //     name: "program 1",
    //     courses: [],
    //     students: [],
    //   }

    //   let immutableStore = new ImmutableStore<IProgramType>(ProgramType)
    //   const _ = immutableStore.createRoot(program, "1") as unknown as IProgramType

    //   const course1 = immutableStore.newObject(CourseType, {
    //     id: "2",
    //     name: "course 1",
    //     program: undefined,
    //     students: [],
    //     assignments: [],
    //     book: undefined,
    //   })

    //   const course2 = immutableStore.newObject(CourseType, {
    //     id: "3",
    //     name: "course 2",
    //     program: undefined,
    //     students: [],
    //     assignments: [],
    //     book: undefined,
    //   })

    //   // Act
    //   const updatedProgram = immutableStore.produce((draft: any) => {
    //     draft.courses.push(course1)
    //     draft.courses.push(course2)
    //     draft.courses[0].name = "course 1 updated"
    //     draft.courses[0].program.name = "program 1 updated"
    //   })

    //   // Assert
    //   expect(program).not.toBe(updatedProgram)
    //   expect(updatedProgram.courses.length).toBe(2)
    //   expect(updatedProgram.courses[0]).not.toBe(course1)
    //   expect(updatedProgram.courses[1]).not.toBe(course2)
    //   expect(program.name).toBe("program 1")
    //   expect(course1.name).toBe("course 1")
    //   expect(updatedProgram.courses[0].name).toBe("course 1 updated")
    //   expect(updatedProgram.courses[0].program).toBe(updatedProgram)
    //   expect(updatedProgram.courses[0].program.name).toBe("program 1 updated")
    // })

    // TODO: uncomment this test when the many-to-many relationships are correctly implemented
    // test("should correctly define many-to-many relationships", () => {
    //   // Arrange
    //   const course1: ICourseType = {
    //     id: "1",
    //     name: "course 1",
    //     program: undefined,
    //     students: [],
    //     assignments: [],
    //     book: undefined,
    //   }

    //   const course2: ICourseType = {
    //     id: "2",
    //     name: "course 2",
    //     program: undefined,
    //     students: [],
    //     assignments: [],
    //     book: undefined,
    //   }

    //   let immutableStore = new ImmutableStore<ICourseType[]>(CourseType)
    //   const _ = immutableStore.createRoot([course1, course2], "courses") as unknown as ICourseType[]

    //   const student1 = immutableStore.newObject(StudentType, {
    //     id: "3",
    //     name: "student 1",
    //     email: undefined,
    //     program: undefined,
    //     courses: [],
    //     address: undefined,
    //     books: [],
    //     buddy: undefined,
    //   })

    //   const student2 = immutableStore.newObject(StudentType, {
    //     id: "4",
    //     name: "student 2",
    //     email: undefined,
    //     program: undefined,
    //     courses: [],
    //     address: undefined,
    //     books: [],
    //     buddy: undefined,
    //   })

    //   // Act
    //   const updatedCourses = immutableStore.produce((draft: any) => {
    //     draft[0].students.push(student1)
    //     draft[0].students.push(student2)
    //     draft[1].students.push(student1)
    //     draft[0].name = "course 1 updated"
    //     draft[0].students[0].name = "student 1 updated"
    //   })

    //   // Assert
    //   expect(course1.name).toBe("course 1")
    //   expect(updatedCourses.length).toBe(2)
    //   expect(updatedCourses[0].students.length).toBe(2)
    //   expect(updatedCourses[0]).not.toBe(course1)
    //   expect(updatedCourses[1]).not.toBe(course2)
    //   expect(updatedCourses[0].students[0]).not.toBe(student1)
    //   expect(updatedCourses[0].students[0].name).toBe("student 1 updated")
    //   expect(updatedCourses[0].students[0].courses).toBe(updatedCourses)
    //   expect(updatedCourses[0].students[0].courses[0].name).toBe("course 1 updated")
    //   expect(updatedCourses[0].students[0].courses[0]).toBe(updatedCourses[0])
    // })
  })
})
