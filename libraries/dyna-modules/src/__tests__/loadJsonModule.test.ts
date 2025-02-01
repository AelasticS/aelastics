import { loadJsonModule } from "../loadJsonModule";

describe("loadJsonModule", () => {
    it("should parse a valid JSON module", async () => {
        const jsonString = `{"name": "TestModule", "version": "1.0.0"}`;
        const result = await loadJsonModule<{ name: string; version: string }>(jsonString);

        expect(result.name).toBe("TestModule");
        expect(result.version).toBe("1.0.0");
    });

    it("should throw an error for invalid JSON", async () => {
        const invalidJson = `{name: "TestModule" version: 1.0.0}`; // Missing commas

        await expect(loadJsonModule(invalidJson)).rejects.toThrow("Failed to parse JSON module");
    });
});
