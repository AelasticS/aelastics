import { createStore } from "../../StoreFactory"
import { initializeSchemaRegistry } from "../../SchemaRegistry"
import { SchemaRegistry } from "../../meta/InternalSchema"
import { SchemaDescription } from "../../meta/ExternalSchema"
import { EternalObject } from "../../handlers/InternalTypes"

// import jsonSchemas from "../data/jsonSchemaWithArrays";

const schemas: SchemaDescription[] = [
  {
    qName: "/library",
    version: "1.0",
    types: {
      Author: {
        qName: "Author",
        properties: {
          name: {
            qName: "name",
            type: "string",
          },
          books: {
            qName: "books",
            type: "set",
            itemType: "object",
            domainType: "Book",
            inverseProp: "author",
            inverseType: "object",
          },
        },
      },
      Book: {
        qName: "Book",
        properties: {
          title: {
            qName: "title",
            type: "string",
          },
          author: {
            qName: "author",
            type: "object",
            domainType: "Author",
            inverseProp: "books",
            inverseType: "set",
          },
        },
      },
      Publisher: {
        qName: "Publisher",
        properties: {
          name: {
            qName: "name",
            type: "string",
          },
          books: {
            qName: "books",
            type: "set",
            itemType: "object",
            domainType: "PublishedBook",
            inverseProp: "publisher",
            inverseType: "object",
          },
        },
      },
      PublishedBook: {
        qName: "PublishedBook",
        properties: {
          title: {
            qName: "title",
            type: "string",
          },
          publisher: {
            qName: "publisher",
            type: "object",
            domainType: "Publisher",
            inverseProp: "books",
            inverseType: "set",
          },
        },
      },
      Student: {
        qName: "Student",
        properties: {
          name: {
            qName: "name",
            type: "string",
          },
          courses: {
            qName: "courses",
            type: "set",
            itemType: "object",
            domainType: "Course",
            inverseProp: "students",
            inverseType: "set",
          },
        },
      },
      Course: {
        qName: "Course",
        properties: {
          title: {
            qName: "title",
            type: "string",
          },
          students: {
            qName: "students",
            type: "set",
            itemType: "object",
            domainType: "Student",
            inverseProp: "courses",
            inverseType: "set",
          },
        },
      },
    },
    roles: {},
    export: ["Author", "Book", "Publisher", "PublishedBook"],
    import: {},
  },
]

// TypeScript interfaces based on the type definitions
interface Author {
  uuid: string
  name: string
  books: Set<Book>
}

interface Book {
  uuid: string
  title: string
  author: Author
}

interface Publisher {
  uuid: string
  name: string
  books: Set<PublishedBook>
}

interface PublishedBook {
  uuid: string
  title: string
  publisher: Publisher
}

interface Student {
  uuid: string
  name: string
  courses: Set<Course>
}

interface Course {
  uuid: string
  title: string
  students: Set<Student>
}

