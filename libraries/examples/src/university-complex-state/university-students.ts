import { v4 as uuidv4 } from "uuid";
import { IStudent } from "./university.model.type";

const uuidv4Generator = () => {
    return uuidv4();
};

//#region Students
export const student1: IStudent = {
    id: uuidv4Generator(),
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    enrolledProgram: "Data Science",
    approvedCourses: [],
};

export const student2: IStudent = {
    id: uuidv4Generator(),
    name: "Bob Smith",
    email: "bob.smith@example.com",
    enrolledProgram: "Computer Science",
    approvedCourses: [],
};

export const student3: IStudent = {
    id: uuidv4Generator(),
    name: "Cara Stevens",
    email: "cara.stevens@example.com",
    enrolledProgram: "Data Science",
    approvedCourses: [],
};

export const student4: IStudent = {
    id: uuidv4Generator(),
    name: "David Peterson",
    email: "david.peterson@example.com",
    enrolledProgram: "Software Engineering",
    approvedCourses: [],
};

export const student5: IStudent = {
    id: uuidv4Generator(),
    name: "Eva Lawrence",
    email: "eva.lawrence@example.com",
    enrolledProgram: "Information Systems",
    approvedCourses: [],
};

export const student6: IStudent = {
    id: uuidv4Generator(),
    name: "Franklin Mars",
    email: "franklin.mars@example.com",
    enrolledProgram: "Cybersecurity",
    approvedCourses: [],
};

export const student7: IStudent = {
    id: uuidv4Generator(),
    name: "Grace Hamilton",
    email: "grace.hamilton@example.com",
    enrolledProgram: "Artificial Intelligence",
    approvedCourses: [],
};

export const student8: IStudent = {
    id: uuidv4Generator(),
    name: "Henry Ford",
    email: "henry.ford@example.com",
    enrolledProgram: "Computer Science",
    approvedCourses: [],
};
//#endregion
