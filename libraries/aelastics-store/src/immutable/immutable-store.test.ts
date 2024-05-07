import { ImmutableStore } from "aelastics-store"
import { v4 as uuidv4 } from "uuid"

export const uuidv4Generator = () => {
  return uuidv4()
}

describe("", () => {
  const immutableStore = new ImmutableStore({})

  // Object.is (referential equality)

  // initial object

  // call produce over the object to modify it

  // we should have a new object (different reference in memory)
})
