import { v4 as uuidv4 } from "uuid";
import { IAssignment, ICourse, IModule, IProgram } from "./university.model.type";
import * as s from "./university-students"

export const uuidv4Generator = () => {
    return uuidv4();
};

//#region Assignments Software Design
// Assignment 1 and 2 Parallel and Functional Programming
const assignment1PCPP: IAssignment = {
    id: uuidv4Generator(),
    name: "Parallel Sorting Algorithms",
    description: "Implement parallel versions of merge sort and quick sort."
}

const assignment2PCPP: IAssignment = { 
    id: uuidv4Generator(),
    name: "Concurrency in Functional Programming",
    description: "Explore concurrency models in functional programming languages."
}

// Assignment 1 and 2 Frameworks and Architectures of the Web
const assignment1FAW: IAssignment = {
    id: uuidv4Generator(),
    name: "RESTful API Design",
    description: "Design a RESTful API for a book library system."
}

const assignment2FAW: IAssignment = { 
    id: uuidv4Generator(),
    name: "Single Page Application (SPA) Architecture",
    description: "Develop a SPA using React and document its architecture."
}

// Assignment 1 and 2 Distributed Systems
const assignment1DS: IAssignment = {
    id: uuidv4Generator(),
    name: "Distributed File System",
    description: "Implement a simple distributed file system."
}

const assignment2DS: IAssignment = { 
    id: uuidv4Generator(),
    name: "CAP Theorem Analysis",
    description: "Analyze the CAP theorem with real-world distributed systems examples."
}

// Assignments Data Science
// Assignment 1 and 2 Introduction to Data Science
const assignment1IDS: IAssignment = {
    id: uuidv4Generator(),
    name: "Data Cleaning and Preparation",
    description: "Prepare and clean a dataset for analysis."
}

const assignment2IDS: IAssignment = { 
    id: uuidv4Generator(),
    name: "Exploratory Data Analysis (EDA)",
    description: "Conduct EDA on a given dataset and present findings."
}

// Assignment 1 and 2 Machine Learning
const assignment1ML: IAssignment = {
    id: uuidv4Generator(),
    name: "Linear Regression Model",
    description: "Build and evaluate a linear regression model on a dataset."
}

const assignment2ML: IAssignment = { 
    id: uuidv4Generator(),
    name: "Classification with Decision Trees",
    description: "Implement a decision tree classifier and analyze its performance."
}

// Assignment 1 and 2 Big Data Analytics
const assignment1BDA: IAssignment = {
    id: uuidv4Generator(),
    name: "Big Data Ecosystem Overview",
    description: "Provide an overview of Big Data technologies and their use cases."
}

const assignment2BDA: IAssignment = { 
    id: uuidv4Generator(),
    name: "Real-time Data Processing",
    description: "Implement a simple real-time data processing pipeline."
}
//#endregion

//#region Modules
// Module 1 and 2 Parallel and Functional Programming
const module1PCPP: IModule = {
    id: uuidv4Generator(),
    name: "PCPP - Module 1",
    assignments: [assignment1PCPP]
};

const module2PCPP: IModule = {
    id: uuidv4Generator(),
    name: "PCPP - Module 2",
    assignments: [assignment2PCPP]
};

// Module 1 and 2 Frameworks and Architectures of the Web
const module1FAW: IModule = {
    id: uuidv4Generator(),
    name: "FAW - Module 1",
    assignments: [assignment1FAW]
};

const module2FAW: IModule = {
    id: uuidv4Generator(),
    name: "FAW - Module 2",
    assignments: [assignment2FAW]
};

// Module 1 and 2 Distributed Systems
const module1DS: IModule = {
    id: uuidv4Generator(),
    name: "DS - Module 1",
    assignments: [assignment1DS]
};

const module2DS: IModule = {
    id: uuidv4Generator(),
    name: "DS - Module 2",
    assignments: [assignment2DS]
};

// Module 1 and 2 Introduction to Data Science
const module1IDS: IModule = {
    id: uuidv4Generator(),
    name: "IDS - Module 1",
    assignments: [assignment1IDS]
};

const module2IDS: IModule = {
    id: uuidv4Generator(),
    name: "IDS - Module 2",
    assignments: [assignment2IDS]
};

// Module 1 and 2 Machine Learning
const module1ML: IModule = {
    id: uuidv4Generator(),
    name: "ML - Module 1",
    assignments: [assignment1ML]
};

const module2ML: IModule = {
    id: uuidv4Generator(),
    name: "ML - Module 2",
    assignments: [assignment2ML]
};

// Module 1 and 2 Big Data Analytics
const module1BDA: IModule = {
    id: uuidv4Generator(),
    name: "BDA - Module 1",
    assignments: [assignment1BDA]
};

const module2BDA: IModule = {
    id: uuidv4Generator(),
    name: "BDA - Module 2",
    assignments: [assignment2BDA]
};
//#endregion

//#region Courses
// Parallel and Concurrent Programming
const pcpp: ICourse = {
    id: uuidv4Generator(),
    name: "Parallel and Concurrent Programming",
    modules: [module1PCPP, module2PCPP]
};

// Frameworks and Architectures of the Web
const faw: ICourse = {
    id: uuidv4Generator(),
    name: "Frameworks and Architectures of the Web",
    modules: [module1FAW, module2FAW]
};

// Distributed Systems
const ds: ICourse = {
    id: uuidv4Generator(),
    name: "Distributed Systems",
    modules: [module1DS, module2DS]
};

// Introduction to Data Science
const ids: ICourse = {
    id: uuidv4Generator(),
    name: "Introduction to Data Science",
    modules: [module1IDS, module2IDS]
};

// Machine Learning
const ml: ICourse = {
    id: uuidv4Generator(),
    name: "Machine Learning",
    modules: [module1ML, module2ML]
};

// Big Data Analytics
const bda: ICourse = {
    id: uuidv4Generator(),
    name: "Big Data Analytics",
    modules: [module1BDA, module2BDA]
};
//#endregion

//#region Programs
export const softwareDesign: IProgram = {
    id: uuidv4Generator(),
    name: "Software Design",
    courses: [pcpp, faw, ds],
    students: [s.student1, s.student2, s.student3, s.student4]
}

export const dataScience: IProgram = {
    id: uuidv4Generator(),
    name: "Data Science",
    courses: [ids, ml, bda],
    students: [s.student5, s.student6, s.student7, s.student8]

}
//#endregion