describe("Bidirectional Relationships with Sets", () => {
  let store: ReturnType<typeof createStore>

  beforeEach(() => {
    const schemaRegistry = initializeSchemaRegistry(schemas) as SchemaRegistry
    store = createStore(schemaRegistry.schemas.get("/library")!)
  })

  test("One-to-Many: Adding Books to Author", () => {
    let author = store.createObject<Author>("Author")
    let book1 = store.createObject<Book>("Book")
    let book2 = store.createObject<Book>("Book")

    store.updateObject((a) => {
      a.books.add(book1)
      a.books.add(book2)
    }, author)

    book1 = store.getObject<Book>((book1 as unknown as EternalObject).uuid)!
    book2 = store.getObject<Book>((book2 as unknown as EternalObject).uuid)!
    author = store.getObject<Author>((author as unknown as EternalObject).uuid)!

    expect(author.books.has(book1)).toBe(true)
    expect(author.books.has(book2)).toBe(true)
    expect(book1.author).toBe(author)
    expect(book2.author).toBe(author)
  })

  test("One-to-Many: Removing Books from Author", () => {
    let author = store.createObject<Author>("Author")
    let book1 = store.createObject<Book>("Book")
    let book2 = store.createObject<Book>("Book")

    store.updateObject((a) => {
      a.books.add(book1)
      a.books.add(book2)
    }, author)

    author = store.getObject<Author>((author as unknown as EternalObject).uuid)!

    store.updateObject((a) => {
      a.books.delete(book1)
    }, author)

    book1 = store.getObject<Book>((book1 as unknown as EternalObject).uuid)!
    book2 = store.getObject<Book>((book2 as unknown as EternalObject).uuid)!
    author = store.getObject<Author>((author as unknown as EternalObject).uuid)!

    expect(author.books.has(book1)).toBe(false)
    expect(author.books.has(book2)).toBe(true)
    expect(book1.author).toBeUndefined()
    expect(book2.author).toBe(author)
  })

test("Many-to-One: Adding Books to Publisher", () => {
    let publisher = store.createObject<Publisher>("Publisher")
    let book1 = store.createObject<PublishedBook>("PublishedBook")
    let book2 = store.createObject<PublishedBook>("PublishedBook")

    store.updateObject((p) => {
        p.books.add(book1)
        p.books.add(book2)
    }, publisher)

    book1 = store.getObject<PublishedBook>((book1 as unknown as EternalObject).uuid)!
    book2 = store.getObject<PublishedBook>((book2 as unknown as EternalObject).uuid)!
    publisher = store.getObject<Publisher>((publisher as unknown as EternalObject).uuid)!

    expect(publisher.books.has(book1)).toBe(true)
    expect(publisher.books.has(book2)).toBe(true)
    expect(book1.publisher).toBe(publisher)
    expect(book2.publisher).toBe(publisher)
})

test("Many-to-One: Removing Books from Publisher", () => {
    let publisher = store.createObject<Publisher>("Publisher")
    let book1 = store.createObject<PublishedBook>("PublishedBook")
    let book2 = store.createObject<PublishedBook>("PublishedBook")

    store.updateObject((p) => {
        p.books.add(book1)
        p.books.add(book2)
    }, publisher)

    book1 = store.getObject<PublishedBook>((book1 as unknown as EternalObject).uuid)!
    book2 = store.getObject<PublishedBook>((book2 as unknown as EternalObject).uuid)!
    publisher = store.getObject<Publisher>((publisher as unknown as EternalObject).uuid)!

    store.updateObject((p) => {
        p.books.delete(book1)
    }, publisher)

    book1 = store.getObject<PublishedBook>((book1 as unknown as EternalObject).uuid)!
    book2 = store.getObject<PublishedBook>((book2 as unknown as EternalObject).uuid)!
    publisher = store.getObject<Publisher>((publisher as unknown as EternalObject).uuid)!

    expect(publisher.books.has(book1)).toBe(false)
    expect(publisher.books.has(book2)).toBe(true)
    expect(book1.publisher).toBeUndefined()
    expect(book2.publisher).toBe(publisher)
})

test("Many-to-Many: Adding Courses to Students", () => {
    let student1 = store.createObject<Student>("Student")
    let student2 = store.createObject<Student>("Student")
    let course1 = store.createObject<Course>("Course")
    let course2 = store.createObject<Course>("Course")

    store.updateObject((s) => {
        s.courses.add(course1)
        s.courses.add(course2)
    }, student1)

    course1 = store.getObject<Course>((course1 as unknown as EternalObject).uuid)!
    course2 = store.getObject<Course>((course2 as unknown as EternalObject).uuid)!
    student1 = store.getObject<Student>((student1 as unknown as EternalObject).uuid)!
    student2 = store.getObject<Student>((student2 as unknown as EternalObject).uuid)!

    store.updateObject((s) => {
        s.courses.add(course1)
        s.courses.add(course2)
    }, student2)

    course1 = store.getObject<Course>((course1 as unknown as EternalObject).uuid)!
    course2 = store.getObject<Course>((course2 as unknown as EternalObject).uuid)!
    student1 = store.getObject<Student>((student1 as unknown as EternalObject).uuid)!
    student2 = store.getObject<Student>((student2 as unknown as EternalObject).uuid)!

    expect(student1.courses.has(course1)).toBe(true)
    expect(student1.courses.has(course2)).toBe(true)
    expect(student2.courses.has(course1)).toBe(true)
    expect(student2.courses.has(course2)).toBe(true)
    expect(course1.students.has(student1)).toBe(true)
    expect(course1.students.has(student2)).toBe(true)
    expect(course2.students.has(student1)).toBe(true)
    expect(course2.students.has(student2)).toBe(true)
})

test("Many-to-Many: Removing Courses from Students", () => {
    let student1 = store.createObject<Student>("Student")
    let student2 = store.createObject<Student>("Student")
    let course1 = store.createObject<Course>("Course")
    let course2 = store.createObject<Course>("Course")

    store.updateObject((s) => {
        s.courses.add(course1)
        s.courses.add(course2)
    }, student1)

    course1 = store.getObject<Course>((course1 as unknown as EternalObject).uuid)!
    course2 = store.getObject<Course>((course2 as unknown as EternalObject).uuid)!
    student1 = store.getObject<Student>((student1 as unknown as EternalObject).uuid)!
    student2 = store.getObject<Student>((student2 as unknown as EternalObject).uuid)!
    
    store.updateObject((s) => {
        s.courses.add(course1)
        s.courses.add(course2)
    }, student2)

    course1 = store.getObject<Course>((course1 as unknown as EternalObject).uuid)!
    course2 = store.getObject<Course>((course2 as unknown as EternalObject).uuid)!
    student1 = store.getObject<Student>((student1 as unknown as EternalObject).uuid)!
    student2 = store.getObject<Student>((student2 as unknown as EternalObject).uuid)!

    store.updateObject((s) => {
        s.courses.delete(course1)
    }, student1)

    course1 = store.getObject<Course>((course1 as unknown as EternalObject).uuid)!
    course2 = store.getObject<Course>((course2 as unknown as EternalObject).uuid)!
    student1 = store.getObject<Student>((student1 as unknown as EternalObject).uuid)!
    student2 = store.getObject<Student>((student2 as unknown as EternalObject).uuid)!

    expect(student1.courses.has(course1)).toBe(false)
    expect(student1.courses.has(course2)).toBe(true)
    expect(student2.courses.has(course1)).toBe(true)
    expect(student2.courses.has(course2)).toBe(true)
    expect(course1.students.has(student1)).toBe(false)
    expect(course1.students.has(student2)).toBe(true)
    expect(course2.students.has(student1)).toBe(true)
    expect(course2.students.has(student2)).toBe(true)
})
})
