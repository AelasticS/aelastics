import * as t from "aelastics-types"
import { v4 as uuidv4 } from "uuid"
import { ImmutableStore } from "./immutable-store"
import { IImmutableStoreObject, ImmerableObjectLiteral } from "../common/CommonConstants"

export const uuidv4Generator = () => {
  return uuidv4()
}

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
type IProgramType = t.TypeOf<typeof ProgramType> & ImmerableObjectLiteral
type ICourseType = t.TypeOf<typeof CourseType> & ImmerableObjectLiteral

describe("ImmutableStore", () => {
  test("Testing aelastics produce", () => {
    const learnTS = {
      title: "Learn TypeScript",
      done: true,
    }

    const tryImmer = {
      title: "Try Immer",
      done: false,
    }

    const immutableStore = new ImmutableStore([] as any)

    const originalState = immutableStore.getState()

    immutableStore.produce((draftState) => {
      draftState.push(learnTS)
      draftState.push(tryImmer)
      draftState.push({ title: "Tweet about it" })
      draftState[1].done = true
    })

    const newState = immutableStore.getState()
    expect(originalState).not.toBe(newState)
    // expect(newState[1]).not.toBe(baseState[1])
    // expect(newState[0]).not.toBe(baseState[0])
  })

  test("Updating object should maintain immutability", () => {
    // const progStore = new ImmutableStore<{ programs: IProgramType[] }>({ programs: [] })

    // progStore.produce((draft) => {
    //   draft.programs.forEach((program) => {
    //     program.name = "Updated Program 1"
    //     program.addCourses(immutableStore.newObject(CourseType, { id: uuidv4Generator(), name: "Course 1" }))
    //   })
    // })

    let immutableStore = new ImmutableStore<IProgramType[]>([])

    const program1: IProgramType = immutableStore.newObject<IProgramType>(ProgramType, {
      id: uuidv4Generator(),
      name: "Program 1",
      courses: [],
    })

    const program2: IProgramType = immutableStore.newObject<IProgramType>(ProgramType, {
      id: uuidv4Generator(),
      name: "Program 2",
      courses: [],
    })

    immutableStore.produce((draft) => {
      draft.push(program1)
      draft.push(program2)
    })

    immutableStore.produce((draft) => {
      draft[0].name = "Updated Program 1 name"
    })

    const changedState = immutableStore.getState()
    const changedIdMap = immutableStore.getIdMap()

    expect(changedState[0]).not.toBe(program1)
    expect(changedState[1]).toBe(program2)

    expect(changedIdMap.get(program1["@@aelastics/ID"])).not.toBe(program1)
    expect(changedIdMap.get(program2["@@aelastics/ID"])).toBe(program2)
  })

  test("Adding object should not mutate existing state", () => {
    let immutableStore = new ImmutableStore<{ programs: IProgramType[] }>({ programs: [] })

    const initialState = immutableStore.getState()

    const program: IProgramType = immutableStore.newObject<IProgramType>(ProgramType, {
      id: uuidv4Generator(),
      name: "New Program",
      courses: [],
    })

    immutableStore.produce((draft) => {
      draft.programs.push(program)
    })

    const newState = immutableStore.getState()

    expect(newState.programs).toContain(program)
    expect(initialState).not.toBe(newState)
  })

  test("Removing object should maintain immutability", () => {
    let immutableStore = new ImmutableStore<{ programs: IProgramType[] }>({ programs: [] })

    const initialState = immutableStore.getState()

    const program: IProgramType = immutableStore.newObject(ProgramType, {
      id: uuidv4Generator(),
      name: "Program for Removal",
      courses: [],
    })

    immutableStore.produce((draft) => {
      draft.programs.push(program)
    })

    expect(immutableStore.getState().programs).toHaveLength(1)

    immutableStore.produce((draft) => {
      draft.programs.pop()
    })

    const newState = immutableStore.getState()

    expect(immutableStore.getState().programs).toHaveLength(0)
    expect(initialState).not.toBe(newState)
  })

  test("Deep nested changes should maintain immutability", () => {
    let immutableStore = new ImmutableStore<{ universities: [{ id: string; programs: IProgramType[] }] }>({
      universities: [{ id: "university1", programs: [] }],
    })

    const program: IProgramType = immutableStore.newObject(ProgramType, {
      id: uuidv4Generator(),
      name: "Nested Program",
      courses: [],
    })

    immutableStore.produce((draft) => {
      draft.universities[0].programs.push(program)
    })

    const initialDeptPrograms = immutableStore.getState()
    expect(initialDeptPrograms.universities[0].programs[0].name).toBe("Nested Program")

    immutableStore.produce((draft) => {
      draft.universities[0].programs[0].name = "Updated Nested Program"
    })

    const updatedDeptPrograms = immutableStore.getState().universities[0].programs
    expect(updatedDeptPrograms[0].name).toBe("Updated Nested Program")
    expect(initialDeptPrograms).not.toBe(updatedDeptPrograms)
  })

  test("idMap should synchronize correctly with state changes", () => {
    let immutableStore = new ImmutableStore<{ programs: IProgramType[] }>({ programs: [] })

    const program: IProgramType = immutableStore.newObject(ProgramType, {
      id: uuidv4Generator(),
      name: "Program",
      courses: [],
    })

    immutableStore.produce((draft) => {
      draft.programs.push(program)
      draft.programs[0].name = "Updated Name"
    })

    const idMap = immutableStore.getIdMap()
    const newState = immutableStore.getState()
    const changedProgram = newState.programs[0]

    expect(idMap.get(changedProgram["@@aelastics/ID"]).name).toBe("Updated Name")
  })

  test("Updating mutually referenced aleastic objects should refresh their mutual id references", () => {
    let immutableStore = new ImmutableStore<{
      programs: IProgramType[]
      courses: ICourseType[]
    }>({
      programs: [],
      courses: [],
    })

    const program: IProgramType = immutableStore.newObject(ProgramType, {
      id: uuidv4Generator(),
      name: "Program",
      courses: [],
    })

    const course: ICourseType = immutableStore.newObject(CourseType, {
      id: uuidv4Generator(),
      name: "Course",
      program: program,
    })

    immutableStore.produce((draft) => {
      draft.programs.push(program)
      draft.courses.push(course)
    })

    immutableStore.produce((draft) => {
      draft.programs[0].name = "Updated program name"
    })

    const newState = immutableStore.getState()
    const changedProgram = newState.programs[0]
    const idMap = immutableStore.getIdMap()

    expect(idMap.get(changedProgram["@@aelastics/ID"])).toBe(changedProgram)
    expect(idMap.get(newState.courses[0]["@@aelastics/ID"])).toBe(changedProgram)
  })
})
