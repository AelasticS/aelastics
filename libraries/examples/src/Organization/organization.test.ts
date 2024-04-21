import { ImmutableStore } from "aelastics-store";
import { Employee } from "./organization.model.type";

describe("create new object in immutable store", ()=>{

    const immutableStore = new ImmutableStore();
    const employee1 = immutableStore.newObject(Employee);

  it('log contents', () => {
  
    console.log("immutable store contents: ", immutableStore)
    console.log("employee1: ", employee1)

    expect(NaN).toEqual(NaN)
  })
})

