# DynaModules
DynaModules is a flexible framework for dynamically loading and executing JavaScript and TypeScript modules. It supports loading modules from various sources, including text, files, and URLs. This guide provides an overview of how to use DynaModules in different environments.

## Features
- Load modules from text, files, and URLs
- Execute modules in Node.js or the browser
- Supports JSON & WebAssembly (WASM)
- Tree-shakable modular API

## Installation
```
npm install @aelastics/dyna-modules
```
# Using DynaModules

### Loading and Executing Modules
#### 1️⃣ **Load from Text**
Load a module from a string containing JavaScript/TypeScript code:
```ts
const code = `export default { name: "MyModule", run: () => "Hello World" };`;
const module = await loadModuleFromText(code, "js");
console.log(module.run()); // Outputs: "Hello World"
```

#### 2️⃣ **Load from a File**
```ts
const modulePath = "./modules/myModule.js";
const module = await executeModuleNode(modulePath, "js", "import");
console.log(module.name);
```

#### 3️⃣ **Load from a Server (Browser)**
```ts
const moduleUrl = "https://example.com/modules/myModule.js";
const module = await executeModuleBrowser(await fetch(moduleUrl).then(res => res.text()), "js");
console.log(module);
```

---

### Module Execution Modes (Node.js Only)
DynaModules supports different execution modes in Node.js:
- **Import Mode (`"import"`)**: Uses `import()` for ES modules.
- **VM Mode (`"vm"`)**: Uses Node.js `vm` for sandboxed execution.
- **Function Mode (`"function"`)**: Uses `new Function()`.

```ts
const module = await executeModuleNode(modulePath, "js", "vm");
```

---

### JSON Support
DynaModules also supports loading JSON modules.

#### **Load JSON Module**
```ts
const jsonModule = await loadJsonModule('{ "key": "value" }');
console.log(jsonModule.key); // "value"
```

---

### Error Handling
All loading functions return Promises and should be handled using `try-catch`:
```ts
try {
    const module = await loadModuleFromText("invalid code", "js");
} catch (error) {
    console.error("Failed to load module:", error);
}
```

---

## Conclusion
DynaModules provides a powerful way to dynamically load and execute JavaScript and TypeScript modules in both Node.js and browser environments. It supports multiple execution methods, module sources, and additional features like JSON loading.

For more details, refer to the official documentation or open an issue on GitHub.
