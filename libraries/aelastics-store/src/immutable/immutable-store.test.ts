import * as t from "aelastics-types"
import { ImmutableStore } from "./immutable-store"
import { ImmutableObject, objectStatus } from "../common/CommonConstants"
import { StatusValue } from "../common/Status"

// ----------------------------------------------
// Define the schema for the university domain
export const UniversitySchema = t.schema("UniversitySchema")

// Define the object types for the university domain
export const ProgramType = t.entity(
  {
    id: t.string,
    name: t.string,
    courses: t.optional(t.arrayOf(t.link(UniversitySchema, "Course", "CourseType"))),
  },
  ["id"],
  "Program",
  UniversitySchema
)

export const CourseType = t.entity(
  {
    id: t.string,
    name: t.string,
    program: t.optional(ProgramType),
  },
  ["id"],
  "Course",
  UniversitySchema
)

// Define the inverse properties for the university domain
t.inverseProps(ProgramType, "courses", CourseType, "program")

// Define the interface types for the university domain
type IProgramType = t.TypeOf<typeof ProgramType> & ImmutableObject
type ICourseType = t.TypeOf<typeof CourseType> & ImmutableObject

// ----------------------------------------------
// Define the schema for the university domain
const UniversitySchema2 = t.schema("UniversitySchema2")

// Define the object types for the university domain
const StudentType = t.entity(
  {
    id: t.string,
    name: t.string,
    tutor: t.optional(t.link(UniversitySchema2, "Tutor", "TutorType")),
  },
  ["id"],
  "Student",
  UniversitySchema2
)

const TutorType = t.entity(
  {
    id: t.string,
    name: t.string,
    tutee: t.optional(StudentType),
  },
  ["id"],
  "Tutor",
  UniversitySchema2
)

// Define the inverse properties for the university domain
t.inverseProps(StudentType, "tutor", TutorType, "tutee")

// Define the interface types for the university domain
type IStudentType = t.TypeOf<typeof StudentType> // & ImmutableObject
type ITutorType = t.TypeOf<typeof TutorType> // & ImmutableObject

// ----------------------------------------------
describe("ImmutableStore", () => {
  let immutableStore: ImmutableStore<IStudentType>

  let initStudent: IStudentType = {
    id: "1",
    name: "student1",
    tutor: undefined,
  }

  test("should create a new instance of the state root when a simple prop of it is updated", () => {
    // Arrange
    immutableStore = new ImmutableStore<IStudentType>(StudentType)
    const student: ImmutableObject = immutableStore.createRoot(initStudent, "1") as unknown as ImmutableObject
    const oldState = immutableStore.getState()

    // Act
    const newState = immutableStore.produce((draft) => {
      draft.name = "new student name"
    })

    // Assert
    expect(oldState).not.toBe(newState)
    expect(oldState.name).toEqual("student1")
    expect(newState.name).toEqual("new student name")
  })

  test("should create a new instance of the state root when a simple prop of a nested object is updated", () => {
    // Arrange
    immutableStore = new ImmutableStore<IStudentType>(StudentType)
    const student: ImmutableObject = immutableStore.createRoot(initStudent, "1") as unknown as ImmutableObject
    let tt = immutableStore.newObject(TutorType, { id: "2", name: "tutor1" }, "2")
    student.tutor = tt
    student[objectStatus] = StatusValue.Unmodified
    tt[objectStatus] = StatusValue.Unmodified
    const oldState = immutableStore.getState()

    // Act
    const newState = immutableStore.produce((draft) => {
      draft.tutor.name = "new tutor name"
    })

    // Assert
    expect(oldState).not.toBe(newState)
    expect(oldState.tutor.name).toEqual("tutor1")
    expect(oldState.tutor).not.toBe(newState.tutor)
    expect(newState.tutor.name).toEqual("new tutor name")
  })

  test("should create a new instance of the state root when a cyclic prop of a nested object is updated", () => {
    // Arrange
    immutableStore = new ImmutableStore<IStudentType>(StudentType)
    const student: ImmutableObject = immutableStore.createRoot(initStudent, "1") as unknown as ImmutableObject
    student[objectStatus] = StatusValue.Unmodified
    const oldState = immutableStore.getState()

    // Act
    immutableStore.produce((draft) => {
      const tt = immutableStore.newObject(TutorType, { id: "2", name: "tutor1" })
      draft.tutor = tt
    })

    // Assert
    expect(oldState).not.toBe(immutableStore.getState())
  })

  // One-to-one
  test("Updates on one side of the relationship should be reflected on the other side of it.", () => {
    // Arrange
    immutableStore = new ImmutableStore<IStudentType>(StudentType)
    const student: ImmutableObject = immutableStore.createRoot(initStudent, "1") as unknown as ImmutableObject
    let tutor

    // Act
    immutableStore.produce((draft) => {
      tutor = immutableStore.newObject(TutorType, { id: "2", name: "tutor1", tutee: draft })
    })

    const updatedTutee = immutableStore.getState()
    const updatedTutor = updatedTutee.tutor

    // Assert
    expect(updatedTutee.tutor).toBe(tutor)
    expect(updatedTutor.tutee).toBe(updatedTutee)
  })

  // One-to-Many
  test("", () => {
    immutableStore = new ImmutableStore<IStudentType>(StudentType)
    const student: ImmutableObject = immutableStore.createRoot(initStudent, "1") as unknown as ImmutableObject
    let tutor

    // Act
    immutableStore.produce((draft) => {
      tutor = immutableStore.newObject(TutorType, { id: "2", name: "tutor1", tutee: draft })
    })

    const updatedTutee = immutableStore.getState()
    const updatedTutor = updatedTutee.tutor

    // Assert
    expect(updatedTutee.tutor).toBe(tutor)
    expect(updatedTutor.tutee).toBe(updatedTutee)
  })
})

