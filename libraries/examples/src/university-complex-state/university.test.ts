import { ImmutableStore } from "aelastics-store"
import { Assignment, Course, Program, UniversitySchema } from "./university.model.type"
import { v4 as uuidv4 } from "uuid"

export const uuidv4Generator = () => {
  return uuidv4()
}

describe("create new object in immutable store", () => {
  const immutableStore = new ImmutableStore()
  const softwareDesign = immutableStore.newObject(Program, {
    id: uuidv4Generator(),
    name: "Software Design",
    courses: [],
    enrolledStudents: [],
  })

  const pcpp = immutableStore.newObject(Course, {
    id: uuidv4Generator(),
    name: "PCPP",
    program: softwareDesign,
    students: [],
    assignments: [],
  })

  const pcppAssignment = immutableStore.newObject(Assignment, {
    id: uuidv4Generator(),
    name: "PCPP Assignment",
    description: "PCPP assignment description",
    course: pcpp,
  })

  it("log contents", () => {
    console.log("immutable store contents: ", immutableStore)
    console.log("ctx contents: ", immutableStore.ctx)
    console.log("schema contents: ", UniversitySchema)

    expect(NaN).toEqual(NaN)
  })
})
