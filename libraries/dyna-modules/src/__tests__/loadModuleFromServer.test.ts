import { loadModuleFromServer } from "../loadModuleFromServer";

describe("loadModuleFromServer", () => {
    it("should fetch module source from a server", async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                text: () => Promise.resolve("export default { name: 'Fetched' };"),
            })
        ) as jest.Mock;

        const source = await loadModuleFromServer("https://example.com/module.js");
        expect(source).toContain("export default { name: 'Fetched' }");
    });

    it("should throw an error if the fetch fails", async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                statusText: "Not Found",
            })
        ) as jest.Mock;

        await expect(loadModuleFromServer("https://example.com/module.js")).rejects.toThrow(
            "Failed to fetch module from https://example.com/module.js"
        );
        
    });
});
