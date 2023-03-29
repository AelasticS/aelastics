import { generate, M2T_Model } from "aelastics-m2t";
import { Context, ModelStore } from "aelastics-synthesis";
import { jsxToTextModel, PrintOptions } from "./JSXtoText";
import * as o from "./examples-for-test"
import { generateJSX } from "./generate";

describe("test text generation", () => {
    it("should generate correct document content for testModel1", async () => {
        const testStore = new ModelStore()
        const opt:PrintOptions = {
            outPutFile:"orgJSX.ts",
            pathToTypesDefModule:"./org.model.ts",
            typesDefVarName:"f"
        }
        const org = generateJSX({type: o.Organization, value:o.orgAnnot})
        const j2t = jsxToTextModel(org, opt, testStore)
        const testDoc1: M2T_Model = j2t.render(new Context());
        const res = await generate(testStore, testDoc1, {rootDir:"TXT_Output", mode:"mock"})
        expect(res.noSuccesses).toEqual(1)
        expect(res.noFailures).toEqual(0)
        let s = res.results[0].outcome
        //@ts-ignore
        expect(s.value).toEqual("paragraph 1\nparagraph 2\n")
        //@ts-ignore
        expect(getResultByItemPath(res,"TestDoc1.txt")?.value).toEqual("paragraph 1\nparagraph 2\n")
        
    });
  });