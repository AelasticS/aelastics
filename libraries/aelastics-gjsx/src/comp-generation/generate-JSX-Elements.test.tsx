import { JSX_Export as jsx } from "aelastics-synthesis";
import * as ex from "./examples-for-test";
import * as g from "./generate-JSX-Elements";

describe("test JSX generation", () => {
  it("should generate correct document content for testModel1", async () => {
    let a: jsx.Typed_JSX_Annotation<typeof ex.Organization> = {
      type: ex.Organization,
      value: ex.orgAnnot,
    };
    let r = g.generate_JSX_Elements(a);
    expect(1).toEqual(1);
  });
});

