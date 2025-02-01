/**
 * Executes a dynamically loaded module in the browser.
 * @param sourceCode - The JavaScript module source code.
 * @param type - "js" or "ts" (TypeScript support planned).
 * @returns The exported object from the module.
 */
export async function executeModuleBrowser<T>(sourceCode: string, type: "js" | "ts"): Promise<T> {
  const blob = new Blob([sourceCode], { type: "application/javascript" });
  const blobUrl = URL.createObjectURL(blob);

  try {
      const module = await import(blobUrl);
      return module.default as T;
  } finally {
      URL.revokeObjectURL(blobUrl);
  }
}
