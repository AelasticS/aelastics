import { createStore } from "../../store/createStore";
import { StoreObject, uuid } from "../../store/InternalTypes";
import { RegistryService } from "../../registry/RegistryService";
import { Namespace, RegistryMetadata } from "../../registry/NamespaceMetadata";
import { ObjectTypeMeta, PropertyMeta } from "../../registry/TypeDefinitions";

// import jsonSchemas from "../data/jsonSchemaWithMaps";


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
                typeRef: "/std/map<string, /library/Book>",
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
                inverseType: "map"
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
                typeRef: "/std/map<string, /library/PublishedBook>",
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
                inverseType: "map"
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
                typeRef: "/std/map<string, /library/Course>",
                optional: false,
                inverseProp: "students",
                inverseTypeRef: "/library/Course",
                inverseType: "map"
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
                typeRef: "/std/map<string, /library/Student>",
                optional: false,
                inverseProp: "courses",
                inverseTypeRef: "/library/Student",
                inverseType: "map"
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
    });

    test("One-to-Many: Adding Books to Author", () => {
        let author = store.objects.create<Author>("/library/Author");
        let book1 = store.objects.create<Book>("/library/Book");
        let book2 = store.objects.create<Book>("/library/Book");

        store.objects.update((a) => {
            a.books.set(book1[uuid], book1);
            a.books.set(book2[uuid], book2);
        }, author);

        author = store.objects.findByUUID<Author>(author[uuid])!;
        book1 = store.objects.findByUUID<Book>(book1[uuid])!;
        book2 = store.objects.findByUUID<Book>(book2[uuid])!;

        expect(author.books.get(book1[uuid])).toBe(book1);
        expect(author.books.get(book2[uuid])).toBe(book2);
        expect(book1.author).toBe(author);
        expect(book2.author).toBe(author);
    });

    test("One-to-Many: Removing Books from Author", () => {
        let author = store.objects.create<Author>("/library/Author");
        let book1 = store.objects.create<Book>("/library/Book");
        let book2 = store.objects.create<Book>("/library/Book");

        store.objects.update((a) => {
            a.books.set(book1[uuid], book1);
            a.books.set(book2[uuid], book2);
        }, author);

        author = store.objects.findByUUID<Author>(author[uuid])!;

        store.objects.update((a) => {
            a.books.delete(book1[uuid]);
        }, author);

        author = store.objects.findByUUID<Author>(author[uuid])!;
        book1 = store.objects.findByUUID<Book>(book1[uuid])!;
        book2 = store.objects.findByUUID<Book>(book2[uuid])!;

        expect(author.books.has(book1[uuid])).toBe(false);
        expect(author.books.get(book2[uuid])).toBe(book2);
        expect(book1.author).toBeUndefined();
        expect(book2.author).toBe(author);
    });

    test("Many-to-One: Adding Books to Publisher", () => {
        let publisher = store.objects.create<Publisher>("/library/Publisher");
        let book1 = store.objects.create<PublishedBook>("/library/PublishedBook");
        let book2 = store.objects.create<PublishedBook>("/library/PublishedBook");

        store.objects.update((p) => {
            p.books.set(book1[uuid], book1);
            p.books.set(book2[uuid], book2);
        }, publisher);

        publisher = store.objects.findByUUID<Publisher>(publisher[uuid])!;
        book1 = store.objects.findByUUID<PublishedBook>(book1[uuid])!;
        book2 = store.objects.findByUUID<PublishedBook>(book2[uuid])!;

        expect(publisher.books.get(book1[uuid])).toBe(book1);
        expect(publisher.books.get(book2[uuid])).toBe(book2);
        expect(book1.publisher).toBe(publisher);
        expect(book2.publisher).toBe(publisher);
    });

    test("Many-to-One: Removing Books from Publisher", () => {
        let publisher = store.objects.create<Publisher>("/library/Publisher");
        let book1 = store.objects.create<PublishedBook>("/library/PublishedBook");
        let book2 = store.objects.create<PublishedBook>("/library/PublishedBook");

        store.objects.update((p) => {
            p.books.set(book1[uuid], book1);
            p.books.set(book2[uuid], book2);
        }, publisher);

        publisher = store.objects.findByUUID<Publisher>(publisher[uuid])!;

        store.objects.update((p) => {
            p.books.delete(book1[uuid]);
        }, publisher);

        publisher = store.objects.findByUUID<Publisher>(publisher[uuid])!;
        book1 = store.objects.findByUUID<PublishedBook>(book1[uuid])!;
        book2 = store.objects.findByUUID<PublishedBook>(book2[uuid])!;

        expect(publisher.books.has(book1[uuid])).toBe(false);
        expect(publisher.books.get(book2[uuid])).toBe(book2);
        expect(book1.publisher).toBeUndefined();
        expect(book2.publisher).toBe(publisher);
    });

    test("Many-to-Many: Adding Courses to Students", () => {
        let student1 = store.objects.create<Student>("/library/Student");
        let student2 = store.objects.create<Student>("/library/Student");
        let course1 = store.objects.create<Course>("/library/Course");
        let course2 = store.objects.create<Course>("/library/Course");

        store.objects.update((s) => {
            s.courses.set(course1[uuid], course1);
            s.courses.set(course2[uuid], course2);
        }, student1);

        student1 = store.objects.findByUUID<Student>(student1[uuid])!;
        course1 = store.objects.findByUUID<Course>(course1[uuid])!;
        course2 = store.objects.findByUUID<Course>(course2[uuid])!;

        store.objects.update((s) => {
            s.courses.set(course1[uuid], course1);
            s.courses.set(course2[uuid], course2);
        }, student2);

        student2 = store.objects.findByUUID<Student>(student2[uuid])!;
        student1 = store.objects.findByUUID<Student>(student1[uuid])!;
        course1 = store.objects.findByUUID<Course>(course1[uuid])!;
        course2 = store.objects.findByUUID<Course>(course2[uuid])!;

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
        let student1 = store.objects.create<Student>("/library/Student");
        let student2 = store.objects.create<Student>("/library/Student");
        let course1 = store.objects.create<Course>("/library/Course");
        let course2 = store.objects.create<Course>("/library/Course");

        store.objects.update((s) => {
            s.courses.set(course1[uuid], course1);
            s.courses.set(course2[uuid], course2);
        }, student1);

        student1 = store.objects.findByUUID<Student>(student1[uuid])!;
        course1 = store.objects.findByUUID<Course>(course1[uuid])!;
        course2 = store.objects.findByUUID<Course>(course2[uuid])!;

        store.objects.update((s) => {
            s.courses.set(course1[uuid], course1);
            s.courses.set(course2[uuid], course2);
        }, student2);

        student1 = store.objects.findByUUID<Student>(student1[uuid])!;

        store.objects.update((s) => {
            s.courses.delete(course1[uuid]);
        }, student1);

        student1 = store.objects.findByUUID<Student>(student1[uuid])!;
        student2 = store.objects.findByUUID<Student>(student2[uuid])!;
        course1 = store.objects.findByUUID<Course>(course1[uuid])!;
        course2 = store.objects.findByUUID<Course>(course2[uuid])!;

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