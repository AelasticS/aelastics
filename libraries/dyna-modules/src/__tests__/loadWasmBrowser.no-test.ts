import { loadWasmBrowser } from "../loadWasmBrowser";
import fetch from "node-fetch";

global.fetch = fetch as unknown as (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;



interface WasmExports {
    add: (a: number, b: number) => number;
}

async function waitForServer(url: string, timeout = 5000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        try {
            const response = await fetch(url, { method: "HEAD" });
            if (response.ok) return true;
        } catch (error) {
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
    }
    throw new Error(`Server at ${url} is not responding.`);
}

describe("loadWasmBrowser", () => {
    beforeAll(async () => {
        await waitForServer("http://localhost:5000/test.wasm");
    });

    it("should load and execute a WebAssembly module in the browser", async () => {
        const wasmUrl = "http://localhost:5000/test.wasm";
        const wasmModule = await loadWasmBrowser(wasmUrl) as unknown as WasmExports;

        expect(typeof wasmModule.add).toBe("function");
    });
});
