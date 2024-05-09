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
    let immutableStore = new ImmutableStore({ programs: [], courses: [] })

    const program1 = immutableStore.newObject(ProgramType, {
      id: uuidv4Generator(),
      name: "Program 1",
      courses: [],
    })

    immutableStore.addObject("programs", program1)

    immutableStore.produce((draft) => {
      draft.programs[0].name = "Udpated Program 1 name"
    })

    const changedState = immutableStore.getState()

    expect(changedState["programs"][0]).not.toBe(program1)
  })
})
