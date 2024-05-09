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

    // const course1 = immutableStore.newObject(CourseType, {
    //   id: uuidv4Generator(),
    //   name: "Course 1",
    //   program: [],
    // })

    immutableStore.addObject("programs", program1)

    // immutableStore.produce((draft) => {
    //   draft["programs"].push(program1)
    // })

    immutableStore.produce((draft) => {
      draft["programs"][0].name = "Udpated Program 1 name"
    })

    const changedState = immutableStore.getState()

    expect(changedState["programs"][0]).not.toBe(program1)
    console.log("Program")
    // expect(program1.courses[0]).toStrictEqual(course1)
    // expect(store.getState().count).toBe(10)
    // expect(initialState.count).toBe(0)
  })
})
