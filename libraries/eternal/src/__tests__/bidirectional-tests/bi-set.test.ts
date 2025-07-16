import { createStore } from "../../store/createStore"
import { StoreObject, uuid } from "../../store/InternalTypes"
import { RegistryService } from "../../registry/RegistryService"
import { Namespace, RegistryMetadata } from "../../registry/NamespaceMetadata"
import { ObjectTypeMeta, PropertyMeta } from "../../registry/TypeDefinitions"

// import jsonSchemas from "../data/jsonSchemaWithArrays";

// Create type definitions using the new registry system
function createLibraryNamespace(): Namespace {
  const authorTypeMeta: ObjectTypeMeta = {
    qName: "/library/Author",
    category: "complex",
    kind: "object",
    properties: new Map([
      ["name", {
        name: "name",
        typeRef: "/std/string",
        optional: false
      } as PropertyMeta],
      ["books", {
        name: "books",
        typeRef: "/std/set</library/Book>",
        optional: false,
        inverseProp: "author",
        inverseTypeRef: "/library/Book",
        inverseType: "object"
      } as PropertyMeta]
    ])
  };

  const bookTypeMeta: ObjectTypeMeta = {
    qName: "/library/Book",
    category: "complex",
    kind: "object",
    properties: new Map([
      ["title", {
        name: "title",
        typeRef: "/std/string",
        optional: false
      } as PropertyMeta],
      ["author", {
        name: "author",
        typeRef: "/library/Author",
        optional: false,
        inverseProp: "books",
        inverseTypeRef: "/library/Author",
        inverseType: "set"
      } as PropertyMeta]
    ])
  };

  const publisherTypeMeta: ObjectTypeMeta = {
    qName: "/library/Publisher",
    category: "complex",
    kind: "object",
    properties: new Map([
      ["name", {
        name: "name",
        typeRef: "/std/string",
        optional: false
      } as PropertyMeta],
      ["books", {
        name: "books",
        typeRef: "/std/set</library/PublishedBook>",
        optional: false,
        inverseProp: "publisher",
        inverseTypeRef: "/library/PublishedBook",
        inverseType: "object"
      } as PropertyMeta]
    ])
  };

  const publishedBookTypeMeta: ObjectTypeMeta = {
    qName: "/library/PublishedBook",
    category: "complex",
    kind: "object",
    properties: new Map([
      ["title", {
        name: "title",
        typeRef: "/std/string",
        optional: false
      } as PropertyMeta],
      ["publisher", {
        name: "publisher",
        typeRef: "/library/Publisher",
        optional: false,
        inverseProp: "books",
        inverseTypeRef: "/library/Publisher",
        inverseType: "set"
      } as PropertyMeta]
    ])
  };

  const studentTypeMeta: ObjectTypeMeta = {
    qName: "/library/Student",
    category: "complex",
    kind: "object",
    properties: new Map([
      ["name", {
        name: "name",
        typeRef: "/std/string",
        optional: false
      } as PropertyMeta],
      ["courses", {
        name: "courses",
        typeRef: "/std/set</library/Course>",
        optional: false,
        inverseProp: "students",
        inverseTypeRef: "/library/Course",
        inverseType: "set"
      } as PropertyMeta]
    ])
  };

  const courseTypeMeta: ObjectTypeMeta = {
    qName: "/library/Course",
    category: "complex",
    kind: "object",
    properties: new Map([
      ["title", {
        name: "title",
        typeRef: "/std/string",
        optional: false
      } as PropertyMeta],
      ["students", {
        name: "students",
        typeRef: "/std/set</library/Student>",
        optional: false,
        inverseProp: "courses",
        inverseTypeRef: "/library/Student",
        inverseType: "set"
      } as PropertyMeta]
    ])
  };

  return {
    qName: "/library",
    version: "1.0.0",
    types: new Map([
      ["Author", authorTypeMeta],
      ["Book", bookTypeMeta],
      ["Publisher", publisherTypeMeta],
      ["PublishedBook", publishedBookTypeMeta],
      ["Student", studentTypeMeta],
      ["Course", courseTypeMeta]
    ]),
    exports: ["Author", "Book", "Publisher", "PublishedBook", "Student", "Course"],
    imports: new Map()
  };
}

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
    const registryMetadata: RegistryMetadata = {
      namespaces: new Map(),
      name: "Test Registry",
      version: "1.0.0",
      created: new Date(),
      lastModified: new Date()
    };
    
    const registry = new RegistryService(registryMetadata);
    const namespace = createLibraryNamespace();
    
    registry.importNamespace(namespace);
    store = createStore(registry);
  })

  test("One-to-Many: Adding Books to Author", () => {
    let author = store.objects.create<Author>("/library/Author")
    let book1 = store.objects.create<Book>("/library/Book")
    let book2 = store.objects.create<Book>("/library/Book")

    store.objects.update((a) => {
      a.books.add(book1)
      a.books.add(book2)
    }, author)

    book1 = store.objects.findByUUID<Book>((book1 as unknown as StoreObject)[uuid])!
    book2 = store.objects.findByUUID<Book>((book2 as unknown as StoreObject)[uuid])!
    author = store.objects.findByUUID<Author>((author as unknown as StoreObject)[uuid])!

    expect(author.books.has(book1)).toBe(true)
    expect(author.books.has(book2)).toBe(true)
    expect(book1.author).toBe(author)
    expect(book2.author).toBe(author)
  })

  test("One-to-Many: Removing Books from Author", () => {
    let author = store.objects.create<Author>("/library/Author")
    let book1 = store.objects.create<Book>("/library/Book")
    let book2 = store.objects.create<Book>("/library/Book")

    store.objects.update((a) => {
      a.books.add(book1)
      a.books.add(book2)
    }, author)

    author = store.objects.findByUUID<Author>((author as unknown as StoreObject)[uuid])!

    store.objects.update((a) => {
      a.books.delete(book1)
    }, author)

    book1 = store.objects.findByUUID<Book>((book1 as unknown as StoreObject)[uuid])!
    book2 = store.objects.findByUUID<Book>((book2 as unknown as StoreObject)[uuid])!
    author = store.objects.findByUUID<Author>((author as unknown as StoreObject)[uuid])!

    expect(author.books.has(book1)).toBe(false)
    expect(author.books.has(book2)).toBe(true)
    expect(book1.author).toBeUndefined()
    expect(book2.author).toBe(author)
  })

