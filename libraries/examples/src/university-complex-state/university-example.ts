import { v4 as uuidv4 } from "uuid";
import { IAssignment, ICourse, IProgram, IStudent } from "./university.model.type";

const uuidv4Generator = () => {
    return uuidv4();
};


//#region Programs
export const softwareDesign: IProgram = {
    id: uuidv4Generator(),
    name: "Software Design",
    courses: [pcpp, faw],
    enrolledStudents: [student1]
}

export const dataScience: IProgram = {
    id: uuidv4Generator(),
    name: "Data Science",
    courses: [ids, ml],
    enrolledStudents: [student2]

}
//#endregion


//#region Students
export const student1: IStudent = {
    id: uuidv4Generator(),
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    enrolledProgram: dataScience,
    approvedCourses: [],
};

export const student2: IStudent = {
    id: uuidv4Generator(),
    name: "Bob Smith",
    email: "bob.smith@example.com",
    enrolledProgram: softwareDesign,
    approvedCourses: [],
};
//#endregion


//#region Assignments Software Design
// Assignment Parallel and Functional Programming
const assignmentPCPP: IAssignment = {
    id: uuidv4Generator(),
    name: "Parallel Sorting Algorithms",
    description: "Implement parallel versions of merge sort and quick sort."
}

// Assignment Frameworks and Architectures of the Web
const assignmentFAW: IAssignment = {
    id: uuidv4Generator(),
    name: "RESTful API Design",
    description: "Design a RESTful API for a book library system."
}

// Assignments Data Science
// Assignment Introduction to Data Science
const assignmentIDS: IAssignment = {
    id: uuidv4Generator(),
    name: "Data Cleaning and Preparation",
    description: "Prepare and clean a dataset for analysis."
}

// Assignment 1 and 2 Machine Learning
const assignmentML: IAssignment = {
    id: uuidv4Generator(),
    name: "Linear Regression Model",
    description: "Build and evaluate a linear regression model on a dataset."
}
//#endregion


//#region Courses
// Parallel and Concurrent Programming
const pcpp: ICourse = {
    id: uuidv4Generator(),
    name: "Parallel and Concurrent Programming",
    program: softwareDesign,
    students: [student1],
    assignment: assignmentPCPP
};

// Frameworks and Architectures of the Web
const faw: ICourse = {
    id: uuidv4Generator(),
    name: "Frameworks and Architectures of the Web",
    program: softwareDesign,
    students: [student1],
    assignment: assignmentFAW
};

// Introduction to Data Science
const ids: ICourse = {
    id: uuidv4Generator(),
    name: "Introduction to Data Science",
    program: dataScience,
    students: [student2],
    assignment: assignmentIDS
};

// Machine Learning
const ml: ICourse = {
    id: uuidv4Generator(),
    name: "Machine Learning",
    program: dataScience,
    students: [student2],
    assignment: assignmentML
};
//#endregion





