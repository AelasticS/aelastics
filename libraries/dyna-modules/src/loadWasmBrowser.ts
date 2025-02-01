/**
 * Loads and executes a WebAssembly (WASM) module in the browser.
 * @param wasmUrl - The URL to the WASM module.
 * @returns The WebAssembly module exports.
 */
export async function loadWasmBrowser(wasmUrl: string): Promise<WebAssembly.Exports> {
  const response = await fetch(wasmUrl);
  if (!response.ok) {
      throw new Error(`Failed to load WASM module from ${wasmUrl}: ${response.statusText}`);
  }

  const wasmModule = await WebAssembly.instantiateStreaming(response, {});
  return wasmModule.instance.exports;
}
