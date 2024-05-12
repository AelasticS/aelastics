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
      draft[0].name = "Udpated Program 1 name"
    })

    const changedState = immutableStore.getState()
    const changedIdMap = immutableStore.getIdMap()

    expect(changedState[0]).not.toBe(program1)
    expect(changedState[1]).toBe(program2)

    expect(changedIdMap.get(program1["@@aelastics/ID"])).not.toBe(program1)
    expect(changedIdMap.get(program2["@@aelastics/ID"])).toBe(program2)
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
    let immutableStore = new ImmutableStore({ programs: [] as any[], courses: [] as any[] })

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

    immutableStore.produce((draft) => {
      draft.programs.push(program)
      draft.courses.push(course)
    })

    immutableStore.produce((draft) => {
      draft.programs[0].name = "Updated program name"
    })

    const newState = immutableStore.getState()
    const changedProgram = newState.programs[0]
    const newIdMap = immutableStore.getIdMap()

    expect(newIdMap.get(changedProgram["@@aelastics/ID"])).toBe(changedProgram)
    expect(newIdMap.get(newState.courses[0].program)).toBe(changedProgram)
  })
})
