import { loadModuleFromText } from "../loadModuleFromText";

describe("loadModuleFromText", () => {
    it("should return the same input text", async () => {
        const code = "export default { test: true };";
        const result = await loadModuleFromText(code);
        expect(result).toBe(code);
    });
});
