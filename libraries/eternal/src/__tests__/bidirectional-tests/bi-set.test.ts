import { createStore } from "../../store/createStore"
import { initializeSchemaRegistry } from "../../meta/SchemaRegistry"
import { SchemaRegistry } from "../../meta/InternalSchema"
import { SchemaDescription } from "../../meta/ExternalSchema"
import { StoreObject, uuid } from "../../store/InternalTypes"

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
interface Author extends StoreObject{
  uuid: string
  name: string
  books: Set<Book>
}

interface Book extends StoreObject{
  uuid: string
  title: string
  author: Author
}

interface Publisher extends StoreObject{
  uuid: string
  name: string
  books: Set<PublishedBook>
}

interface PublishedBook extends StoreObject {
  uuid: string
  title: string
  publisher: Publisher
}

interface Student extends StoreObject {
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
    let author = store.objectManager.create<Author>("Author")
    let book1 = store.objectManager.create<Book>("Book")
    let book2 = store.objectManager.create<Book>("Book")

    store.objectManager.update((a) => {
      a.books.add(book1)
      a.books.add(book2)
    }, author)

    book1 = store.objectManager.findByUUID<Book>((book1 as unknown as StoreObject)[uuid])!
    book2 = store.objectManager.findByUUID<Book>((book2 as unknown as StoreObject)[uuid])!
    author = store.objectManager.findByUUID<Author>((author as unknown as StoreObject)[uuid])!

    expect(author.books.has(book1)).toBe(true)
    expect(author.books.has(book2)).toBe(true)
    expect(book1.author).toBe(author)
    expect(book2.author).toBe(author)
  })

  test("One-to-Many: Removing Books from Author", () => {
    let author = store.objectManager.create<Author>("Author")
    let book1 = store.objectManager.create<Book>("Book")
    let book2 = store.objectManager.create<Book>("Book")

    store.objectManager.update((a) => {
      a.books.add(book1)
      a.books.add(book2)
    }, author)

    author = store.objectManager.findByUUID<Author>((author as unknown as StoreObject)[uuid])!

    store.objectManager.update((a) => {
      a.books.delete(book1)
    }, author)

    book1 = store.objectManager.findByUUID<Book>((book1 as unknown as StoreObject)[uuid])!
    book2 = store.objectManager.findByUUID<Book>((book2 as unknown as StoreObject)[uuid])!
    author = store.objectManager.findByUUID<Author>((author as unknown as StoreObject)[uuid])!

    expect(author.books.has(book1)).toBe(false)
    expect(author.books.has(book2)).toBe(true)
    expect(book1.author).toBeUndefined()
    expect(book2.author).toBe(author)
  })

test("Many-to-One: Adding Books to Publisher", () => {
    let publisher = store.objectManager.create<Publisher>("Publisher")
    let book1 = store.objectManager.create<PublishedBook>("PublishedBook")
    let book2 = store.objectManager.create<PublishedBook>("PublishedBook")

    store.objectManager.update((p) => {
        p.books.add(book1)
        p.books.add(book2)
    }, publisher)

    book1 = store.objectManager.findByUUID<PublishedBook>((book1 as unknown as StoreObject)[uuid])!
    book2 = store.objectManager.findByUUID<PublishedBook>((book2 as unknown as StoreObject)[uuid])!
    publisher = store.objectManager.findByUUID<Publisher>((publisher as unknown as StoreObject)[uuid])!

    expect(publisher.books.has(book1)).toBe(true)
    expect(publisher.books.has(book2)).toBe(true)
    expect(book1.publisher).toBe(publisher)
    expect(book2.publisher).toBe(publisher)
})

