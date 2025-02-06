export function generateUUID(): string {
    return crypto.randomUUID();
}

/** Utility function to check if a value is an object with a UUID */
export function isUUIDReference(value: any, expectedType?: string): value is { uuid: string } {
    return (
        expectedType === "object" &&
        value !== null &&
        typeof value === "object" &&
        "uuid" in value &&
        typeof value.uuid === "string"
    );
}
