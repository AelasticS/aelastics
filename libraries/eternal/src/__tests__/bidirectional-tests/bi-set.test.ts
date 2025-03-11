import { createStore } from "../../StoreFactory";
import { initializeSchemaRegistry } from "../../SchemaRegistry";
import { SchemaRegistry } from "../../meta/InternalSchema";

import jsonSchemas from "../data/jsonSchemaWithArrays";

// TypeScript interfaces based on the type definitions
interface Author {
    uuid: string;
    name: string;
    books: Set<Book>;
}

interface Book {
    uuid: string;
    title: string;
    author: Author;
}

interface Publisher {
    uuid: string;
    name: string;
    books: Set<PublishedBook>;
}

interface PublishedBook {
    uuid: string;
    title: string;
    publisher: Publisher;
}

interface Student {
    uuid: string;
    name: string;
    courses: Set<Course>;
}

interface Course {
    uuid: string;
    title: string;
    students: Set<Student>;
}

describe("Bidirectional Relationships with Sets", () => {
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
            a.books.add(book1);
            a.books.add(book2);
        }, author);

        expect(author.books.has(book1)).toBe(true);
        expect(author.books.has(book2)).toBe(true);
        expect(book1.author).toBe(author);
        expect(book2.author).toBe(author);
    });

    test("One-to-Many: Removing Books from Author", () => {
        const author = store.createObject<Author>("Author");
        const book1 = store.createObject<Book>("Book");
        const book2 = store.createObject<Book>("Book");

        store.updateObject((a) => {
            a.books.add(book1);
            a.books.add(book2);
        }, author);

        store.updateObject((a) => {
            a.books.delete(book1);
        }, author);

        expect(author.books.has(book1)).toBe(false);
        expect(author.books.has(book2)).toBe(true);
        expect(book1.author).toBeUndefined();
        expect(book2.author).toBe(author);
    });

    test("Many-to-One: Adding Books to Publisher", () => {
        const publisher = store.createObject<Publisher>("Publisher");
        const book1 = store.createObject<PublishedBook>("PublishedBook");
        const book2 = store.createObject<PublishedBook>("PublishedBook");

        store.updateObject((p) => {
            p.books.add(book1);
            p.books.add(book2);
        }, publisher);

        expect(publisher.books.has(book1)).toBe(true);
        expect(publisher.books.has(book2)).toBe(true);
        expect(book1.publisher).toBe(publisher);
        expect(book2.publisher).toBe(publisher);
    });

    test("Many-to-One: Removing Books from Publisher", () => {
        const publisher = store.createObject<Publisher>("Publisher");
        const book1 = store.createObject<PublishedBook>("PublishedBook");
        const book2 = store.createObject<PublishedBook>("PublishedBook");

        store.updateObject((p) => {
            p.books.add(book1);
            p.books.add(book2);
        }, publisher);

        store.updateObject((p) => {
            p.books.delete(book1);
        }, publisher);

        expect(publisher.books.has(book1)).toBe(false);
        expect(publisher.books.has(book2)).toBe(true);
        expect(book1.publisher).toBeUndefined();
        expect(book2.publisher).toBe(publisher);
    });

    test("Many-to-Many: Adding Courses to Students", () => {
        const student1 = store.createObject<Student>("Student");
        const student2 = store.createObject<Student>("Student");
        const course1 = store.createObject<Course>("Course");
        const course2 = store.createObject<Course>("Course");

        store.updateObject((s) => {
            s.courses.add(course1);
            s.courses.add(course2);
        }, student1);

        store.updateObject((s) => {
            s.courses.add(course1);
            s.courses.add(course2);
        }, student2);

        expect(student1.courses.has(course1)).toBe(true);
        expect(student1.courses.has(course2)).toBe(true);
        expect(student2.courses.has(course1)).toBe(true);
        expect(student2.courses.has(course2)).toBe(true);
        expect(course1.students.has(student1)).toBe(true);
        expect(course1.students.has(student2)).toBe(true);
        expect(course2.students.has(student1)).toBe(true);
        expect(course2.students.has(student2)).toBe(true);
    });

    test("Many-to-Many: Removing Courses from Students", () => {
        const student1 = store.createObject<Student>("Student");
        const student2 = store.createObject<Student>("Student");
        const course1 = store.createObject<Course>("Course");
        const course2 = store.createObject<Course>("Course");

        store.updateObject((s) => {
            s.courses.add(course1);
            s.courses.add(course2);
        }, student1);

        store.updateObject((s) => {
            s.courses.add(course1);
            s.courses.add(course2);
        }, student2);

        store.updateObject((s) => {
            s.courses.delete(course1);
        }, student1);

        expect(student1.courses.has(course1)).toBe(false);
        expect(student1.courses.has(course2)).toBe(true);
        expect(student2.courses.has(course1)).toBe(true);
        expect(student2.courses.has(course2)).toBe(true);
        expect(course1.students.has(student1)).toBe(false);
        expect(course1.students.has(student2)).toBe(true);
        expect(course2.students.has(student1)).toBe(true);
        expect(course2.students.has(student2)).toBe(true);
    });
});
