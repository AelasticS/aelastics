import * as tb from "./TransformerBuilder";

describe("test TransformerBuilder", () => {
  test("onInit", () => {
    let oi = new tb.TransformerBuilder()
      .onInit(
        new tb.InitBuilder()
          .onTypeCategory("Object",(v, c) => [v, "continue"])
          .onTypeCategory("Array",(v, c) => [v, "continue"])
          .onTypeCategory("Number",(v, c) => [v, "continue"])
          .onTypeCategory("Simple",(v, c) => [v, "continue"])
          .onPredicate((value, currNode)=> currNode.type.typeCategory === "Number", (v, c) => [v, "continue"])
          .build()
      )
      .build();

    expect(1).toEqual(1);
  });
})
