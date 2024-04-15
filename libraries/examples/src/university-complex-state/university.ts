import { IAssignment, ICourse, IProgram, IStudent, ISubmission } from "./university.model.type";

// one store? multiple stores?
const store = {
    programs: new Map<string, IProgram>(),
    courses: new Map<string, ICourse>(),
    students: new Map<string, IStudent>(),
    submissions: new Map<string, ISubmission>(),
    assignments: new Map<string, IAssignment>()
};

// TODO: add _ before every private variable

export class Program implements IProgram {
    id: string;
    name: string;
    courses: string[];
    enrolledStudents: Student[];

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
        this.courses = [];
        this.enrolledStudents = [];
        store.programs.set(id, this);
    }

    set course(c: ICourse) {
        if (!this.courses.find(courseId => {courseId === c.id})) {
            this.courses.push(c.id)
        }
    }

    getCourses(): ICourse[] {
        return this.courses.map(courseId => store.courses.get(courseId)!);
    }

    setEnrolledStudents(s: string) {
        // TODO: set student in parameter.
    }

    getEnrolledStudents() {
        // TODO: return all students whose Ids are present in this.enrolledStudents.
    }
}

export class Course implements ICourse {
    id: string;
    name: string;
    _program: string;
    students: Student[];
    assignment: Assignment[];

    constructor(id: string, name: string, program: string) {
        this.id = id;
        this.name = name;
        this._program = program;
        this.students = [];
        this.assignment = [];
        store.courses.set(id, this);
    }

    set program(p: IProgram) {
        this._program = p.id
    }

    get program() {
        return store.programs.get(this._program)!
    }
}

export class Submission implements ISubmission {
    id: string;
    student: Student;
    assignment: Assignment;
    content: string;
    grade: number;

    constructor(id: string, student: Student, assignment: Assignment, content: string, grade: number) {
        this.id = id;
        this.student = student;
        this.assignment = assignment;
        this.content = content;
        this.grade = grade;
        store.submissions.set(id, this);

    }
}

export class Student implements IStudent {
    id: string;
    name: string;
    email: string;
    enrolledProgram: Program;
    approvedCourses: Course[];

    constructor(id: string, name: string, email: string, enrolledProgram: Program, approvedCourses: Course[]) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.enrolledProgram = enrolledProgram;
        this.approvedCourses = approvedCourses;
        store.students.set(id, this);
    }
}

export class Assignment implements IAssignment {
    id: string;
    name: string;
    description: string;

    constructor(id: string, name: string, description: string) {
        this.id = id;
        this.name = name;
        this.description = description;
        store.assignments.set(id, this);
    }
}




