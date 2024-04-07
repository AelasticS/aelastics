import { IUniversity } from "./university.model.type";
import * as p from "./university-programs";
import * as s from "./university-students"


const ITU: IUniversity = {
    id: p.uuidv4Generator(),
    name: "ITU",
    programs: [p.softwareDesign, p.dataScience],
    students: [s.student1, s.student2, s.student3, s.student4, s.student5, s.student6, s.student7, s.student8]
}
