import { ICourse, IProgram, IStudent } from "./university.model.type";

// one store? multiple stores?
const store = {
    programs: new Map<string, IProgram>(),
    courses: new Map<string, ICourse>(),
    students: new Map<string, IStudent>(),
};

export class Program implements IProgram {
    id: string;
    name: string;
    courses: ICourse[];
    enrolledStudents: Student[];

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
        this.courses = [];
        this.enrolledStudents = [];
        store.programs.set(id, this);
    }

    set course(c: ICourse) {
        if (!this.courses.find(course => {course.id === c.id})) {
            this.courses.push(c)
        }
    }

    getCourse(id: string) {
        return store.courses.get(id)!
    }
}

export class Course implements ICourse {
    id: string;
    name: string;
    _program: string;
    students: Student[];

    constructor(id: string, name: string, program: string) {
        this.id = id;
        this.name = name;
        this._program = program;
        this.students = []
    }

    set program(p: IProgram) {
        this._program = p.id
    }

    get program() {
        return store.programs.get(this._program)!
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
    }
}