test("Many-to-One: Adding Books to Publisher", () => {
    let publisher = store.objects.create<Publisher>("/library/Publisher")
    let book1 = store.objects.create<PublishedBook>("/library/PublishedBook")
    let book2 = store.objects.create<PublishedBook>("/library/PublishedBook")

    store.objects.update((p) => {
        p.books.add(book1)
        p.books.add(book2)
    }, publisher)

    book1 = store.objects.findByUUID<PublishedBook>((book1 as unknown as StoreObject)[uuid])!
    book2 = store.objects.findByUUID<PublishedBook>((book2 as unknown as StoreObject)[uuid])!
    publisher = store.objects.findByUUID<Publisher>((publisher as unknown as StoreObject)[uuid])!

    expect(publisher.books.has(book1)).toBe(true)
    expect(publisher.books.has(book2)).toBe(true)
    expect(book1.publisher).toBe(publisher)
    expect(book2.publisher).toBe(publisher)
})

test("Many-to-One: Removing Books from Publisher", () => {
    let publisher = store.objects.create<Publisher>("/library/Publisher")
    let book1 = store.objects.create<PublishedBook>("/library/PublishedBook")
    let book2 = store.objects.create<PublishedBook>("/library/PublishedBook")

    store.objects.update((p) => {
        p.books.add(book1)
        p.books.add(book2)
    }, publisher)

    book1 = store.objects.findByUUID<PublishedBook>((book1 as unknown as StoreObject)[uuid])!
    book2 = store.objects.findByUUID<PublishedBook>((book2 as unknown as StoreObject)[uuid])!
    publisher = store.objects.findByUUID<Publisher>((publisher as unknown as StoreObject)[uuid])!

    store.objects.update((p) => {
        p.books.delete(book1)
    }, publisher)

    book1 = store.objects.findByUUID<PublishedBook>((book1 as unknown as StoreObject)[uuid])!
    book2 = store.objects.findByUUID<PublishedBook>((book2 as unknown as StoreObject)[uuid])!
    publisher = store.objects.findByUUID<Publisher>((publisher as unknown as StoreObject)[uuid])!

    expect(publisher.books.has(book1)).toBe(false)
    expect(publisher.books.has(book2)).toBe(true)
    expect(book1.publisher).toBeUndefined()
    expect(book2.publisher).toBe(publisher)
})

