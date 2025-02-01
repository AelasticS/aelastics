export interface TestModule {
    name: string;
    process: () => string;
}

const moduleInstance: TestModule = {
    name: "TestModule",
    process: () => "Hello, World!"
};

export default moduleInstance;
