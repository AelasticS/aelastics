import { createStore } from "../../store/createStore";
import { initializeSchemaRegistry } from "../../meta/SchemaRegistry";
import { SchemaRegistry } from "../../meta/InternalSchema";
import { SchemaDescription } from "../../meta/ExternalSchema";
import { StoreObject, uuid } from "../../handlers/InternalTypes";

// import jsonSchemas from "../data/jsonSchemaWithMaps";


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
                        type: "map",
                        keyType: "string",
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
                        inverseType: "map",
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
                        type: "map",
                        keyType: "string",
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
                        inverseType: "map",
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
                        type: "map",
                        keyType: "string",
                        itemType: "object",
                        domainType: "Course",
                        inverseProp: "students",
                        inverseType: "map",
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
                        type: "map",
                        keyType: "string",
                        itemType: "object",
                        domainType: "Student",
                        inverseProp: "courses",
                        inverseType: "map",
                    },
                },
            },
        },
        roles: {},
        export: ["Author", "Book", "Publisher", "PublishedBook"],
        import: {},
    },
];

// TypeScript interfaces based on the type definitions
interface Author extends StoreObject {
    name: string;
    books: Map<string, Book>;
}

interface Book extends StoreObject {
    title: string;
    author: Author;
}

interface Publisher extends StoreObject  {
    name: string;
    books: Map<string, PublishedBook>;
}

interface PublishedBook extends StoreObject {
    title: string;
    publisher: Publisher;
}

interface Student extends StoreObject {
    name: string;
    courses: Map<string, Course>;
}

interface Course extends StoreObject {
    title: string;
    students: Map<string, Student>;
}

