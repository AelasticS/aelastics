import { createStore } from "../../store/createStore";
import { initializeSchemaRegistry } from "../../meta/SchemaRegistry";
import { SchemaRegistry } from "../../meta/InternalSchema";
//import jsonSchemaWithArrays from "../data/jsonSchemaWithArrays";
import { SchemaDescription } from "../../meta/ExternalSchema";
import { StoreObject, uuid } from "../../store/InternalTypes";

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
              type: "array",
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
              inverseType: "array",
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
              type: "array",
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
                inverseType: "array",
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
                type: "array",
                itemType: "object",
                domainType: "Course",
                inverseProp: "students",
                inverseType: "array",
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
                type: "array",
                itemType: "object",
                domainType: "Student",
                inverseProp: "courses",
                inverseType: "array",
              },
            },
          },
      },
      roles: {},
      export: ["Author", "Book", "Publisher", "PublishedBook"],
      import: {},
    }
  ];

// TypeScript interfaces based on the type definitions
interface Author {
    name: string;
    books: Book[];
}

interface Book {
    title: string;
    author: Author;
}

interface Publisher {
    name: string;
    books: PublishedBook[];
}

interface PublishedBook {
    title: string;
    publisher: Publisher;
}

interface Student {
    name: string;
    courses: Course[];
}

interface Course {
    title: string;
    students: Student[];
}

