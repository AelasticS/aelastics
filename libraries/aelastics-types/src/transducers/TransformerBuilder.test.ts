import { ITransformer } from "./Transformer";
import * as tb from "./TransformerBuilder";
import * as t from "../index";
import { naturalReducer } from "../index";

let testSchema = t.schema("testSchema");
let Child = t.object(
  {
    name: t.string,
    age: t.number,
  },
  "Child",
  testSchema
);

let Person = t.object(
  {
    name: t.string,
    children: t.arrayOf(Child),
    age: t.number,
    male: t.boolean,
    employed: t.boolean,
  },
  "Person",
  testSchema
);

type IChild = t.TypeOf<typeof Child>;
type IPerson = t.TypeOf<typeof Person>;

let ch1: IChild = {
  name: "Peter",
  age: 10,
};

let ch2: IChild = {
  name: "Petra",
  age: 4,
};

let Tom: IPerson = {
  name: "Tom",
  age: 35,
  male: true,
  children: [ch1, ch2],
  employed: true,
};

describe("test TransformerBuilder", () => {
  let fInit: ITransformer["init"] = (v, c) => {
    console.log(`INIT: node type:${c.type.name}, value:${v}, instance:${c.instance}`);
    return [v, "continue"];
  };

  let fStep: ITransformer["step"] = (v, c, i) => {
    console.log(`STEP: node type:${c.type.name}, value:${v}, instance:${c.instance}`);
    return [v, "continue"];
  };

  let fResult: ITransformer["init"] = (v, c) => {
    console.log(`RESULT: node type:${c.type.name}, value:${v}, instance:${c.instance}`);
    return [v, "continue"];
  };

  test("onInit", () => {
    let oi = new tb.TransformerBuilder()
      .onInit(
        new tb.InitBuilder()
          .onTypeCategory("Object", fInit)
          .onTypeCategory("Array", fInit)
          .onTypeCategory("Number", fInit)
          .onTypeCategory("Simple", fInit)
          // .onPredicate((value, currNode) => value === "Number", (v, c) => [v, "continue"])
          .build()
      )
      .onStep(
        new tb.StepBuilder()
          .onTypeCategory("Object", fStep)
          .onTypeCategory("Array", fStep)
          .onTypeCategory("Number", fStep)
          .onTypeCategory("Simple", fStep)
          .build()
      )
      .onResult(
        new tb.ResultBuilder()
          .onTypeCategory("Object", fResult)
          .onTypeCategory("Array", fResult)
          .onTypeCategory("Number", fResult)
          .onTypeCategory("Simple", fResult)
          .build()
      )
      .build();
    let tr = t.transducer()
      .recurse("makeItem")
      .do(oi, "arg")
      .doFinally(naturalReducer());
    let r = Person.transduce(tr, Tom);
    expect(1).toEqual(1);
  });
});
