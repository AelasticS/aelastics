import { promises as fs } from "fs";

/**
 * Loads and executes a WebAssembly (WASM) module in Node.js.
 * @param wasmPath - The file path to the WASM module.
 * @returns The WebAssembly module exports.
 */
export async function loadWasmNode(wasmPath: string): Promise<WebAssembly.Exports> {
    const buffer = await fs.readFile(wasmPath);
    const wasmModule = await WebAssembly.instantiate(buffer, {});
    return wasmModule.instance.exports;
}
