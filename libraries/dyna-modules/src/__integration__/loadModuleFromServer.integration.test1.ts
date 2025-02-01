import { loadModuleFromServer } from "../loadModuleFromServer";

describe("loadModuleFromServer (Integration Test)", () => {
    it("should fetch a real module from a local server", async () => {
        const url = "http://localhost:5000/test-module.js";
        const source = await loadModuleFromServer(url);

        expect(source).toContain("export default");
    });
});