// let immutableStore = new ImmutableStore<(IProgramType | ICourseType)[]>([])

// const program1 = immutableStore.newObject<IProgramType>(ProgramType, {
//   id: uuidv4Generator(),
//   name: "Program 1",
//   courses: [],
// })

// const course1 = immutableStore.newObject<ICourseType>(CourseType, {
//   id: uuidv4Generator(),
//   name: "Course 1",
//   program: undefined,
// })

// const course2 = immutableStore.newObject<ICourseType>(CourseType, {
//   id: uuidv4Generator(),
//   name: "Course 2",
//   program: undefined,
// })

// const program2 = immutableStore.newObject<IProgramType>(ProgramType, {
//   id: uuidv4Generator(),
//   name: "Program 2",
//   courses: [course1, course2],
// })

// immutableStore.produce((draft) => {
//   draft.push(program1)
//   draft.push(program2)
//   draft.push(course1)
//   draft.push(course2)
// })

// immutableStore.produce((draft) => {
//   draft[0].name = "Updated Program 1 name"
// })

// const changedState = immutableStore.getState()
// const changedIdMap = immutableStore.getIdMap()

// // expect that progrsm2 courses are not changed but also thatthey point to the ones in the state
// expect(changedState[1].courses[0]).toBe(changedState[2])
// expect(changedState[1].courses[1]).toBe(changedState[3])

// expect(changedState[0]).not.toBe(program1)
// expect(changedState[1]).toBe(program2)

// expect(changedIdMap.get(program1["@@aelastics/ID"])).not.toBe(program1)
// expect(changedIdMap.get(program2["@@aelastics/ID"])).toBe(program2)

//   test("Adding object should not mutate existing state", () => {
//     let immutableStore = new ImmutableStore<{ programs: IProgramType[] }>({ programs: [] })

//     const initialState = immutableStore.getState()

//     const program: IProgramType = immutableStore.newObject<IProgramType>(ProgramType, {
//       id: uuidv4Generator(),
//       name: "New Program",
//       courses: [],
//     })

//     immutableStore.produce((draft) => {
//       draft.programs.push(program)
//     })

//     const newState = immutableStore.getState()

//     expect(newState.programs).toContain(program)
//     expect(initialState).not.toBe(newState)
//   })

//   test("Removing object should maintain immutability", () => {
//     let immutableStore = new ImmutableStore<{ programs: IProgramType[] }>({ programs: [] })

//     const initialState = immutableStore.getState()

//     const program = immutableStore.newObject<IProgramType>(ProgramType, {
//       id: uuidv4Generator(),
//       name: "Program for Removal",
//       courses: [],
//     })

//     immutableStore.produce((draft) => {
//       draft.programs.push(program)
//     })

//     expect(immutableStore.getState().programs).toHaveLength(1)

//     immutableStore.produce((draft) => {
//       draft.programs.pop()
//     })

//     const newState = immutableStore.getState()

//     expect(immutableStore.getState().programs).toHaveLength(0)
//     expect(initialState).not.toBe(newState)
//     expect(immutableStore.getIdMapWithDeleted().get(program["@@aelastics/ID"])).toBeDefined()
//   })

//   test("Deep nested changes should maintain immutability", () => {
//     let immutableStore = new ImmutableStore<{ universities: [{ id: string; programs: IProgramType[] }] }>({
//       universities: [{ id: "university1", programs: [] }],
//     })

//     const program: IProgramType = immutableStore.newObject(ProgramType, {
//       id: uuidv4Generator(),
//       name: "Nested Program",
//       courses: [],
//     })

