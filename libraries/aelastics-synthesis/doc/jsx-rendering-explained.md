# JSX Rendering in Aelastics-Synthesis

This document explains how JSX syntax is transformed into model elements in the ModelStore, covering the complete flow from compile-time to runtime.

## Table of Contents

1. [Overview](#overview)
2. [The Complete Flow](#the-complete-flow)
3. [Phase 1: Compile Time - TypeScript Transformation](#phase-1-compile-time---typescript-transformation)
4. [Phase 2: Runtime - Element Tree Construction](#phase-2-runtime---element-tree-construction)
5. [Phase 3: Runtime - Explicit render() Call](#phase-3-runtime---explicit-rendercall)
6. [Who Triggers What?](#who-triggers-what)
7. [Embedded Computations and Templates](#embedded-computations-and-templates)
8. [Special Case: ResolveElement](#special-case-resolveelement)
9. [Summary and Key Concepts](#summary-and-key-concepts)

---

## Overview

The aelastics-synthesis library uses JSX syntax to define models, but unlike React, it creates model elements in a store rather than DOM elements. The process involves three distinct phases:

1. **Compile Time**: TypeScript compiler transforms JSX → JavaScript with `hm()` calls
2. **Runtime Phase 1**: JavaScript engine executes code → creates Element tree
3. **Runtime Phase 2**: Developer calls `render()` → creates model elements in store

---

## The Complete Flow

```
Developer writes JSX code (.tsx file)
    ↓
[COMPILE TIME]
TypeScript compiler reads /** @jsx hm */ pragma
    ↓
Compiler transforms: <Model> → hm(Model, props, children)
    ↓
Compiler outputs JavaScript (.js file)
    ↓
[RUNTIME - Phase 1]
JavaScript engine executes the code
    ↓
hm() function calls execute
    ↓
Template functions execute → return Element instances
    ↓
Element tree constructed (NOT model elements yet!)
    ↓
[RUNTIME - Phase 2]
Developer explicitly calls render(element)
    ↓
Element.render() traverses tree
    ↓
Element.create() creates model elements via ModelStore
    ↓
Model elements stored in ModelStore with IDs, names, relationships
```

---

## Phase 1: Compile Time - TypeScript Transformation

### The JSX Pragma

Every `.tsx` file using JSX must have this pragma at the top:

```tsx
/** @jsx hm */
```

This tells the TypeScript compiler: "Transform JSX using the `hm` function instead of `React.createElement`"

### Configuration

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "jsx": "react"  // Use React JSX transform
  }
}
```

### Transformation Example

**Input (.tsx file):**
```tsx
/** @jsx hm */
import { hm } from './handle'

let e = <Model name='model1' store={new ModelStore()}>
  <Elem name='el1'>
    <Elem name='el2'/>
  </Elem>
</Model>
```

**Output (.js file - approximate):**
```javascript
import { hm } from './handle';

let e = hm(Model,
  { name: 'model1', store: new ModelStore() },
  hm(Elem,
    { name: 'el1' },
    hm(Elem, { name: 'el2' })
  )
);
```

**Important:** The TypeScript compiler only **generates** the `hm()` calls - it does NOT execute them!

---

## Phase 2: Runtime - Element Tree Construction

### Who Calls `hm()`?

**The JavaScript runtime engine** (Node.js, browser, etc.) calls `hm()` when executing the generated code.

### Execution Order

JavaScript evaluates function arguments **before** calling the function, working **inside-out**:

```javascript
// Generated code:
let e = hm(Model,
  { name: 'model1', store: new ModelStore() },
  hm(Elem,
    { name: 'el1' },
    hm(Elem, { name: 'el2' })
  )
);

// Execution order:
// 1. new ModelStore() executes
// 2. hm(Elem, { name: 'el2' }) executes → returns Element
// 3. hm(Elem, { name: 'el1' }, Element) executes → returns Element
// 4. hm(Model, {...}, Element) executes → returns Element
// 5. Result assigned to 'e'
```

### What `hm()` Does

**File:** `src/jsx/handle.ts`

```typescript
export function hm(
  t: Template<g.IModelElement> | CpxTemplate<{}, g.IModelElement>,
  props: {},
  ...children: Element<any>[]
): Element<any, any> {
  let childElem = t(props)                    // 1. Call template function
  childElem.children.push(...children.flat()) // 2. Attach children
  return childElem                             // 3. Return Element node
}
```

**Key Point:** `hm()` returns an `Element` instance, **NOT a model element**. The Element tree is just a description of what to create.

### Template Functions

Templates are functions that return `Element` instances:

```typescript
export const Model: CpxTemplate<IModelProps, g.IModel> = (props) => {
  return new Element(g.Model, props, undefined)
}

export const Elem: Template<g.IModelElement> = (props) => {
  return new Element(g.ModelElement, props, undefined)
}
```

### Result of Phase 2

After JSX execution, you have an **Element tree** in memory:

```
Element {
  type: g.Model,
  props: { name: 'model1', store: ModelStore },
  children: [
    Element {
      type: g.ModelElement,
      props: { name: 'el1' },
      children: [
        Element {
          type: g.ModelElement,
          props: { name: 'el2' },
          children: []
        }
      ]
    }
  ]
}
```

**No model elements exist yet!** This is just metadata.

---

## Phase 3: Runtime - Explicit render() Call

### When is render() Called?

**The developer must explicitly call `render()`** - it's NOT automatic!

```typescript
// Create Element tree
let e = <Model name='model1' store={new ModelStore()}>
  <Elem name='el1'/>
</Model>

// Explicitly render to create model elements
let m = e.render(new Context())
```

Or using the helper function:

```typescript
import { render } from './handle'

let m = render(
  <Model name='model1' store={new ModelStore()}>
    <Elem name='el1'/>
  </Model>
)
```

### What render() Does

**File:** `src/jsx/element.ts:313-373`

```typescript
public render<P extends g.IModelElement>(
  ctx: Context,
  isImport: boolean = false
): P {
  // Step 1: Create the parent model element
  const parent = this.create(ctx, forImport);

  // Step 2: Update context if needed
  if (parent.type.isOfType(g.Model)) {
    ctx.pushModel(<g.IModel>parent.instance);
  }

  // Step 3: Render all children recursively
  this.children.forEach((childElement) => {
    renderChild(childElement);
  });

  // Step 4: Cleanup context
  if (parent.type.isOfType(g.Model)) {
    ctx.popModel();
  }

  return parent.instance as P;
}
```

### Element.create() - Model Element Creation

**File:** `src/jsx/element.ts:192-305`

This is where Element nodes are transformed into actual model elements:

```typescript
public create(ctx: Context, forImport: boolean): ElementInstance<g.IModelElement> {
  const { store, currentModel: model, currentNamespace: namespace } = ctx;

  // Handle references ($ref, $refByID, $refByName)
  if (this.props.$ref) {
    return { type: this.type, instance: this.props.$ref };
  }

  // Render props (convert nested Elements to model elements)
  let renderedProps = this.renderProps(this.props, ctx, forImport);

  // CREATE MODEL ELEMENT IN STORE:
  if (this.type.isOfType(g.Model))
    el = store.newModel(this.type, {...}, model, namespace);
  else if (this.type.isOfType(g.Namespace))
    el = store.newNamespace(this.type, {...}, model, namespace);
  else
    el = store.newModelElement(model, namespace, this.type, {...});

  // Set properties
  for (const [key, value] of Object.entries(renderedProps)) {
    el[key] = value;
  }

  return { type: this.type, instance: el };
}
```

### ModelStore Creates Actual Elements

**File:** `src/model-store/ModelsStore.ts:127-150`

```typescript
public newModelElement<E extends IModelElement>(
  model: Partial<IModel>,
  namespace: INamespace,
  type: t.ObjectType<any, any>,
  initValue: Partial<E>
): E {
  // Normalize name
  this.normalizeName(data, type.name, namespace);

  // Check for duplicates
  const fullQName = this.getNameWithPath(data as IModelElement);
  if (this.mapOfNames.has(fullQName))
    throw new Error(`Duplicate name "${fullQName}"`);

  // CREATE in underlying Store
  const el = this.store.deepCreate<E>(type, data);

  // Add to model and namespace
  model.elements!.push(el);
  namespace.elements.push(el);

  // Register by name
  this.mapOfNames.set(fullQName, el);

  return el;
}
```

### Result of Phase 3

After `render()`, you have actual **model elements** in the store:

```
IModel {
  id: "123456",
  name: "model1",
  path: "",
  elements: [
    IModelElement {
      id: "123457",
      name: "el1",
      path: "//model1",
      // ... other properties
    }
  ]
}
```

These are real objects stored in the ModelStore, with IDs, registered by name, and connected via relationships.

---

## Who Triggers What?

| What | Who Executes | When | Result |
|------|--------------|------|--------|
| TypeScript compilation | Developer runs `tsc` or build tool | Build time | `.js` files with `hm()` calls |
| `hm()` calls | JavaScript engine | Runtime (immediately) | Element tree |
| Template functions | Called by `hm()` via `t(props)` | Inside `hm()` execution | Element instances |
| `render()` method | Developer explicitly calls it | Whenever developer wants | Model elements in store |
| `ModelStore.newModelElement()` | Called by `Element.create()` | During `render()` | Actual model element created |

**Critical Distinction:**
- **Compile time:** Code transformation only (no execution)
- **Runtime Phase 1:** Element tree construction (metadata only)
- **Runtime Phase 2:** Model element creation (actual data)

---

## Embedded Computations and Templates

This section clarifies **when** different types of embedded expressions are evaluated and distinguishes between passing Element instances (already-evaluated JSX) versus passing template functions.

### Overview: Three Timing Phases

1. **Compile Time**: TypeScript transforms all JSX to `hm()` calls (no execution)
2. **Runtime Phase 1**: JavaScript engine executes `hm()` calls, builds Element tree
3. **Runtime Phase 2**: Developer calls `render()`, creates model elements

### Case 1: Embedded Computations (Arrays, Expressions)

**Example:**
```tsx
<Model name={p.m} store={new ModelStore()}>
  {Array(p.n).fill(1).map((e, i) => <Elem name={`${p.e}${i}`} />)}
</Model>
```

**Compile Time → Compiles to:**
```javascript
hm(Model,
  { name: p.m, store: new ModelStore() },
  Array(p.n).fill(1).map((e, i) => hm(Elem, { name: `${p.e}${i}` }))
)
```

**Runtime Phase 1 → Execution:**

JavaScript evaluates function arguments **before** calling the function (inside-out):

1. Evaluates `p.m` → `"model"`
2. Executes `new ModelStore()` → ModelStore instance
3. **Executes array computation** (this is key!):
   - `Array(p.n).fill(1)` creates `[1, 1, 1]`
   - `.map()` iterates, calling `hm(Elem, {name: "elem0"})` → Element
   - `.map()` continues, calling `hm(Elem, {name: "elem1"})` → Element
   - `.map()` continues, calling `hm(Elem, {name: "elem2"})` → Element
   - Returns `[Element, Element, Element]`
4. **Now** `hm(Model, {...}, [Element, Element, Element])` is called

**When:** Runtime Phase 1, during argument evaluation by JavaScript engine
**Result:** Array of Element instances passed to `hm()`

---

### Case 2: Template Functions (Higher-Order Functions)

Templates are **functions that return JSX**. Understanding when they execute is critical.

#### 2a. Template Definition and Usage

**Example:**
```tsx
// Template definition (a function)
let ModelCpx = (p) => {           // Template function
  return (                         // Returns JSX!
    <Model name={p.m} store={new ModelStore()}>
      {Array(p.n).fill(1).map((e, i) => <Elem name={`${p.e}${i}`} />)}
    </Model>
  )
}

// Usage
let me = <ModelCpx m='model' e='elem' n={3}>
  <Elem name='extra_elem' />
</ModelCpx>
```

**Compile Time:**
```javascript
// Template definition compiles to regular function
let ModelCpx = (p) => {
  return hm(Model, { name: p.m, ... },
    Array(p.n).fill(1).map((e, i) => hm(Elem, { name: `${p.e}${i}` }))
  );
}

// Usage compiles to hm() call
let me = hm(ModelCpx,
  { m: 'model', e: 'elem', n: 3 },
  hm(Elem, { name: 'extra_elem' })
);
```

**Runtime Phase 1 → Execution Order:**

```
Step 1: JavaScript evaluates arguments (inside-out)
  ├─ hm(Elem, {name: 'extra_elem'}) executes
  │  ├─ Elem({name: 'extra_elem'}) returns new Element(...)
  │  └─ Returns Element instance
  └─ Now ready to call: hm(ModelCpx, {...}, Element)

Step 2: Call hm(ModelCpx, {m: 'model', e: 'elem', n: 3}, extraElement)
  └─ Enters hm() function

Step 3: Inside hm() at line 21: let childElem = t(props)
  ├─ This calls: ModelCpx({m: 'model', e: 'elem', n: 3})
  └─ *** TEMPLATE FUNCTION EXECUTES NOW ***

Step 4: Inside ModelCpx function (executing now):
  ├─ Access p.m → "model", p.n → 3
  ├─ Execute new ModelStore()
  ├─ Execute Array(3).fill(1).map(...)  (argument evaluation)
  │  ├─ Calls hm(Elem, {name: "elem0"}) → Element
  │  ├─ Calls hm(Elem, {name: "elem1"}) → Element
  │  ├─ Calls hm(Elem, {name: "elem2"}) → Element
  │  └─ Returns [Element, Element, Element]
  ├─ Call hm(Model, {name: "model", ...}, [Element, Element, Element])
  │  ├─ Model({name: "model", ...}) returns new Element(...)
  │  └─ Returns Element with 3 children
  └─ Return this Element tree from ModelCpx

Step 5: Back in hm() function
  ├─ childElem = Element tree returned by ModelCpx
  ├─ childElem.children.push(extraElement)  (add extra_elem child)
  └─ return childElem  (complete Element tree)
```

**Key Point:** Template function `ModelCpx` is called **inside `hm()` at Runtime Phase 1**. The JSX it returns is **immediately executed** (also Runtime Phase 1), creating nested Element trees.

---

### Case 3: Composition Patterns - What Are You Passing?

It's crucial to distinguish between passing **Element instances** (already-evaluated JSX) vs **template functions** (not yet evaluated).

#### Pattern A: Passing Element Instances (Composition via Evaluation)

**Scenario:** You have a function that takes an already-created Element and modifies it.

```tsx
// Function that takes an already-evaluated Element and enriches it
const addTimestamps = (entity: Element) => {
  entity.props.createdAt = new Date()
  entity.props.updatedAt = new Date()
  return entity
}

<Model name='SchemaModel' store={store}>
  {addTimestamps(<Entity name='Student'/>)}  // Pass Element instance
</Model>
```

**Runtime Phase 1 Execution:**

1. `<Entity name='Student'/>` → `hm(Entity, {name: 'Student'})` executes
   - Returns Element instance
2. `addTimestamps(Element)` is called with this Element instance
   - Adds `createdAt` and `updatedAt` properties
   - Returns the modified Element
3. This modified Element becomes a child of Model

**What's passed:** An Element instance (result of evaluating JSX)

**When evaluated:** The JSX `<Entity name='Student'/>` is evaluated **before** `addTimestamps` receives it

---

#### Pattern B: Passing Template Functions (Higher-Order Templates)

**Scenario:** You want to wrap any template with common structure.

```tsx
// Higher-order function that takes a template FUNCTION as parameter
const withAuditFields = (EntityTemplate: Function) => (props) => {
  return <Entity {...props}>
    <Attribute name='id' type='string'/>
    <Attribute name='createdBy' type='string'/>
    <Attribute name='createdAt' type='date'/>
    <EntityTemplate.name {...props}/>  {/* Use the passed template */}
  </Entity>
}

// Pass Entity template FUNCTION (not evaluated!)
const AuditedEntity = withAuditFields(Entity)

// Use it later
<Model name='SchemaModel' store={store}>
  <AuditedEntity name='Student'/>
</Model>
```

**Compile Time:**
```javascript
// Template definition
const withAuditFields = (EntityTemplate) => (props) => {
  return hm(Entity, {...props},
    hm(Attribute, {name: 'id', type: 'string'}),
    hm(Attribute, {name: 'createdBy', type: 'string'}),
    hm(Attribute, {name: 'createdAt', type: 'date'}),
    hm(EntityTemplate.name, {...props})  // Template used as tag
  )
}

// Pass function reference
const AuditedEntity = withAuditFields(Entity)

// Usage
hm(Model, {name: 'SchemaModel', store},
  hm(AuditedEntity, {name: 'Student'})
)
```

**Runtime Phase 1 Execution:**

1. `withAuditFields(Entity)` executes immediately
   - `Entity` **function reference** is passed (NOT called!)
   - Returns a new function that closes over `Entity`
   - `AuditedEntity` now holds this returned function

2. Later: `hm(AuditedEntity, {name: 'Student'})` executes
   - Inside `hm()`: calls `AuditedEntity({name: 'Student'})`
   - Inside `AuditedEntity`: evaluates JSX with `<EntityTemplate.name ...>`
   - This becomes `hm(Entity, {name: 'Student'})`
   - `Entity({name: 'Student'})` finally executes
   - Returns complete Element tree with audit fields

**What's passed:** A template function reference (not evaluated until used in JSX)

**When evaluated:** The template function is evaluated **inside `hm()`** when used as a JSX tag

---

#### Pattern C: Function Composition f(g(x))

**Scenario:** Apply multiple transformations to an Element in sequence.

```tsx
// Function that marks an entity for versioning
const makeVersioned = (entity: Element) => {
  entity.props.versioned = true
  return entity
}

// Function that marks an entity for soft delete
const makeSoftDeletable = (entity: Element) => {
  entity.props.softDelete = true
  return entity
}

<Model name='SchemaModel' store={store}>
  {makeSoftDeletable(makeVersioned(<Entity name='Product'/>))}
</Model>
```

**Runtime Phase 1 Execution:**

1. `<Entity name='Product'/>` → `hm(Entity, {name: 'Product'})` executes
   - Returns Element instance (innermost evaluation)

2. `makeVersioned(Element)` executes
   - Sets `versioned = true` on the Element
   - Returns modified Element

3. `makeSoftDeletable(Element)` executes
   - Sets `softDelete = true` on the Element
   - Returns further modified Element

4. This final Element becomes a child of Model

**Evaluation order:** Inside-out: x first, then g(x), then f(g(x))

**What's passed:** Element instances at each stage (not functions)

---

#### Pattern D: Metamodel Example - Table Composition

```tsx
// Metamodel example: Add primary key column to any table
const withPrimaryKey = (table: Element) => {
  table.children.unshift(<Column name='id' type='INTEGER' isPrimaryKey={true}/>)
  return table
}

// Add timestamps to any table
const withTimestamps = (table: Element) => {
  table.children.push(
    <Column name='created_at' type='TIMESTAMP'/>,
    <Column name='updated_at' type='TIMESTAMP'/>
  )
  return table
}

<Model name='RelationalModel' store={store}>
  {withTimestamps(withPrimaryKey(
    <Table name='students'>
      <Column name='name' type='VARCHAR'/>
      <Column name='email' type='VARCHAR'/>
    </Table>
  ))}
</Model>
```

**Result after composition:** A Table with id, name, email, created_at, updated_at columns

**Runtime Phase 1:**
1. `<Table>` with children evaluates → Element tree
2. `withPrimaryKey` adds id column at beginning
3. `withTimestamps` adds timestamp columns at end
4. Final composed Element becomes child of Model

---

### Case 4: Elements in Props (Nested Elements)

When you pass Element instances as prop values, they must be resolved during **Runtime Phase 2** (render).

**Example:**
```tsx
<ForeignKey
  referencedTable={<Table name='users'/>}  // Element in prop
  ownerTable={<Table name='orders'/>}      // Element in prop
/>
```

**Runtime Phase 1:**
- Creates Element tree with nested Element instances as prop values
- Props contain Element objects, not model elements yet

**Runtime Phase 2 (during `render()`):**

The `renderProps()` method (called by `create()`) recursively renders nested Elements:

```typescript
private renderProps(props: P, ctx: Context, isImport: boolean): {} {
  let renderedProps = {};

  for (const [key, value] of Object.entries(props)) {
    if (Array.isArray(value)) {
      tmp = value.map((v) => {
        if (v instanceof Element) {
          return v.render(ctx, isImport);  // RECURSIVE: Element → model element
        }
        return v;
      });
    } else if (value instanceof Element) {
      tmp = value.render(ctx, isImport);   // RECURSIVE: Element → model element
    } else {
      tmp = value;  // Regular value, use as-is
    }

    renderedProps[key] = tmp;
  }

  return renderedProps;
}
```

**Result:** Props now contain actual model element instances, not Element nodes

---

### Summary Table: When Things Execute

| Pattern | Compile Time | Runtime Phase 1 | Runtime Phase 2 (`render()`) |
|---------|--------------|-----------------|------------------------------|
| `<Elem name='x'/>` | → `hm(Elem, ...)` | `hm()` executes, calls `Elem()`, returns Element | Element → model element |
| `{array.map(...)}` | → `array.map(...)` in code | Array executes, creates Elements | Elements → model elements |
| Template function definition | Function compiled | Not executed yet | - |
| `<Template {...}/>` | → `hm(Template, ...)` | `hm()` calls Template function, Template returns JSX, JSX executes | - |
| Template returns JSX | Inner JSX → `hm()` calls | Inner `hm()` executes when Template runs | - |
| `{func(<Elem/>)}` | Compiled to JS | `<Elem/>` executes first, then `func(Element)` | - |
| `func(Template)` pass function | Compiled | Template reference passed, NOT called | - |
| Elements in props | Compiled | Element instances stored in props | `renderProps()` renders them |

---

## Special Case: ResolveElement

### Purpose

`ResolveElement` is used in **Model-to-Model (M2M) transformations** to reference model elements that were created by previous transformation rules.

**Problem:** During JSX execution, you need to reference a model element that doesn't exist yet (it will be created during rendering).

**Solution:** Store a function that will be called **during render()** when the referenced element exists.

### Example

**File:** `src/variability-option-test/var-transformation.test.tsx:141-160`

```tsx
return <Resolve name="res1" input={wm.domain} ruleName="Entity2Table">
  {(refTable: rt.ITable) => (
    <Resolve name="res2" input={wm.codomain} ruleName="Entity2Table">
      {(ownerTable: rt.ITable) => (
        <r.ForeignKey
          name={`for_key_ref_${refTable.name}`}
          referencedTable={<r.Table $refByName={refTable.name}/>}
          ownerTable={<r.Table $refByName={ownerTable.name}/>}
        />
      )}
    </Resolve>
  )}
</Resolve>
```

### How ResolveElement Works

**Definition:** `src/jsx/element.ts:456-477`

```typescript
interface IResolveElementProps {
  input: g.IModelElement;      // Source model element
  name?: string;
  ruleName?: string;            // Which transformation rule created the target
}

export const Resolve = (props: IResolveElementProps) => {
  return new ResolveElement(g.ModelElement, props as any, undefined);
};

export class ResolveElement extends Element<WithRefProps<IResolveElementProps>> {
  constructor(
    public readonly type: t.ObjectType<any, any>,
    props: IResolveElementProps,
    public readonly connInfo?: string | ConnectionInfo,
    public name?: string
  ) {
    super(type, props, connInfo, name);
  }
}
```

### Phase 1: JSX Execution (Function Storage)

```tsx
<Resolve input={wm.domain} ruleName="Entity2Table">
  {(refTable) => <ForeignKey name={refTable.name}/>}
</Resolve>
```

**Compiles to:**
```javascript
hm(Resolve,
  { input: wm.domain, ruleName: "Entity2Table" },
  (refTable) => hm(ForeignKey, { name: refTable.name })
)
```

**Execution:**
1. Function `(refTable) => {...}` is created but **NOT called**
2. `hm(Resolve, props, function)` executes
3. `Resolve(props)` returns `new ResolveElement(...)`
4. `childElem.children.push(function)` - **stores the function**
5. Returns `ResolveElement` with function as child

**Result:**
```javascript
ResolveElement {
  props: { input: wm.domain, ruleName: "Entity2Table" },
  children: [(refTable) => {...}]  // Function stored, NOT executed!
}
```

### Phase 2: render() Execution (Function Call)

**File:** `src/jsx/element.ts:377-426`

When `render()` processes children, it detects `ResolveElement` and executes special logic:

```typescript
function renderChild(childElement: Element<any, any>) {
  // Check if childElement is type of ResolveElement
  if (childElement instanceof ResolveElement) {
    const tempE: ResolveElement = childElement;

    // Step 1: Validate (must have exactly one function child)
    if (childElement.children.length !== 1) {
      throw new Error("Resolve element must have exactly one child!");
    }
    if (typeof childElement.children[0] !== "function") {
      throw new Error("Resolve element child must be a function!");
    }

    const m2mctx: M2MContext = ctx as M2MContext;

    // Step 2: Find which JSX Element transformed the input
    let targetJSXElement = m2mctx.resolveJSXElement(
      tempE.props.input as g.IModelElement,
      tempE.props.ruleName
    );

    // Step 3: Find the actual model element that was created
    const targetModelElement = m2mctx.resolveMap.get(targetJSXElement);

    if (!targetModelElement) {
      throw new Error("Target model element does not exist!");
    }

    // Step 4: Get the stored function
    let func: Function = childElement.children[0];

    // Step 5: CALL THE FUNCTION NOW with the resolved model element
    let childFuncElement = func(targetModelElement);  // ← EXECUTES HERE!

    // Step 6: Process the result
    if (childFuncElement instanceof ResolveElement) {
      childFuncElement = renderChild(childFuncElement);  // Recursive
    } else {
      connectToParent(childFuncElement, ctx, isImport);
    }

    return childFuncElement;
  }

  // Normal element handling...
  connectToParent(childElement, ctx, isImport);
}
```

### M2MContext Tracking

The `M2MContext` (extends `Context`) maintains two key mappings:

1. **resolveJSXElement(sourceElement, ruleName)**: Returns which JSX Element was used to transform a source model element
2. **resolveMap**: Maps `Element` → created `ModelElement`

These allow ResolveElement to:
1. Look up which transformation was applied to the source element
2. Retrieve the actual model element that was created
3. Pass it to the deferred function

### Execution Timeline

```
═══════════════════════════════════════════════════════════════════
PHASE 1: JSX EXECUTION
═══════════════════════════════════════════════════════════════════

JavaScript engine encounters:
  <Resolve input={entity} ruleName="Entity2Table">
    {(table) => <ForeignKey ref={table.name}/>}
  </Resolve>

Execution:
  1. Creates function: (table) => <ForeignKey .../>  (NOT CALLED)
  2. Calls: hm(Resolve, {input: entity, ...}, function)
     └─ Resolve(props) returns new ResolveElement(...)
     └─ Stores function in children array
  3. Returns: ResolveElement with function child

Result: ResolveElement { children: [Function] }

═══════════════════════════════════════════════════════════════════
PHASE 2: render() EXECUTION
═══════════════════════════════════════════════════════════════════

element.render(m2mContext) is called:

  1. Create parent model element

  2. Process children:
     - Detect ResolveElement

     - Look up transformation:
       m2mctx.resolveJSXElement(entity, "Entity2Table")
       → Returns: JSX Element that transformed entity

     - Look up created model element:
       m2mctx.resolveMap.get(jsxElement)
       → Returns: rt.ITable instance (the actual table)

     - Get stored function:
       func = childElement.children[0]

     - CALL FUNCTION NOW:  ← THIS IS WHERE FUNCTION EXECUTES!
       childFuncElement = func(tableInstance)

       Inside function:
         - Parameter table = tableInstance (actual ITable)
         - Executes: <ForeignKey ref={table.name}/>
         - Can access table.name (actual data!)
         - Returns: Element tree for ForeignKey

     - Render returned Element:
       connectToParent(childFuncElement, ctx, isImport)
       → Creates ForeignKey model element

  3. Return parent model element
```

### Why Deferred Execution?

Consider this M2M transformation scenario:

```tsx
// Rule 1: Entity → Table
Entity2Table(entity) {
  return <r.Table name={entity.name}/>
}

// Rule 2: Association → ForeignKey
// Problem: Need to reference the Table created by Rule 1!
Association2FK(assoc) {
  // assoc.domain is an Entity
  // But we need the Table that was created from it
  // Solution: Use Resolve

  return <Resolve input={assoc.domain} ruleName="Entity2Table">
    {(table) => (  // table = the ITable created by Entity2Table rule
      <r.ForeignKey
        name={`fk_${table.name}`}  // Can access actual table data!
        referencedTable={table}
      />
    )}
  </Resolve>
}
```

**Without ResolveElement:** During JSX execution, the Table doesn't exist yet!

**With ResolveElement:**
1. During JSX execution: Store the function `(table) => {...}`
2. During render():
   - Entity2Table rule runs → creates Table → stores in resolveMap
   - Association2FK rule runs → ResolveElement looks up the created Table
   - Calls stored function with the actual Table instance
   - Function can access real data (table.name, etc.)

---

## Summary and Key Concepts

### Three Distinct Phases

1. **Compile Time (TypeScript)**
   - Transforms JSX syntax → `hm()` calls
   - No execution, just code generation
   - Triggered by: `tsc` or build tool

2. **Runtime Phase 1 (Element Tree Construction)**
   - JavaScript engine executes `hm()` calls
   - Template functions create Element instances
   - Result: Element tree (metadata)
   - No model elements in store yet!

3. **Runtime Phase 2 (Model Element Creation)**
   - Developer explicitly calls `render()`
   - Traverses Element tree
   - Creates actual model elements in store
   - Result: IModel/IModelElement instances with IDs, names, relationships

### Key Distinctions

| Concept | What It Is | When Created | Purpose |
|---------|-----------|--------------|---------|
| JSX Syntax | Code written by developer | Development time | Human-readable model definition |
| `hm()` calls | Generated JavaScript | Compile time | Bridge between JSX and runtime |
| Element tree | Metadata structure | Runtime Phase 1 (JSX execution) | Description of model to create |
| Model elements | Actual data objects | Runtime Phase 2 (`render()` call) | Real model instances in store |

### Element Tree vs Model Elements

**Element Tree** (after JSX execution):
- Instances of `Element` class
- Contains props and children
- No IDs, not registered anywhere
- Just a description/template

**Model Elements** (after `render()` call):
- Instances of `IModel`, `IModelElement`, etc.
- Have unique IDs
- Registered in ModelStore by name
- Connected via relationships
- Actual domain data

### Execution Timing Summary

| What | When | Who | Why |
|------|------|-----|-----|
| TypeScript transform | Build time | `tsc` compiler | Convert JSX → JavaScript |
| `hm()` execution | Immediately on code load | JavaScript engine | Build Element tree |
| Template function call | Inside `hm()` | `hm()` via `t(props)` | Create Element instance |
| Embedded computation | Before outer `hm()` | JavaScript engine (argument eval) | Compute dynamic children |
| `render()` call | Whenever developer wants | Developer code | Create model elements |
| ResolveElement function | During `render()` | `renderChild()` logic | Reference transformed elements |

### Common Patterns

#### Pattern 1: Simple Model Creation
```tsx
/** @jsx hm */
import { hm, render } from './handle'

// Create Element tree
const element = <Model name='myModel' store={new ModelStore()}>
  <Elem name='elem1'/>
</Model>

// Render to create model elements
const model = render(element)
```

#### Pattern 2: Dynamic Element Creation
```tsx
const DynamicModel = (props) => {
  return <Model name={props.name} store={new ModelStore()}>
    {props.elements.map(name => <Elem name={name}/>)}
  </Model>
}

const element = <DynamicModel name='myModel' elements={['a', 'b', 'c']}/>
const model = render(element)
```

#### Pattern 3: M2M Transformation with ResolveElement
```tsx
const Entity2Table = (entity) => {
  return <r.Table name={entity.name}/>
}

const Association2FK = (assoc, m2mctx) => {
  return <Resolve input={assoc.domain} ruleName="Entity2Table">
    {(domainTable) => (
      <Resolve input={assoc.codomain} ruleName="Entity2Table">
        {(codomainTable) => (
          <r.ForeignKey
            name={`fk_${domainTable.name}_${codomainTable.name}`}
            from={domainTable}
            to={codomainTable}
          />
        )}
      </Resolve>
    )}
  </Resolve>
}

// Render with M2MContext to enable ResolveElement functionality
const model = element.render(new M2MContext())
```

### Best Practices

1. **Always use the JSX pragma:** Every `.tsx` file must have `/** @jsx hm */`

2. **Don't forget to call render():** Element trees don't automatically become model elements

3. **Use ResolveElement for cross-references:** In M2M transformations, use `<Resolve>` to reference previously transformed elements

4. **Understand the phases:** Know when code executes (compile vs runtime vs render)

5. **Separate concerns:**
   - JSX for structure
   - Templates for reusable components
   - `render()` for execution

---

## File References

- **JSX Factory:** `src/jsx/handle.ts:19-24`
- **Element Class:** `src/jsx/element.ts:87-454`
- **Element.render():** `src/jsx/element.ts:313-373`
- **Element.create():** `src/jsx/element.ts:192-305`
- **renderProps():** `src/jsx/element.ts:109-149`
- **ResolveElement:** `src/jsx/element.ts:456-477`
- **ResolveElement handling:** `src/jsx/element.ts:377-426`
- **ModelStore:** `src/model-store/ModelsStore.ts`
- **Context:** `src/jsx/context.ts`
- **Tests:** `src/jsx/handle.test.tsx`

---

*Document Version: 1.0*
*Last Updated: 2026-02-26*
