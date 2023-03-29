import * as o from "./examples-for-test"
import { genJSXComponents, Options } from "./gen-JSX-comps";

describe("test text generation", () => {
    it("should generate correct document content for testModel1", async () => {
        const opt:Options = {
            outPutFile:"orgJSX.ts",
            pathToTypesDefModule:"./org.model.ts",
            typesDefVarName:"f"
        }
        const res = await genJSXComponents({type: o.Organization, value:o.orgAnnot}, opt)
        expect(res.noSuccesses).toEqual(1)
        expect(res.noFailures).toEqual(0)
        let s = res.results[0].outcome
        //@ts-ignore
        expect(s.value).toEqual("paragraph 1\nparagraph 2\n")
        //@ts-ignore
        expect(getResultByItemPath(res,"TestDoc1.txt")?.value).toEqual("paragraph 1\nparagraph 2\n")
        
    });
  });