import { loadModuleFromFile } from "../loadModuleFromFile";
import { promises as fs } from "fs";
import path from "path";

describe("loadModuleFromFile", () => {
    const testFilePath = path.join(__dirname, "test-module.js");

    beforeAll(async () => {
        await fs.writeFile(testFilePath, "export default { name: 'Test' };");
    });

    afterAll(async () => {
        await fs.unlink(testFilePath);
    });

    it("should load module source code from a file", async () => {
        const source = await loadModuleFromFile(testFilePath);
        expect(source).toContain("export default { name: 'Test' }");
    });
});
