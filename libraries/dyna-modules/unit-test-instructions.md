# Running Unit Tests

## Prerequisites
- Ensure you have installed dependencies by running:
  ```sh
  npm install
  ```

## Running Unit Tests
To execute unit tests, run:
```sh
rushx test
```

This command will:
- Run tests inside `src/__tests__/`.
- Verify JSON parsing, WebAssembly execution, and module imports.

## Expected Output
If successful, you should see:
```
PASS src/__tests__/loadJsonModule.test.ts
PASS src/__tests__/loadWasmNode.test.ts
PASS src/__tests__/loadWasmBrowser.test.ts
```
