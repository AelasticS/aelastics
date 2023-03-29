import * as o from "./examples-for-test"
import { genJSXComponents } from "./gen-JSX-comps";

describe("test text generation", async () => {
    it("should generate correct document content for testModel1", async () => {
        const res = await genJSXComponents({type: o.Organization, value:o.orgAnnot})
        expect(res.noSuccesses).toEqual(1)
        expect(res.noFailures).toEqual(0)
        let s = res.results[0].outcome
        //@ts-ignore
        expect(s.value).toEqual("paragraph 1\nparagraph 2\n")
        //@ts-ignore
        expect(getResultByItemPath(res,"TestDoc1.txt")?.value).toEqual("paragraph 1\nparagraph 2\n")
        
    });
  });