import * as t from "aelastics-types"
import { v4 as uuidv4 } from "uuid"
import { ImmutableStore } from "./immutable-store"

export const uuidv4Generator = () => {
  return uuidv4()
}

export const UniversitySchema = t.schema("UniversitySchema")

export const ID = t.string
export const Name = t.string.derive("Valid name").alphanumeric.maxLength(128)

export const ProgramType = t.entity(
  {
    id: ID,
    name: Name,
    courses: t.arrayOf(t.link(UniversitySchema, "Course", "ProgramToCourseLink")),
  },
  ["id"],
  "Program",
  UniversitySchema
)

export const CourseType = t.entity(
  {
    id: ID,
    name: Name,
    program: ProgramType,
  },
  ["id"],
  "Course",
  UniversitySchema
)

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

    const baseState = [learnTS]

    const immutableStore = new ImmutableStore(baseState as any)

    immutableStore.produce((draftState) => {
      draftState.push(tryImmer)
      draftState.push({ title: "Tweet about it" })
      draftState[1].done = true
    })

    const newState = immutableStore.getState()

    expect(newState[1]).not.toBe(baseState[1])
  })

  test("Updating object should maintain immutability", () => {
    let immutableStore = new ImmutableStore([] as any)

    const program1 = immutableStore.newObject(ProgramType, {
      id: uuidv4Generator(),
      name: "Program 1",
      courses: [],
    })

    const program2 = immutableStore.newObject(ProgramType, {
      id: uuidv4Generator(),
      name: "Program 2",
      courses: [],
    })

    immutableStore.produce((draft) => {
      draft.push(program1)
      draft.push(program2)
    })

    immutableStore.produce((draft) => {
      draft[1].name = "Udpated Program 2 name"
    })

    const changedState = immutableStore.getState()
    const changedIdMap = immutableStore.getIdMap()

    expect(changedState[0]).not.toBe(program1)
    expect(changedState[1]).not.toBe(program2)

    expect(changedIdMap.get(program1["@@aelastics/ID"])).not.toBe(program1)
    expect(changedIdMap.get(program2["@@aelastics/ID"])).not.toBe(program2)
  })

  test("Adding object should not mutate existing state", () => {
    let immutableStore = new ImmutableStore({ programs: [] })
    const initialPrograms = immutableStore.getState().programs

    const program = immutableStore.newObject(ProgramType, {
      id: uuidv4Generator(),
      name: "New Program",
      courses: [],
    })

    immutableStore.produce((draft) => {
      draft.programs.push(program)
    })

    const newState = immutableStore.getState()

    expect(newState.programs).toContain(program)
    expect(initialPrograms).not.toBe(newState.programs)
  })

  test("Removing object should maintain immutability", () => {
    let immutableStore = new ImmutableStore({ programs: [] })

    const program = immutableStore.newObject(ProgramType, {
      id: uuidv4Generator(),
      name: "Program for Removal",
      courses: [],
    })

    immutableStore.produce((draft) => {
      draft.programs.push(program)
    })

    expect(immutableStore.getState().programs).toHaveLength(1)

    immutableStore.produce((draft) => {
      draft.programs.pop(program)
    })

    expect(immutableStore.getState().programs).toHaveLength(0)
  })

  test("Deep nested changes should maintain immutability", () => {
    let immutableStore = new ImmutableStore({ departments: [{ id: "dept1", programs: [] as any[] }] })

    const program = immutableStore.newObject(ProgramType, {
      id: uuidv4Generator(),
      name: "Nested Program",
      courses: [],
    })

    immutableStore.produce((draft) => {
      draft.departments[0].programs.push(program)
    })

    const initialDeptPrograms = immutableStore.getState()
    expect(initialDeptPrograms.departments[0].programs[0].name).toBe("Nested Program")

    immutableStore.produce((draft) => {
      draft.departments[0].programs[0].name = "Updated Nested Program"
    })

    const updatedDeptPrograms = immutableStore.getState().departments[0].programs
    expect(updatedDeptPrograms[0].name).toBe("Updated Nested Program")
    expect(initialDeptPrograms).not.toBe(updatedDeptPrograms)
  })

  test("idMap should synchronize correctly with state changes", () => {
    let immutableStore = new ImmutableStore({ programs: [] as any[] })

    const program = immutableStore.newObject(ProgramType, {
      id: uuidv4Generator(),
      name: "Program",
      courses: [],
    })

    immutableStore.produce((draft) => {
      draft.programs.push(program)
      draft.programs[0].name = "Updated Name"
    })

    const idMap = immutableStore.getIdMap()

    expect(idMap.get(program["@@aelastics/ID"]).name).toBe("Updated Name")
  })

  test("Updating mutually referenced aleastic objects should refresh their mutual id references", () => {
    let immutableStore = new ImmutableStore({ programs: [] })

    const program = immutableStore.newObject(ProgramType, {
      id: uuidv4Generator(),
      name: "Program",
      courses: [],
    })

    const course = immutableStore.newObject(CourseType, {
      id: uuidv4Generator(),
      name: "Course",
      program: program,
    })

    program.addCourses(course)

    // Simulate an update that would affect the ID map
    immutableStore.produce((draft) => {
      draft.programs[0].name = "Updated name"
    })

    const updatedState = immutableStore.getState()

    console.log("updated state: ", updatedState)

    expect("").toBe("")
  })
})
