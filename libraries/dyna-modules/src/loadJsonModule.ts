/**
 * Loads and parses a JSON module dynamically.
 * @param jsonCode - The JSON content as a string.
 * @returns The parsed JSON object.
 */
export async function loadJsonModule<T>(jsonCode: string): Promise<T> {
  try {
      return JSON.parse(jsonCode);
  } catch (error) {
      throw new Error("Failed to parse JSON module");
  }
}
