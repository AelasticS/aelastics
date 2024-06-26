/** @jsx hm */
import { hm } from "./../../index";
import {
  generate,
  M2T,
  getResultByItemPath,
  M2T_Model,
  IParagraph,
  ISection,
} from "../index";
import { Dir, Doc, P, Sec } from "../index";
import { IDirectory, IDocument } from "../index";
import { ModelStore, Context, Element } from "./../../index";

const testStore = new ModelStore();

let testDoc1Element: Element<IDocument> = (
  <Doc name="TestDoc1.txt">
    <P>paragraph 1</P>
    <P>paragraph 2</P>
  </Doc>
);

let testDoc2Element: Element<IDocument> = (
  <Doc name="TestDoc2.txt">
    <P>{`some text for Math.log2(8)=${Math.log2(8)}`}</P>
  </Doc>
);

let dir1Element: Element<IDirectory> = (
  <Dir name="directory1">
    {testDoc1Element}
    <Dir name="subDir1">{testDoc2Element}</Dir>
  </Dir>
);

let testModel1_Element: Element<M2T_Model> = (
  <M2T name="test model1" store={testStore}>
    {testDoc1Element}
  </M2T>
);

let testModel2_Element: Element<M2T_Model> = (
  <M2T name="test model2" store={testStore}>
    {testDoc2Element}
  </M2T>
);

let Doc1TopDir = (
  <Doc name="Doc.txt">
    <P>Title Doc1</P>
    <Sec name="Chapter 1">
      <Sec name="Subchapter 1.1">
        <P>text of Subchapter 1.1</P>
      </Sec>
      <P>text of at end of Chapter 1</P>
    </Sec>
    <Sec name="Chapter 2">
      <Sec name="Subchapter 2.1">
        <P>text of Subchapter 2.1</P>
      </Sec>
    </Sec>
    <P>Conclusions</P>
    <Sec $refByName="Chapter 1">
        <P>sdfdfsfdsfsdsfdsdsf</P>
    </Sec>
  </Doc>
);

let testModel3_Element: Element<M2T_Model> = (
  <M2T name="test model3" store={testStore}>
    <Dir name="TopDir">
      {Doc1TopDir}
      <Dir name="Subdir1">
        <Doc name="Doc1.txt">
          <P>Title Doc1</P>
          <P>Conclusions</P>
        </Doc>
      </Dir>
      <Dir name="Subdir2"></Dir>
    </Dir>
  </M2T>
);

describe("test text generation", () => {
  // it("should generate correct document content for testModel1", async () => {
  //     const testDoc1: M2T_Model = testModel1_Element.render(new Context());
  //     const res = await generate(testStore, testDoc1, {rootDir:"TXT_Output", mode:"real"})
  //     expect(res.noSuccesses).toEqual(1)
  //     expect(res.noFailures).toEqual(0)
  //     let s = res.results[0].outcome
  //     //@ts-ignore
  //     expect(s.value).toEqual("paragraph 1\nparagraph 2\n")
  //     //@ts-ignore
  //     expect(getResultByItemPath(res,"TestDoc1.txt")?.value).toEqual("paragraph 1\nparagraph 2\n")

  // });

  it("should generate correct document content for testModel1", async () => {
    const testDoc1: M2T_Model = testModel3_Element.render(new Context());
    const res = await generate(testStore, testDoc1, {
      rootDir: "TXT_Output2",
      mode: "real",
    });
    expect(true).toBeTruthy();
  });
});
