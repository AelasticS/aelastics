# Running Integration Tests

## Prerequisites
- Ensure dependencies are installed:
  ```sh
  npm install
  ```
- Start a local HTTP server to serve test modules:
  ```sh
  npx http-server ./src/__tests__/data -p 5000
  ```

## Running Integration Tests
To execute integration tests, run:
```sh
rushx test:integration
```

This command will:
- Verify module execution in Node.js.
- Ensure WebAssembly and JSON modules function correctly.

## Expected Output
If successful, you should see:
```
PASS src/__integration__/executeModuleNode.test.ts
PASS src/__integration__/loadModuleFromServer.integration.test.ts
```