describe("Bidirectional Relationships with Maps", () => {
    let store: ReturnType<typeof createStore>;

    beforeEach(() => {
        const schemaRegistry = initializeSchemaRegistry(schemas) as SchemaRegistry;
        store = createStore(schemaRegistry.schemas.get("/library")!);
    });

    test("One-to-Many: Adding Books to Author", () => {
        let author = store.createObject<Author>("Author");
        let book1 = store.createObject<Book>("Book");
        let book2 = store.createObject<Book>("Book");

        store.updateObject((a) => {
            a.books.set(book1[uuid], book1);
            a.books.set(book2[uuid], book2);
        }, author);

        author = store.getObjectByUUID<Author>(author[uuid])!;
        book1 = store.getObjectByUUID<Book>(book1[uuid])!;
        book2 = store.getObjectByUUID<Book>(book2[uuid])!;

        expect(author.books.get(book1[uuid])).toBe(book1);
        expect(author.books.get(book2[uuid])).toBe(book2);
        expect(book1.author).toBe(author);
        expect(book2.author).toBe(author);
    });

    test("One-to-Many: Removing Books from Author", () => {
        let author = store.createObject<Author>("Author");
        let book1 = store.createObject<Book>("Book");
        let book2 = store.createObject<Book>("Book");

        store.updateObject((a) => {
            a.books.set(book1[uuid], book1);
            a.books.set(book2[uuid], book2);
        }, author);

        author = store.getObjectByUUID<Author>(author[uuid])!;

        store.updateObject((a) => {
            a.books.delete(book1[uuid]);
        }, author);

        author = store.getObjectByUUID<Author>(author[uuid])!;
        book1 = store.getObjectByUUID<Book>(book1[uuid])!;
        book2 = store.getObjectByUUID<Book>(book2[uuid])!;

        expect(author.books.has(book1[uuid])).toBe(false);
        expect(author.books.get(book2[uuid])).toBe(book2);
        expect(book1.author).toBeUndefined();
        expect(book2.author).toBe(author);
    });

    test("Many-to-One: Adding Books to Publisher", () => {
        let publisher = store.createObject<Publisher>("Publisher");
        let book1 = store.createObject<PublishedBook>("PublishedBook");
        let book2 = store.createObject<PublishedBook>("PublishedBook");

        store.updateObject((p) => {
            p.books.set(book1[uuid], book1);
            p.books.set(book2[uuid], book2);
        }, publisher);

        publisher = store.getObjectByUUID<Publisher>(publisher[uuid])!;
        book1 = store.getObjectByUUID<PublishedBook>(book1[uuid])!;
        book2 = store.getObjectByUUID<PublishedBook>(book2[uuid])!;

        expect(publisher.books.get(book1[uuid])).toBe(book1);
        expect(publisher.books.get(book2[uuid])).toBe(book2);
        expect(book1.publisher).toBe(publisher);
        expect(book2.publisher).toBe(publisher);
    });

    test("Many-to-One: Removing Books from Publisher", () => {
        let publisher = store.createObject<Publisher>("Publisher");
        let book1 = store.createObject<PublishedBook>("PublishedBook");
        let book2 = store.createObject<PublishedBook>("PublishedBook");

        store.updateObject((p) => {
            p.books.set(book1[uuid], book1);
            p.books.set(book2[uuid], book2);
        }, publisher);

        publisher = store.getObjectByUUID<Publisher>(publisher[uuid])!;

        store.updateObject((p) => {
            p.books.delete(book1[uuid]);
        }, publisher);

        publisher = store.getObjectByUUID<Publisher>(publisher[uuid])!;
        book1 = store.getObjectByUUID<PublishedBook>(book1[uuid])!;
        book2 = store.getObjectByUUID<PublishedBook>(book2[uuid])!;

        expect(publisher.books.has(book1[uuid])).toBe(false);
        expect(publisher.books.get(book2[uuid])).toBe(book2);
        expect(book1.publisher).toBeUndefined();
        expect(book2.publisher).toBe(publisher);
    });

    test("Many-to-Many: Adding Courses to Students", () => {
        let student1 = store.createObject<Student>("Student");
        let student2 = store.createObject<Student>("Student");
        let course1 = store.createObject<Course>("Course");
        let course2 = store.createObject<Course>("Course");

        store.updateObject((s) => {
            s.courses.set(course1[uuid], course1);
            s.courses.set(course2[uuid], course2);
        }, student1);

        student1 = store.getObjectByUUID<Student>(student1[uuid])!;
        course1 = store.getObjectByUUID<Course>(course1[uuid])!;
        course2 = store.getObjectByUUID<Course>(course2[uuid])!;

        store.updateObject((s) => {
            s.courses.set(course1[uuid], course1);
            s.courses.set(course2[uuid], course2);
        }, student2);

        student2 = store.getObjectByUUID<Student>(student2[uuid])!;
        student1 = store.getObjectByUUID<Student>(student1[uuid])!;
        course1 = store.getObjectByUUID<Course>(course1[uuid])!;
        course2 = store.getObjectByUUID<Course>(course2[uuid])!;

        expect(student1.courses.get(course1[uuid])).toBe(course1);
        expect(student1.courses.get(course2[uuid])).toBe(course2);
        expect(student2.courses.get(course1[uuid])).toBe(course1);
        expect(student2.courses.get(course2[uuid])).toBe(course2);
        expect(course1.students.get(student1[uuid])).toBe(student1);
        expect(course1.students.get(student2[uuid])).toBe(student2);
        expect(course2.students.get(student1[uuid])).toBe(student1);
        expect(course2.students.get(student2[uuid])).toBe(student2);
    });

    test("Many-to-Many: Removing Courses from Students", () => {
        let student1 = store.createObject<Student>("Student");
        let student2 = store.createObject<Student>("Student");
        let course1 = store.createObject<Course>("Course");
        let course2 = store.createObject<Course>("Course");

        store.updateObject((s) => {
            s.courses.set(course1[uuid], course1);
            s.courses.set(course2[uuid], course2);
        }, student1);

        student1 = store.getObjectByUUID<Student>(student1[uuid])!;
        course1 = store.getObjectByUUID<Course>(course1[uuid])!;
        course2 = store.getObjectByUUID<Course>(course2[uuid])!;

        store.updateObject((s) => {
            s.courses.set(course1[uuid], course1);
            s.courses.set(course2[uuid], course2);
        }, student2);

        student1 = store.getObjectByUUID<Student>(student1[uuid])!;

        store.updateObject((s) => {
            s.courses.delete(course1[uuid]);
        }, student1);

        student1 = store.getObjectByUUID<Student>(student1[uuid])!;
        student2 = store.getObjectByUUID<Student>(student2[uuid])!;
        course1 = store.getObjectByUUID<Course>(course1[uuid])!;
        course2 = store.getObjectByUUID<Course>(course2[uuid])!;

        expect(student1.courses.has(course1[uuid])).toBe(false);
        expect(student1.courses.get(course2[uuid])).toBe(course2);
        expect(student2.courses.get(course1[uuid])).toBe(course1);
        expect(student2.courses.get(course2[uuid])).toBe(course2);
        expect(course1.students.has(student1[uuid])).toBe(false);
        expect(course1.students.get(student2[uuid])).toBe(student2);
        expect(course2.students.get(student1[uuid])).toBe(student1);
        expect(course2.students.get(student2[uuid])).toBe(student2);
    });
});