test("Many-to-One: Removing Books from Publisher", () => {
    let publisher = store.objectManager.create<Publisher>("Publisher")
    let book1 = store.objectManager.create<PublishedBook>("PublishedBook")
    let book2 = store.objectManager.create<PublishedBook>("PublishedBook")

    store.objectManager.update((p) => {
        p.books.add(book1)
        p.books.add(book2)
    }, publisher)

    book1 = store.objectManager.findByUUID<PublishedBook>((book1 as unknown as StoreObject)[uuid])!
    book2 = store.objectManager.findByUUID<PublishedBook>((book2 as unknown as StoreObject)[uuid])!
    publisher = store.objectManager.findByUUID<Publisher>((publisher as unknown as StoreObject)[uuid])!

    store.objectManager.update((p) => {
        p.books.delete(book1)
    }, publisher)

    book1 = store.objectManager.findByUUID<PublishedBook>((book1 as unknown as StoreObject)[uuid])!
    book2 = store.objectManager.findByUUID<PublishedBook>((book2 as unknown as StoreObject)[uuid])!
    publisher = store.objectManager.findByUUID<Publisher>((publisher as unknown as StoreObject)[uuid])!

    expect(publisher.books.has(book1)).toBe(false)
    expect(publisher.books.has(book2)).toBe(true)
    expect(book1.publisher).toBeUndefined()
    expect(book2.publisher).toBe(publisher)
})

test("Many-to-Many: Adding Courses to Students", () => {
    let student1 = store.objectManager.create<Student>("Student")
    let student2 = store.objectManager.create<Student>("Student")
    let course1 = store.objectManager.create<Course>("Course")
    let course2 = store.objectManager.create<Course>("Course")

    store.objectManager.update((s) => {
        s.courses.add(course1)
        s.courses.add(course2)
    }, student1)

    course1 = store.objectManager.findByUUID<Course>((course1 as unknown as StoreObject)[uuid])!
    course2 = store.objectManager.findByUUID<Course>((course2 as unknown as StoreObject)[uuid])!
    student1 = store.objectManager.findByUUID<Student>((student1 as unknown as StoreObject)[uuid])!
    student2 = store.objectManager.findByUUID<Student>((student2 as unknown as StoreObject)[uuid])!

    store.objectManager.update((s) => {
        s.courses.add(course1)
        s.courses.add(course2)
    }, student2)

    course1 = store.objectManager.findByUUID<Course>((course1 as unknown as StoreObject)[uuid])!
    course2 = store.objectManager.findByUUID<Course>((course2 as unknown as StoreObject)[uuid])!
    student1 = store.objectManager.findByUUID<Student>((student1 as unknown as StoreObject)[uuid])!
    student2 = store.objectManager.findByUUID<Student>((student2 as unknown as StoreObject)[uuid])!

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
    let student1 = store.objectManager.create<Student>("Student")
    let student2 = store.objectManager.create<Student>("Student")
    let course1 = store.objectManager.create<Course>("Course")
    let course2 = store.objectManager.create<Course>("Course")

    store.objectManager.update((s) => {
        s.courses.add(course1)
        s.courses.add(course2)
    }, student1)

    course1 = store.objectManager.findByUUID<Course>((course1 as unknown as StoreObject)[uuid])!
    course2 = store.objectManager.findByUUID<Course>((course2 as unknown as StoreObject)[uuid])!
    student1 = store.objectManager.findByUUID<Student>((student1 as unknown as StoreObject)[uuid])!
    student2 = store.objectManager.findByUUID<Student>((student2 as unknown as StoreObject)[uuid])!
    
    store.objectManager.update((s) => {
        s.courses.add(course1)
        s.courses.add(course2)
    }, student2)

    course1 = store.objectManager.findByUUID<Course>((course1 as unknown as StoreObject)[uuid])!
    course2 = store.objectManager.findByUUID<Course>((course2 as unknown as StoreObject)[uuid])!
    student1 = store.objectManager.findByUUID<Student>((student1 as unknown as StoreObject)[uuid])!
    student2 = store.objectManager.findByUUID<Student>((student2 as unknown as StoreObject)[uuid])!

    store.objectManager.update((s) => {
        s.courses.delete(course1)
    }, student1)

    course1 = store.objectManager.findByUUID<Course>((course1 as unknown as StoreObject)[uuid])!
    course2 = store.objectManager.findByUUID<Course>((course2 as unknown as StoreObject)[uuid])!
    student1 = store.objectManager.findByUUID<Student>((student1 as unknown as StoreObject)[uuid])!
    student2 = store.objectManager.findByUUID<Student>((student2 as unknown as StoreObject)[uuid])!

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
