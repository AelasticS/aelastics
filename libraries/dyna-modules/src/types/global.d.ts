declare global {
    interface GlobalThis {
        testModule: { name: string; process: () => string } | undefined;
    }
}

export {}; // Ensures this is treated as a module
