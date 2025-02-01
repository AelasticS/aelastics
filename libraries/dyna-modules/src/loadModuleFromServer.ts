/**
 * Fetches module source code from a remote URL.
 * @param url - The URL to fetch the module from.
 * @returns The module source code as a string.
 */
export async function loadModuleFromServer(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
      throw new Error(`Failed to load module from ${url}: ${response.statusText}`);
  }

  const code = await response.text();

  // In the browser, return a Blob URL instead of raw code
  if (typeof window !== "undefined") {
      const blob = new Blob([code], { type: "application/javascript" });
      return URL.createObjectURL(blob);
  }

  return code; // Node.js just returns the source code
}


