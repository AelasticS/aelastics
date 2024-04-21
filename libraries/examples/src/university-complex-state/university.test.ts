import { ImmutableStore } from "aelastics-store";
import { Course } from "./university.model.type";

describe("create new object in immutable store", ()=>{

    const immutableStore = new ImmutableStore();
    const pcpp1 = immutableStore.newObject(Course);

  it('log contents', () => {
  
    console.log("immutable store contents: ", immutableStore)
    console.log("ctx contents: ", immutableStore.ctx)

    expect(NaN).toEqual(NaN)
  })
})

