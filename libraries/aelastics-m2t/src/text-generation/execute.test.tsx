/** @jsx hm */
import { hm } from "aelastics-synthesis";
import { executeFS_Model, FileModel, getResultByItemPath, IFS_Model, IParagraph, ISection } from "../index";
import { Dir, Doc, P, Sec } from "../index";
import { IDirectory, IDocument } from "../index";
import { ModelStore, Context, Element } from "aelastics-synthesis";

const testStore = new ModelStore();

let testDoc1Element: Element<IDocument> = (
    <Doc name="TestDoc1.txt">
        <P>{"paragraph 1"}</P>
        <P>{"paragraph 2"}</P>
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
        <Dir name="subDir1">
            {testDoc2Element}
        </Dir>
    </Dir>
);

let testModel1_Element: Element<IFS_Model> = (
    <FileModel name="test model1" store={testStore}>
        {testDoc1Element}
    </FileModel>
);

let testModel2_Element: Element<IFS_Model> = (
    <FileModel name="test model2" store={testStore}>
        {testDoc2Element}
    </FileModel>
);


let Doc1TopDir = <Doc name="Doc1">
    <P>Title Doc1</P>
    <Sec name="Chapter 1">
        <Sec name="Subchapter 1.1">
            <P>text of Subchapter 1.1</P>
        </Sec>
        <P>text of at end of Chapter 1</P>
    </Sec>
    <Sec name="Chapter 2">
        <Sec name="Subchapter 2.1"></Sec>
        <P>text of Subchapter 2.1</P>
    </Sec>
    <P>Conclusions</P>
</Doc>

let testModel3_Element: Element<IFS_Model> = (
    <FileModel name="test model3" store={testStore}>
        <Dir name="TopDir">
            {Doc1TopDir}
            <Dir name="Subdir1"></Dir>
            <Dir name="Subdir2"></Dir>
        </Dir>
    </FileModel>
);

describe("test text generation", () => {
    it("should generate correct document content for testModel1", async () => {
        const testDoc1: IFS_Model = testModel1_Element.render(new Context());
        const res = await executeFS_Model(testStore, testDoc1)
        expect(res.noSuccesses).toEqual(1)
        expect(res.noFailures).toEqual(0)
        let s = res.results[0].outcome
        //@ts-ignore
        expect(s.value).toEqual("paragraph 1\nparagraph 2\n")
        //@ts-ignore
        expect(getResultByItemPath(res,"TestDoc1.txt")?.value).toEqual("paragraph 1\nparagraph 2\n")
        
    });
});

