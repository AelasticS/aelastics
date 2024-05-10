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
  test("Updating object should maintain immutability", () => {
    let immutableStore = new ImmutableStore({ programs: [] as any[], courses: [] as any[] })

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

    immutableStore.addObject("programs", program1)
    immutableStore.addObject("programs", program2)

    // Change program1 in an immutable way
    immutableStore.produce((draft) => {
      draft.programs[0].name = "Udpated Program 1 name"
    })

    const changedState = immutableStore.getState()
    const changedIdMap = immutableStore.getIdMap()

    expect(changedState["programs"][0]).not.toBe(program1)
    expect(changedState["programs"][1]).toBe(program2)

    expect(changedIdMap.get(program1["@@aelastics/ID"])).not.toBe(program1)
    expect(changedIdMap.get(program2["@@aelastics/ID"])).toBe(program2)
  })

  test("Adding object should not mutate existing state", () => {
    let immutableStore = new ImmutableStore({ programs: [] })
    const initialPrograms = immutableStore.getState().programs

    const newProgram = immutableStore.newObject(ProgramType, {
      id: uuidv4Generator(),
      name: "New Program",
      courses: [],
    })

    immutableStore.addObject("programs", newProgram)

    const newState = immutableStore.getState()

    expect(newState.programs).toContain(newProgram)
    expect(initialPrograms).not.toBe(newState.programs)
  })
})
