import { loadJsonModule } from "../loadJsonModule";

describe("loadJsonModule", () => {
    it("should parse a JSON module correctly", () => {
        const jsonModule = loadJsonModule('{ "key": "value" }', "testJsonModule");
        expect(jsonModule.key).toBe("value");
    });

    it("should throw an error for invalid JSON", () => {
        expect(() => loadJsonModule("invalid json", "testJsonModule")).toThrow();
    });
});
