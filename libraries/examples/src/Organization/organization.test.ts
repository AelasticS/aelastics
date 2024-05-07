import { ImmutableStore } from "aelastics-store"
import { Employee } from "./organization.model.type"

describe("create new object in immutable store", () => {
  const immutableStore = new ImmutableStore()
  const employee1 = immutableStore.newObject(Employee, {})

  it("log contents", () => {
    expect(NaN).toEqual(NaN)
  })
})
