import { loadWasmNode } from "../loadWasmNode";
import path from "path";

interface WasmExports {
    add: (a: number, b: number) => number;
}

describe("loadWasmNode", () => {
    it("should load and execute a WebAssembly module in Node.js", async () => {
        const wasmPath = path.join(__dirname, "data", "test.wasm");
        const wasmModule = await loadWasmNode(wasmPath) as unknown as WasmExports;

        expect(typeof wasmModule.add).toBe("function");
        expect(wasmModule.add(2, 3)).toBe(5);
    });
});
