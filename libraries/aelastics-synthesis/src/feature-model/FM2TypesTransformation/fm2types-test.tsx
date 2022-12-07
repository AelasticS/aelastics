import { FM2TypesTransformations } from "./fm2types-transformation";
import { ModelStore } from "../../jsx/ModelsStore";

describe("Test model transformations", () => {
  it("tests eer to tables", () => {
    let m = new FM2TypesTransformations(new ModelStore());
    // let r = m.transform(s1)
    // expect(r).toHaveProperty("name", "Persons")
    // expect(r).toEqual(expect.objectContaining({
    //     name: 'Persons',
    //     elements: expect.arrayContaining([
    //         expect.objectContaining({ name: "Person" }),
    //         expect.objectContaining({ name: "PersonID" })
    //     ])
    // }
    // ))
  });
});
