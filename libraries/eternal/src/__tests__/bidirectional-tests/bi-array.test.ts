import { createStore } from "../../StoreFactory";
import { initializeSchemaRegistry } from "../../SchemaRegistry";
import { SchemaRegistry } from "../../handlers/MetaDefinitions";

const jsonSchemas = [
    {
        qName: "/library",
        version: "1.0",
        types: {
            "/library/Author": {
                properties: {
                    "/library/Author/name": { type: "string" },
                    "/library/Author/books": { 
                        type: "array", 
                        itemType: "object", 
                        inverseType: "/library/Book", 
                        inverseProp: "/library/Book/author",
                        minElements: "0",
                        maxElements: "100"
                    }
                }
            },
            "/library/Book": {
                properties: {
                    "/library/Book/title": { type: "string" },
                    "/library/Book/author": { 
                        type: "object", 
                        inverseType: "/library/Author", 
                        inverseProp: "/library/Author/books"
                    }
                }
            },
            "/library/Publisher": {
                properties: {
                    "/library/Publisher/name": { type: "string" },
                    "/library/Publisher/books": { 
                        type: "array", 
                        itemType: "object", 
                        inverseType: "/library/PublishedBook", 
                        inverseProp: "/library/PublishedBook/publisher",
                        minElements: "0",
                        maxElements: "100"
                    }
                }
            },
            "/library/PublishedBook": {
                properties: {
                    "/library/PublishedBook/title": { type: "string" },
                    "/library/PublishedBook/publisher": { 
                        type: "object", 
                        inverseType: "/library/Publisher", 
                        inverseProp: "/library/Publisher/books"
                    }
                }
            },
            "/school/Student": {
                properties: {
                    "/school/Student/name": { type: "string" },
                    "/school/Student/courses": { 
                        type: "array", 
                        itemType: "object", 
                        inverseType: "/school/Course", 
                        inverseProp: "/school/Course/students",
                        minElements: "0",
                        maxElements: "*"
                    }
                }
            },
            "/school/Course": {
                properties: {
                    "/school/Course/title": { type: "string" },
                    "/school/Course/students": { 
                        type: "array", 
                        itemType: "object", 
                        inverseType: "/school/Student", 
                        inverseProp: "/school/Student/courses",
                        minElements: "0",
                        maxElements: "*"
                    }
                }
            }
        }
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
        const schemaRegistry = initializeSchemaRegistry(jsonSchemas) as SchemaRegistry;
        store = createStore(schemaRegistry.schemas.get("/library")!);
    });

    test("One-to-Many: Adding Books to Author", () => {
        const author = store.createObject<Author>("Author");
        const book1 = store.createObject<Book>("Book");
        const book2 = store.createObject<Book>("Book");

        store.updateObject((a) => {
            a.books.push(book1, book2);
        }, author);

        expect(author.books).toContain(book1);
        expect(author.books).toContain(book2);
        expect(book1.author).toBe(author);
        expect(book2.author).toBe(author);
    });

    test("One-to-Many: Removing Books from Author", () => {
        const author = store.createObject<Author>("Author");
        const book1 = store.createObject<Book>("Book");
        const book2 = store.createObject<Book>("Book");

        store.updateObject((a) => {
            a.books.push(book1, book2);
        }, author);

        store.updateObject((a) => {
            a.books = a.books.filter(book => book !== book1);
        }, author);

        expect(author.books).not.toContain(book1);
        expect(author.books).toContain(book2);
        expect(book1.author).toBeUndefined();
        expect(book2.author).toBe(author);
    });

    test("Many-to-One: Adding Books to Publisher", () => {
        const publisher = store.createObject<Publisher>("Publisher");
        const book1 = store.createObject<PublishedBook>("PublishedBook");
        const book2 = store.createObject<PublishedBook>("PublishedBook");

        store.updateObject((p) => {
            p.books.push(book1, book2);
        }, publisher);

        expect(publisher.books).toContain(book1);
        expect(publisher.books).toContain(book2);
        expect(book1.publisher).toBe(publisher);
        expect(book2.publisher).toBe(publisher);
    });

    test("Many-to-One: Removing Books from Publisher", () => {
        const publisher = store.createObject<Publisher>("Publisher");
        const book1 = store.createObject<PublishedBook>("PublishedBook");
        const book2 = store.createObject<PublishedBook>("PublishedBook");

        store.updateObject((p) => {
            p.books.push(book1, book2);
        }, publisher);

        store.updateObject((p) => {
            p.books = p.books.filter(book => book !== book1);
        }, publisher);

        expect(publisher.books).not.toContain(book1);
        expect(publisher.books).toContain(book2);
        expect(book1.publisher).toBeUndefined();
        expect(book2.publisher).toBe(publisher);
    });

    test("Many-to-Many: Adding Courses to Students", () => {
        const student1 = store.createObject<Student>("Student");
        const student2 = store.createObject<Student>("Student");
        const course1 = store.createObject<Course>("Course");
        const course2 = store.createObject<Course>("Course");

        store.updateObject((s) => {
            s.courses.push(course1, course2);
        }, student1);

        store.updateObject((s) => {
            s.courses.push(course1, course2);
        }, student2);

        expect(student1.courses).toContain(course1);
        expect(student1.courses).toContain(course2);
        expect(student2.courses).toContain(course1);
        expect(student2.courses).toContain(course2);
        expect(course1.students).toContain(student1);
        expect(course1.students).toContain(student2);
        expect(course2.students).toContain(student1);
        expect(course2.students).toContain(student2);
    });

    test("Many-to-Many: Removing Courses from Students", () => {
        const student1 = store.createObject<Student>("Student");
        const student2 = store.createObject<Student>("Student");
        const course1 = store.createObject<Course>("Course");
        const course2 = store.createObject<Course>("Course");

        store.updateObject((s) => {
            s.courses.push(course1, course2);
        }, student1);

        store.updateObject((s) => {
            s.courses.push(course1, course2);
        }, student2);

        store.updateObject((s) => {
            s.courses = s.courses.filter(course => course !== course1);
        }, student1);

        expect(student1.courses).not.toContain(course1);
        expect(student1.courses).toContain(course2);
        expect(student2.courses).toContain(course1);
        expect(student2.courses).toContain(course2);
        expect(course1.students).not.toContain(student1);
        expect(course1.students).toContain(student2);
        expect(course2.students).toContain(student1);
        expect(course2.students).toContain(student2);
    });
});