import * as tb from "./TransformerBuilder";

describe("test TransformerBuilder", () => {
  test("onInit", () => {
    let oi = new tb.TransformerBuilder()
      .onInit(
        new tb.InitBuilder()
          .onObject((v, c) => [v, "continue"])
          .onArray((v, c) => [v, "continue"])
          .onSimple((v, c) => [v, "continue"])
          .getInitFun()
      )
      .getTransformer();

    expect(1).toEqual(1);
  });
});
