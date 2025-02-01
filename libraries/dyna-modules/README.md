# DynaModules
A modular dynamic module loader for JavaScript & TypeScript.

## Features
- Load modules from file, text, or server
- Execute modules in Node.js or the browser
- Supports JSON & WebAssembly (WASM)
- Tree-shakable modular API

## Installation
```
npm install dyna-modules
```

## Usage
```ts
import { loadModuleFromFile } from "dyna-modules";

(async () => {
    const sourceCode = await loadModuleFromFile("./myModule.ts");
})();
```