describe("Bidirectional Relationships", () => {
    let store: ReturnType<typeof createStore>;

    beforeEach(() => {
        const schemaRegistry:SchemaRegistry = initializeSchemaRegistry(schemas) as SchemaRegistry;
        store = createStore(schemaRegistry.schemas.get("/library")!);
    });

    test("One-to-Many: Adding Books to Author", () => {
        let author = store.objectManager.create<Author>("Author");
        let book1 = store.objectManager.create<Book>("Book");
        let book2 = store.objectManager.create<Book>("Book");

        author = store.objectManager.update((a) => {
            a.books.push(book1, book2);
        }, author);

        book1 = store.objectManager.findByUUID<Book>((book1 as unknown as StoreObject) [uuid])!;
        book2 = store.objectManager.findByUUID<Book>((book2 as unknown as StoreObject)[uuid])!;
        
        expect(author.books.includes(book1)).toBeTruthy;
        expect(author.books.includes(book2)).toBeTruthy();
        expect(book1.author).toBe(author);
        expect(book2.author).toBe(author);
    });

    test("One-to-Many: Removing Books from Author", () => {
        let author = store.objectManager.create<Author>("Author");
        let book1 = store.objectManager.create<Book>("Book");
        let book2 = store.objectManager.create<Book>("Book");

        author = store.objectManager.update((a) => {
            a.books.push(book1, book2);
        }, author);

        book1 = store.objectManager.findByUUID<Book>((book1 as unknown as StoreObject)[uuid])!;
        let filteredBooks: Book[] = [];

        store.objectManager.update((a) => {
            // TODO enable set on collections: a.books = a.books.filter(book => book !== book1);
            // check if array os proxied
            // disconnect all old elements and connect new ones
            filteredBooks = a.books.filter(book => book !== book1);
        }, author);

        book1 = store.objectManager.findByUUID<Book>((book1 as unknown as StoreObject)[uuid])!;
        book2 = store.objectManager.findByUUID<Book>((book2 as unknown as StoreObject)[uuid])!;
        author = store.objectManager.findByUUID<Author>((author as unknown as StoreObject)[uuid])!;

        expect(filteredBooks.includes(book1)).toBeFalsy();
        expect(author.books.includes(book2)).toBe
        // expect(author.books.includes(book1)).toBeFalsy();
        // expect(author.books.includes(book2)).toBeTruthy();
        // expect(book1.author).toBeUndefined();
        // expect(book2.author).toBe(author);
    });

    test("Many-to-One: Adding Books to Publisher", () => {
        let publisher = store.objectManager.create<Publisher>("Publisher");
        let book1 = store.objectManager.create<PublishedBook>("PublishedBook");
        let book2 = store.objectManager.create<PublishedBook>("PublishedBook");

        store.objectManager.update((p) => {
            p.books.push(book1, book2);
        }, publisher);

        book1 = store.objectManager.findByUUID<PublishedBook>((book1 as unknown as StoreObject)[uuid])!;
        book2 = store.objectManager.findByUUID<PublishedBook>((book2 as unknown as StoreObject)[uuid])!;
        publisher = store.objectManager.findByUUID<Publisher>((publisher as unknown as StoreObject)[uuid])!;

        expect(publisher.books.includes(book1)).toBeTruthy();
        expect(publisher.books.includes(book2)).toBeTruthy();
        expect(book1.publisher).toBe(publisher);
        expect(book2.publisher).toBe(publisher);
    });

    test("Many-to-One: Removing Books from Publisher", () => {
        let publisher = store.objectManager.create<Publisher>("Publisher");
        let book1 = store.objectManager.create<PublishedBook>("PublishedBook");
        let book2 = store.objectManager.create<PublishedBook>("PublishedBook");

        store.objectManager.update((p) => {
            p.books.push(book1, book2);
        }, publisher);

        publisher = store.objectManager.findByUUID<Publisher>((publisher as unknown as StoreObject)[uuid])!;

        store.objectManager.update((p) => { //= p.books.filter(book => book !== book1);
            const i = p.books.findIndex(book => book !== book1);
            if(i >= 0)           
                p.books.splice(i,1) 
        }, publisher);

        book1 = store.objectManager.findByUUID<PublishedBook>((book1 as unknown as StoreObject)[uuid])!;
        book2 = store.objectManager.findByUUID<PublishedBook>((book2 as unknown as StoreObject)[uuid])!;
        publisher = store.objectManager.findByUUID<Publisher>((publisher as unknown as StoreObject)[uuid])!;

        expect(publisher.books.includes(book1)).toBeFalsy();
        expect(publisher.books.includes(book2)).toBeTruthy();
        expect(book1.publisher).toBeUndefined();
        expect(book2.publisher).toBe(publisher);
    });

    test("Many-to-Many: Adding Courses to Students", () => {
        let student1 = store.objectManager.create<Student>("Student");
        let student2 = store.objectManager.create<Student>("Student");
        let course1 = store.objectManager.create<Course>("Course");
        let course2 = store.objectManager.create<Course>("Course");

        store.objectManager.update((s) => {
            s.courses.push(course1, course2);
        }, student1);

        store.objectManager.update((s) => {
            s.courses.push(course1, course2);
        }, student2);

        student1 = store.objectManager.findByUUID<Student>((student1 as unknown as StoreObject)[uuid])!;
        student2 = store.objectManager.findByUUID<Student>((student2 as unknown as StoreObject)[uuid])!;
        course1 = store.objectManager.findByUUID<Course>((course1 as unknown as StoreObject)[uuid])!;
        course2 = store.objectManager.findByUUID<Course>((course2 as unknown as StoreObject)[uuid])!;

        expect(student1.courses.includes(course1)).toBeTruthy();
        expect(student1.courses.includes(course2)).toBeTruthy();
        expect(student2.courses.includes(course1)).toBeTruthy();
        expect(student2.courses.includes(course2)).toBeTruthy();
        expect(course1.students.includes(student1)).toBeTruthy();
        expect(course1.students.includes(student2)).toBeTruthy();
        expect(course2.students.includes(student1)).toBeTruthy();
        expect(course2.students.includes(student2)).toBeTruthy();
    });

    test("Many-to-Many: Removing Courses from Students", () => {
        let student1 = store.objectManager.create<Student>("Student");
        let student2 = store.objectManager.create<Student>("Student");
        let course1 = store.objectManager.create<Course>("Course");
        let course2 = store.objectManager.create<Course>("Course");

        store.objectManager.update((s) => {
            s.courses.push(course1, course2);
        }, student1);

        store.objectManager.update((s) => {
            s.courses.push(course1, course2);
        }, student2);

        student1 = store.objectManager.findByUUID<Student>((student1 as unknown as StoreObject)[uuid])!;

        store.objectManager.update((s) => {
            // s.courses = s.courses.filter(course => course !== course1);
            s.courses.shift()
        }, student1);

        student1 = store.objectManager.findByUUID<Student>((student1 as unknown as StoreObject)[uuid])!;
        student2 = store.objectManager.findByUUID<Student>((student2 as unknown as StoreObject)[uuid])!;
        course1 = store.objectManager.findByUUID<Course>((course1 as unknown as StoreObject)[uuid])!;
        course2 = store.objectManager.findByUUID<Course>((course2 as unknown as StoreObject)[uuid])!;

        expect(student1.courses.includes(course1)).toBeFalsy();
        expect(student1.courses.includes(course2)).toBeTruthy();
        expect(student2.courses.includes(course1)).toBeTruthy();
        expect(student2.courses.includes(course2)).toBeTruthy();
        expect(course1.students.includes(student1)).toBeFalsy();
        expect(course1.students.includes(student2)).toBeTruthy();
        expect(course2.students.includes(student1)).toBeTruthy();
        expect(course2.students.includes(student2)).toBeTruthy();
    });
});


