import { IAssignmentType, ICourseType, IProgramType, IStudentType, ISubmissionType } from "./university.model.type"

const store = {
  programs: new Map<string, IProgramType>(),
  courses: new Map<string, ICourseType>(),
  students: new Map<string, IStudentType>(),
  submissions: new Map<string, ISubmissionType>(),
  assignments: new Map<string, IAssignmentType>(),
}

// export class Program implements IProgram {
//   id: string
//   name: string

//   private _courses: string[]
//   private _enrolledStudents: string[]

//   constructor(id: string, name: string) {
//     this.id = id
//     this.name = name
//     this._courses = []
//     this._enrolledStudents = []
//     store.programs.set(id, this)
//   }

//   set courses(c: ICourse[]) {
//     c.forEach((course) => {
//       if (!this._courses.find((courseId) => courseId === course.id)) {
//         this._courses.push(course.id)
//       }
//     })
//   }

//   get courses(): ICourse[] {
//     return this._courses.map((courseId) => store.courses.get(courseId)!)
//   }

//   set enrolledStudents(s: IStudent[]) {
//     s.forEach((student) => {
//       if (!this._enrolledStudents.find((studentId) => studentId === student.id)) {
//         this._enrolledStudents.push(student.id)
//       }
//     })
//   }

//   get enrolledStudents(): IStudent[] {
//     return this._enrolledStudents.map((studentId) => store.students.get(studentId)!)
//   }
// }

// export class Course implements ICourse {
//   id: string
//   name: string

//   private _program: string
//   private _students: string[]
//   private _assignments: string[]

//   constructor(id: string, name: string, program: Program) {
//     this.id = id
//     this.name = name
//     this._program = program.id
//     this._students = []
//     this._assignments = []
//     store.courses.set(id, this)
//   }

//   set program(p: IProgram) {
//     this._program = p.id
//   }

//   get program() {
//     return store.programs.get(this._program)!
//   }

//   set students(s: IStudent[]) {
//     s.forEach((student) => {
//       if (!this._students.find((studentId) => studentId === student.id)) {
//         this._students.push(student.id)
//       }
//     })
//   }

//   get students(): IStudent[] {
//     return this._students.map((studentId) => store.students.get(studentId)!)
//   }

//   set assignments(a: IAssignment[]) {
//     a.forEach((assignment) => {
//       if (!this._students.find((assignmentId) => assignmentId === assignment.id)) {
//         this._students.push(assignment.id)
//       }
//     })
//   }

//   get assignments(): IAssignment[] {
//     return this._assignments.map((assignmentId) => store.assignments.get(assignmentId)!)
//   }
// }

// export class Assignment implements IAssignment {
//   id: string
//   name: string
//   description: string

//   private _course: string

//   constructor(id: string, name: string, description: string, course: Course) {
//     this.id = id
//     this.name = name
//     this.description = description
//     this._course = course.id
//     store.assignments.set(id, this)
//   }

//   set course(c: ICourse) {
//     this._course = c.id
//   }

//   get course() {
//     return store.courses.get(this._course)!
//   }
// }

// export class Submission implements ISubmission {
//   id: string
//   student: Student
//   content: string
//   grade: number

//   private _assignment: string

//   constructor(id: string, student: Student, assignment: Assignment, content: string, grade: number) {
//     this.id = id
//     this.student = student
//     this._assignment = assignment.id
//     this.content = content
//     this.grade = grade
//     store.submissions.set(id, this)
//   }

//   set assignment(a: IAssignment) {
//     this._assignment = a.id
//   }

//   get assignment() {
//     return store.assignments.get(this._assignment)!
//   }
// }

// export class Student implements IStudent {
//   id: string
//   name: string
//   email: string

//   private _enrolledProgram: string
//   private _approvedCourses: string[]

//   constructor(id: string, name: string, email: string, program: Program) {
//     this.id = id
//     this.name = name
//     this.email = email
//     this._enrolledProgram = program.id
//     this._approvedCourses = []
//     store.students.set(id, this)
//   }

//   set enrolledProgram(p: IProgram) {
//     this._enrolledProgram = p.id
//   }
//   get enrolledProgram() {
//     return store.programs.get(this._enrolledProgram)!
//   }

//   set approvedCourses(c: ICourse[]) {
//     c.forEach((course) => {
//       if (!this._approvedCourses.find((courseId) => courseId === course.id)) {
//         this._approvedCourses.push(course.id)
//       }
//     })
//   }

//   get approvedCourses(): ICourse[] {
//     return this._approvedCourses.map((courseId) => store.courses.get(courseId)!)
//   }
// }