//     immutableStore.produce((draft) => {
//       draft.universities[0].programs.push(program)
//     })

//     const initialState = immutableStore.getState()

//     expect(initialState.universities[0].programs[0].name).toBe("Nested Program")

//     immutableStore.produce((draft) => {
//       draft.universities[0].programs[0].name = "Updated Nested Program"
//     })

//     const newState = immutableStore.getState()

//     expect(newState.universities[0].programs[0].name).toBe("Updated Nested Program")
//     expect(initialState).not.toBe(newState)
//   })

//   test("idMap should synchronize correctly with state changes", () => {
//     let immutableStore = new ImmutableStore<{ programs: IProgramType[] }>({ programs: [] })

//     const program: IProgramType = immutableStore.newObject(ProgramType, {
//       id: uuidv4Generator(),
//       name: "Program",
//       courses: [],
//     })

//     immutableStore.produce((draft) => {
//       draft.programs.push(program)
//       draft.programs[0].name = "Updated Name"
//     })

//     const idMap = immutableStore.getIdMap()
//     const newState = immutableStore.getState()
//     const changedProgram = newState.programs[0]

//     expect(idMap.get(changedProgram["@@aelastics/ID"]).name).toBe("Updated Name")
//   })

//   test("Updating mutually referenced aleastic objects should refresh their mutual id references", () => {
//     let immutableStore = new ImmutableStore<{
//       tutor: ITutorType
//       tutee: IStudentType
//     }>({
//       tutor: {} as ITutorType,
//       tutee: {} as IStudentType,
//     })

//     const tutor: ITutorType = immutableStore.newObject(TutorType, {
//       id: uuidv4Generator(),
//       name: "Tutor 1",
//       tutee: undefined,
//     })

//     const student: IStudentType = immutableStore.newObject(StudentType, {
//       id: uuidv4Generator(),
//       name: "Student 1",
//       tutor: undefined,
//     })

//     const initState = immutableStore.getState()

//     immutableStore.produce((draft) => {
//       draft.tutor = tutor
//       draft.tutee = student
//     })

//     immutableStore.produce((draft) => {
//       draft.tutor.tutee = draft.tutee
//     })

//     const newState = immutableStore.getState()
//     const newIdMap = immutableStore.getIdMap()

//     // check if the initial state is not the same as the new state
//     expect(initState).not.toBe(newState)

//     //this only checks if the references are set up
//     expect(newState.tutor.tutee).toBe(newState.tutee)
//     expect(newState.tutee.tutor).toBe(newState.tutor)

//     // next stage is to check if both objects have been reinstantiated
//     expect(newState.tutor).not.toBe(tutor)
//     expect(newState.tutee).not.toBe(student)

//     // check if the idMap has been updated
//     expect(newIdMap.get(newState.tutor["@@aelastics/ID"])).toBe(newState.tutor)
//     expect(newIdMap.get(newState.tutee["@@aelastics/ID"])).toBe(newState.tutee)
//     expect(newIdMap.get(newState.tutor["@@aelastics/ID"])).not.toBe(tutor)
//     expect(newIdMap.get(newState.tutee["@@aelastics/ID"])).not.toBe(student)
//   })

//   test("Updating nested aelastic objects should refresh the state", () => {
//     let immutableStore = new ImmutableStore<{
//       tutor: ITutorType
//       tutee: IStudentType
//     }>({
//       tutor: {} as ITutorType,
//       tutee: {} as IStudentType,
//     })

//     const tutor: ITutorType = immutableStore.newObject(TutorType, {
//       id: uuidv4Generator(),
//       name: "Tutor 1",
//       tutee: undefined,
//     })

//     const student: IStudentType = immutableStore.newObject(StudentType, {
//       id: uuidv4Generator(),
//       name: "Student 1",
//       tutor: undefined,
//     })

//     immutableStore.produce((draft) => {
//       draft.tutor = tutor
//       draft.tutee = student
//     })

//     immutableStore.produce((draft) => {
//       draft.tutor.tutee = draft.tutee
//     })

//     // TODO: This is an issue with the current implementation of the library. The student returned from draft.tutor.tutee is retrieved from the idMap, which will be outside the draft scope.
//     // KEEP IN MIND: even if you pass the idmap to the produce function, getter methods from object instances will not access the drafted idmap, but the nondrafted version.
//     immutableStore.produce((draft) => {
//       const student = draft.tutor.tutee
//       if (student) {
//         student.name = "Updated Student Name"
//       }
//     })

//     const newState = immutableStore.getState()

//     //this checks if the references are the same, and with the updated student name
//     expect(newState.tutor.tutee).toBe(newState.tutee)
//     expect(newState.tutee.tutor).toBe(newState.tutor)
//   })
