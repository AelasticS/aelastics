import { v4 as uuidv4 } from "uuid";
import { Program, Course, Assignment, Student, Submission } from "./university";

export const uuidv4Generator = () => {
    return uuidv4();
};

const store = {
    programs: new Map<string, Program>(),
    courses: new Map<string, Course>(),
    students: new Map<string, Student>(),
    submissions: new Map<string, Submission>(),
    assignments: new Map<string, Assignment>(),
  }

// Programs
const softwareDesign = new Program(uuidv4Generator(), "Software Design");
const dataScience = new Program(uuidv4Generator(), "Data Science");

// Courses
const pcpp = new Course(uuidv4Generator(), "Parallel and Concurrent Programming", softwareDesign);
const faw = new Course(uuidv4Generator(), "Frameworks and Architectures of the Web", softwareDesign);
const ids = new Course(uuidv4Generator(), "Introduction to Data Science", dataScience);
const ml = new Course(uuidv4Generator(), "Machine Learning", dataScience);

// Assignments
const assignmentPCPP = new Assignment(uuidv4Generator(), "Parallel Sorting Algorithms", "Implement parallel versions of merge sort and quick sort.", pcpp);
const assignmentFAW = new Assignment(uuidv4Generator(), "RESTful API Design", "Design a RESTful API for a book library system.", faw);
const assignmentIDS = new Assignment(uuidv4Generator(), "Data Cleaning and Preparation", "Prepare and clean a dataset for analysis.", ids);
const assignmentML = new Assignment(uuidv4Generator(), "Linear Regression Model", "Build and evaluate a linear regression model on a dataset.", ml);

// Students
const student1 = new Student(uuidv4Generator(), "Alice Johnson", "alice.johnson@example.com", dataScience);
const student2 = new Student(uuidv4Generator(), "Bob Smith", "bob.smith@example.com", softwareDesign);

// Submissions
const submission1 = new Submission(uuidv4Generator(), student1, assignmentPCPP, "Submission 1 content", 12);
const submission2 = new Submission(uuidv4Generator(), student2, assignmentML, "Submission 2 content", 10);

// Using setters to establish relationships
softwareDesign.courses = [pcpp, faw];
dataScience.courses = [ids, ml];

softwareDesign.enrolledStudents = [student1];
dataScience.enrolledStudents = [student2];

pcpp.assignments = assignmentPCPP;
faw.assignments = assignmentFAW;
ids.assignments = assignmentIDS;
ml.assignments = assignmentML;

pcpp.students = student1;
faw.students = student1;
ids.students = student2;
ml.students = student2;

student1.approvedCourses = [pcpp, faw];
student2.approvedCourses = [ids, ml];