test("Many-to-Many: Adding Courses to Students", () => {
    let student1 = store.objects.create<Student>("/library/Student")
    let student2 = store.objects.create<Student>("/library/Student")
    let course1 = store.objects.create<Course>("/library/Course")
    let course2 = store.objects.create<Course>("/library/Course")

    store.objects.update((s) => {
        s.courses.add(course1)
        s.courses.add(course2)
    }, student1)

    course1 = store.objects.findByUUID<Course>((course1 as unknown as StoreObject)[uuid])!
    course2 = store.objects.findByUUID<Course>((course2 as unknown as StoreObject)[uuid])!
    student1 = store.objects.findByUUID<Student>((student1 as unknown as StoreObject)[uuid])!
    student2 = store.objects.findByUUID<Student>((student2 as unknown as StoreObject)[uuid])!

    store.objects.update((s) => {
        s.courses.add(course1)
        s.courses.add(course2)
    }, student2)

    course1 = store.objects.findByUUID<Course>((course1 as unknown as StoreObject)[uuid])!
    course2 = store.objects.findByUUID<Course>((course2 as unknown as StoreObject)[uuid])!
    student1 = store.objects.findByUUID<Student>((student1 as unknown as StoreObject)[uuid])!
    student2 = store.objects.findByUUID<Student>((student2 as unknown as StoreObject)[uuid])!

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
    let student1 = store.objects.create<Student>("/library/Student")
    let student2 = store.objects.create<Student>("/library/Student")
    let course1 = store.objects.create<Course>("/library/Course")
    let course2 = store.objects.create<Course>("/library/Course")

    store.objects.update((s) => {
        s.courses.add(course1)
        s.courses.add(course2)
    }, student1)

    course1 = store.objects.findByUUID<Course>((course1 as unknown as StoreObject)[uuid])!
    course2 = store.objects.findByUUID<Course>((course2 as unknown as StoreObject)[uuid])!
    student1 = store.objects.findByUUID<Student>((student1 as unknown as StoreObject)[uuid])!
    student2 = store.objects.findByUUID<Student>((student2 as unknown as StoreObject)[uuid])!
    
    store.objects.update((s) => {
        s.courses.add(course1)
        s.courses.add(course2)
    }, student2)

    course1 = store.objects.findByUUID<Course>((course1 as unknown as StoreObject)[uuid])!
    course2 = store.objects.findByUUID<Course>((course2 as unknown as StoreObject)[uuid])!
    student1 = store.objects.findByUUID<Student>((student1 as unknown as StoreObject)[uuid])!
    student2 = store.objects.findByUUID<Student>((student2 as unknown as StoreObject)[uuid])!

    store.objects.update((s) => {
        s.courses.delete(course1)
    }, student1)

    course1 = store.objects.findByUUID<Course>((course1 as unknown as StoreObject)[uuid])!
    course2 = store.objects.findByUUID<Course>((course2 as unknown as StoreObject)[uuid])!
    student1 = store.objects.findByUUID<Student>((student1 as unknown as StoreObject)[uuid])!
    student2 = store.objects.findByUUID<Student>((student2 as unknown as StoreObject)[uuid])!

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
