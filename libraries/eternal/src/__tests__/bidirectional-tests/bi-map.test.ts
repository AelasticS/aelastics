import { createStore } from "../../StoreFactory";
import { initializeSchemaRegistry } from "../../SchemaRegistry";
import { SchemaRegistry } from "../../meta/InternalSchema";

import jsonSchemas from "../data/jsonSchemaWithMaps";

// TypeScript interfaces based on the type definitions
interface Author {
    uuid: string;
    name: string;
    books: Map<string, Book>;
}

interface Book {
    uuid: string;
    title: string;
    author: Author;
}

interface Publisher {
    uuid: string;
    name: string;
    books: Map<string, PublishedBook>;
}

interface PublishedBook {
    uuid: string;
    title: string;
    publisher: Publisher;
}

interface Student {
    uuid: string;
    name: string;
    courses: Map<string, Course>;
}

interface Course {
    uuid: string;
    title: string;
    students: Map<string, Student>;
}

describe("Bidirectional Relationships with Maps", () => {
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
            a.books.set(book1.uuid, book1);
            a.books.set(book2.uuid, book2);
        }, author);

        expect(author.books.get(book1.uuid)).toBe(book1);
        expect(author.books.get(book2.uuid)).toBe(book2);
        expect(book1.author).toBe(author);
        expect(book2.author).toBe(author);
    });

    test("One-to-Many: Removing Books from Author", () => {
        const author = store.createObject<Author>("Author");
        const book1 = store.createObject<Book>("Book");
        const book2 = store.createObject<Book>("Book");

        store.updateObject((a) => {
            a.books.set(book1.uuid, book1);
            a.books.set(book2.uuid, book2);
        }, author);

        store.updateObject((a) => {
            a.books.delete(book1.uuid);
        }, author);

        expect(author.books.has(book1.uuid)).toBe(false);
        expect(author.books.get(book2.uuid)).toBe(book2);
        expect(book1.author).toBeUndefined();
        expect(book2.author).toBe(author);
    });

    test("Many-to-One: Adding Books to Publisher", () => {
        const publisher = store.createObject<Publisher>("Publisher");
        const book1 = store.createObject<PublishedBook>("PublishedBook");
        const book2 = store.createObject<PublishedBook>("PublishedBook");

        store.updateObject((p) => {
            p.books.set(book1.uuid, book1);
            p.books.set(book2.uuid, book2);
        }, publisher);

        expect(publisher.books.get(book1.uuid)).toBe(book1);
        expect(publisher.books.get(book2.uuid)).toBe(book2);
        expect(book1.publisher).toBe(publisher);
        expect(book2.publisher).toBe(publisher);
    });

    test("Many-to-One: Removing Books from Publisher", () => {
        const publisher = store.createObject<Publisher>("Publisher");
        const book1 = store.createObject<PublishedBook>("PublishedBook");
        const book2 = store.createObject<PublishedBook>("PublishedBook");

        store.updateObject((p) => {
            p.books.set(book1.uuid, book1);
            p.books.set(book2.uuid, book2);
        }, publisher);

        store.updateObject((p) => {
            p.books.delete(book1.uuid);
        }, publisher);

        expect(publisher.books.has(book1.uuid)).toBe(false);
        expect(publisher.books.get(book2.uuid)).toBe(book2);
        expect(book1.publisher).toBeUndefined();
        expect(book2.publisher).toBe(publisher);
    });

    test("Many-to-Many: Adding Courses to Students", () => {
        const student1 = store.createObject<Student>("Student");
        const student2 = store.createObject<Student>("Student");
        const course1 = store.createObject<Course>("Course");
        const course2 = store.createObject<Course>("Course");

        store.updateObject((s) => {
            s.courses.set(course1.uuid, course1);
            s.courses.set(course2.uuid, course2);
        }, student1);

        store.updateObject((s) => {
            s.courses.set(course1.uuid, course1);
            s.courses.set(course2.uuid, course2);
        }, student2);

        expect(student1.courses.get(course1.uuid)).toBe(course1);
        expect(student1.courses.get(course2.uuid)).toBe(course2);
        expect(student2.courses.get(course1.uuid)).toBe(course1);
        expect(student2.courses.get(course2.uuid)).toBe(course2);
        expect(course1.students.get(student1.uuid)).toBe(student1);
        expect(course1.students.get(student2.uuid)).toBe(student2);
        expect(course2.students.get(student1.uuid)).toBe(student1);
        expect(course2.students.get(student2.uuid)).toBe(student2);
    });

    test("Many-to-Many: Removing Courses from Students", () => {
        const student1 = store.createObject<Student>("Student");
        const student2 = store.createObject<Student>("Student");
        const course1 = store.createObject<Course>("Course");
        const course2 = store.createObject<Course>("Course");

        store.updateObject((s) => {
            s.courses.set(course1.uuid, course1);
            s.courses.set(course2.uuid, course2);
        }, student1);

        store.updateObject((s) => {
            s.courses.set(course1.uuid, course1);
            s.courses.set(course2.uuid, course2);
        }, student2);

        store.updateObject((s) => {
            s.courses.delete(course1.uuid);
        }, student1);

        expect(student1.courses.has(course1.uuid)).toBe(false);
        expect(student1.courses.get(course2.uuid)).toBe(course2);
        expect(student2.courses.get(course1.uuid)).toBe(course1);
        expect(student2.courses.get(course2.uuid)).toBe(course2);
        expect(course1.students.has(student1.uuid)).toBe(false);
        expect(course1.students.get(student2.uuid)).toBe(student2);
        expect(course2.students.get(student1.uuid)).toBe(student1);
        expect(course2.students.get(student2.uuid)).toBe(student2);
    });
});