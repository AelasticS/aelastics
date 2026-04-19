# Why Two-Phase Rendering?

This document explains the architectural rationale for the two-phase rendering design in aelastics-synthesis.

## Table of Contents

1. [The Two Phases](#the-two-phases)
2. [Could We Use Just One Phase?](#could-we-use-just-one-phase)
3. [Why Two Phases Are Necessary](#why-two-phases-are-necessary)
4. [Use Cases That Require Two Phases](#use-cases-that-require-two-phases)
5. [Trade-offs](#trade-offs)
6. [Conclusion](#conclusion)

---

## The Two Phases

The aelastics-synthesis rendering process operates in two distinct runtime phases:

### Phase 1: Element Tree Construction

**When:** Immediately when JSX code executes
**What:** JSX expressions are evaluated and transformed into an Element tree
**Result:** A tree of Element instances (metadata describing the model structure)

```tsx
let element = <Model name='myModel' store={store}>
  <Entity name='User'/>
  <Entity name='Product'/>
</Model>

// After Phase 1: element is an Element tree (not model elements yet)
```

### Phase 2: Model Instantiation

**When:** Explicitly triggered by calling `render()`
**What:** The Element tree is traversed and transformed into actual model elements
**Result:** Model elements created in the ModelStore with IDs, registered names, and relationships

```tsx
// Phase 2: Explicitly render
let model = element.render(new Context())

// Now: model is IModel with actual User and Product elements in the store
```

---

## Could We Use Just One Phase?

Yes, technically possible! JSX could create model elements directly:

### One-Phase Alternative:

```tsx
// Hypothetical one-phase system
const ctx = new Context()
ctx.pushStore(new ModelStore())

// JSX creates model elements IMMEDIATELY
let model = <Model name='myModel' context={ctx}>
  <Entity name='User'/>    // Creates IModelElement immediately
  <Entity name='Product'/> // Creates IModelElement immediately
</Model>

// model is already IModel instance with elements in store
```

### Why Don't We Do This?

While simpler, one-phase design loses critical capabilities that model synthesis requires.

---

## Why Two Phases Are Necessary

### 1. Safe Composition and Transformation

**Two Phases:** Transform Element trees safely before creating model elements

```tsx
// Build Element tree
let table = <Table name='students'>
  <Column name='name' type='VARCHAR'/>
</Table>

// Transform the Element tree (safe - not real objects yet)
table = withPrimaryKey(table)    // Adds id column
table = withTimestamps(table)    // Adds created_at, updated_at columns

// NOW create actual model elements
let realTable = render(table)
```

**One Phase:** Would modify real objects in the store

```tsx
// Creates real table immediately
let table = <Table name='students' context={ctx}>
  <Column name='name' type='VARCHAR'/>
</Table>  // Already in store!

// Modifying REAL table in the store (dangerous!)
table = withPrimaryKey(table)     // Mutates real object
table = withTimestamps(table)     // Mutates real object

// No separation between structure definition and instantiation
```

**Problem:** No safe intermediate representation for transformations.

---

### 2. Reusability

**Two Phases:** Render the same Element tree multiple times

```tsx
// Define structure once
let entityTemplate = <Entity name='BaseEntity'>
  <Attribute name='id' type='string'/>
  <Attribute name='createdAt' type='date'/>
</Entity>

// Reuse in different models
let user = entityTemplate.render(userModelContext)
let product = entityTemplate.render(productModelContext)
let order = entityTemplate.render(orderModelContext)

// Same structure, different model instances
```

**One Phase:** Can only create once

```tsx
// Creates immediately in specific store
let entityTemplate = <Entity name='BaseEntity' context={ctx}>
  <Attribute name='id' type='string'/>
  <Attribute name='createdAt' type='date'/>
</Entity>  // Already created in ctx's store!

// Cannot reuse - already exists in one specific store
```

**Problem:** No way to define reusable model structures.

---

### 3. Validation Before Creation

**Two Phases:** Validate Element tree structure before committing

```tsx
// Build Element tree
let model = <Model name='myModel' store={store}>
  <Entity name='User'>
    <Attribute name='id' type='string'/>
  </Entity>
</Model>

// Validate structure
if (hasRequiredAttributes(model)) {
  if (namesAreUnique(model)) {
    // Only create if valid
    let realModel = render(model)
  } else {
    throw new Error("Duplicate names found")
  }
} else {
  throw new Error("Missing required attributes")
}
```

**One Phase:** Model elements already created

```tsx
// Creates immediately - no chance to validate first!
let model = <Model name='myModel' context={ctx}>
  <Entity name='User'>
    <Attribute name='id' type='string'/>
  </Entity>
</Model>  // Already in store - validation too late!

// Can only validate after creation (must rollback if invalid)
```

**Problem:** Cannot validate before side effects occur.

---

### 4. ResolveElement and Declarative M2M Transformations

**Two Phases:** Enable declarative, order-independent transformations

```tsx
// Define transformations in any order - system resolves dependencies
const transformation = [
  // Create tables from entities
  ...entities.map(entity => (
    <Table name={entity.name}>
      {entity.attributes.map(attr => (
        <Column name={attr.name} type={attr.type}/>
      ))}
    </Table>
  )),

  // Create foreign keys from associations
  // ResolveElement references tables that will be created above
  ...associations.map(assoc => (
    <Resolve input={assoc.from} ruleName="Entity2Table">
      {(fromTable) => (
        <Resolve input={assoc.to} ruleName="Entity2Table">
          {(toTable) => (
            <ForeignKey
              name={`fk_${fromTable.name}_${toTable.name}`}
              from={fromTable}
              to={toTable}
            />
          )}
        </Resolve>
      )}
    </Resolve>
  ))
]

// Render resolves all dependencies automatically
transformation.forEach(element => element.render(ctx))
```

**Execution:**
1. Phase 1: All rules create Element trees, ResolveElements store functions
2. Phase 2: Render creates Tables, then when ResolveElement is encountered:
   - Looks up which Table was created from entity
   - Calls stored function with that Table
   - Function can now reference the real Table!

**One Phase:** Manual dependency tracking required

```tsx
// MUST manually order execution and track created elements
const tableMap = new Map()

// Step 1: MUST create all tables first
entities.forEach(entity => {
  const table = <Table name={entity.name} context={ctx}>
    {entity.attributes.map(attr => (
      <Column name={attr.name} type={attr.type} context={ctx}/>
    ))}
  </Table>  // Created immediately

  tableMap.set(entity, table)  // Manual tracking!
})

// Step 2: MUST create foreign keys after (order dependency!)
associations.forEach(assoc => {
  const fromTable = tableMap.get(assoc.from)  // Manual lookup
  const toTable = tableMap.get(assoc.to)

  if (!fromTable || !toTable) {
    throw new Error("Tables must be created first!") // Brittle!
  }

  <ForeignKey
    name={`fk_${fromTable.name}_${toTable.name}`}
    from={fromTable}
    to={toTable}
    context={ctx}
  />
})
```

**Problems:**
- ❌ Must manually figure out execution order
- ❌ Must manually track all created elements
- ❌ Brittle - breaks if order changes
- ❌ Not declarative - programmer manages complexity

---

### 5. Conditional Model Creation

**Two Phases:** Decide whether to create based on conditions

```tsx
// Build multiple alternative structures
let sqliteSchema = <Model name='SQLite'>
  <Table name='users'>
    <Column name='id' type='INTEGER' primaryKey={true}/>
  </Table>
</Model>

let postgresSchema = <Model name='Postgres'>
  <Table name='users'>
    <Column name='id' type='SERIAL' primaryKey={true}/>
  </Table>
</Model>

// Choose which to instantiate based on runtime condition
let schema = (databaseType === 'sqlite') ? sqliteSchema : postgresSchema
let model = render(schema)  // Only chosen one is created
```

**One Phase:** Both created immediately

```tsx
// Both created immediately - no way to choose!
let sqliteSchema = <Model name='SQLite' context={sqliteCtx}>
  <Table name='users' context={sqliteCtx}>
    <Column name='id' type='INTEGER' primaryKey={true} context={sqliteCtx}/>
  </Table>
</Model>  // Already in store!

let postgresSchema = <Model name='Postgres' context={postgresCtx}>
  <Table name='users' context={postgresCtx}>
    <Column name='id' type='SERIAL' primaryKey={true} context={postgresCtx}/>
  </Table>
</Model>  // Already in store!

// Both exist - cannot conditionally choose
```

**Problem:** No way to defer instantiation until runtime conditions are known.

---

### 6. Inspection and Debugging

**Two Phases:** Inspect Element tree before committing

```tsx
// Build Element tree
let model = <Model name='myModel' store={store}>
  <Entity name='User'/>
  <Entity name='Product'/>
  <Entity name='Order'/>
</Model>

// Inspect structure
console.log(`Model has ${model.children.length} entities`)
model.children.forEach(child => {
  console.log(`Entity: ${child.props.name}`)
})

// Debug or log before creating
logger.info(`About to create model: ${JSON.stringify(model, null, 2)}`)

// Now create
let realModel = render(model)
```

**One Phase:** Nothing to inspect

```tsx
// Creates immediately
let model = <Model name='myModel' context={ctx}>
  <Entity name='User'/>
  <Entity name='Product'/>
  <Entity name='Order'/>
</Model>  // Already created!

// No intermediate representation to inspect
// Can only inspect after creation
```

**Problem:** Harder to debug and understand what will be created.

---

## Use Cases That Require Two Phases

### Use Case 1: Model Template Libraries

```tsx
// Define reusable entity templates
const AuditedEntity = (props) => (
  <Entity {...props}>
    <Attribute name='id' type='string'/>
    <Attribute name='createdBy' type='string'/>
    <Attribute name='createdAt' type='date'/>
    <Attribute name='updatedAt' type='date'/>
  </Entity>
)

// Reuse across multiple models
const userModel = <Model name='Users' store={store1}>
  <AuditedEntity name='User'/>
  <AuditedEntity name='Role'/>
</Model>

const productModel = <Model name='Products' store={store2}>
  <AuditedEntity name='Product'/>
  <AuditedEntity name='Category'/>
</Model>

// Render when ready
render(userModel)
render(productModel)
```

**Impossible with one phase** - templates would create in first usage only.

---

### Use Case 2: Builder Pattern

```tsx
class SchemaBuilder {
  private elements: Element[] = []

  addEntity(name: string) {
    this.elements.push(<Entity name={name}/>)
    return this
  }

  addAttribute(entityName: string, attrName: string) {
    // Find entity and add attribute
    const entity = this.findEntity(entityName)
    entity.children.push(<Attribute name={attrName}/>)
    return this
  }

  build(store: ModelStore): IModel {
    const model = <Model name='schema' store={store}>
      {this.elements}
    </Model>
    return render(model)  // Only create when build() is called
  }
}

// Use builder
const schema = new SchemaBuilder()
  .addEntity('User')
  .addAttribute('User', 'name')
  .addAttribute('User', 'email')
  .addEntity('Product')
  .build(store)
```

**Impossible with one phase** - cannot manipulate structure before creation.

---

### Use Case 3: Complex M2M with Multiple Passes

```tsx
// Pass 1: Transform entities to tables
const tables = entities.map(entity =>
  Entity2Table(entity)  // Returns Element
)

// Pass 2: Add derived columns based on analysis
tables.forEach(table => {
  if (needsVersioning(table)) {
    table.children.push(<Column name='version' type='INTEGER'/>)
  }
  if (needsSoftDelete(table)) {
    table.children.push(<Column name='deleted_at' type='TIMESTAMP'/>)
  }
})

// Pass 3: Add foreign keys with ResolveElement
const foreignKeys = associations.map(assoc =>
  Association2FK(assoc)  // Returns Element with ResolveElement
)

// NOW render everything
const model = <Model name='target' store={store}>
  {tables}
  {foreignKeys}
</Model>

render(model)
```

**Impossible with one phase** - cannot analyze and modify between passes.

---

## Trade-offs

| Aspect | Two Phases | One Phase |
|--------|------------|-----------|
| **Flexibility** | ✅ High - compose, transform, validate, reuse | ❌ Low - immediate creation |
| **Reusability** | ✅ Render same structure multiple times | ❌ Can only create once |
| **Validation** | ✅ Validate before creating | ❌ Validate after (must rollback) |
| **M2M Transformations** | ✅ Declarative with ResolveElement | ❌ Manual ordering and tracking |
| **Debugging** | ✅ Inspect Element tree | ❌ Nothing to inspect |
| **Memory** | ❌ More - Element tree + model elements | ✅ Less - only model elements |
| **Performance** | ❌ Two passes over structure | ✅ One pass |
| **Complexity** | ❌ More concepts (Element vs IModelElement) | ✅ Simpler (only model elements) |

---

## Conclusion

### Two phases are necessary for:

1. **✅ Safe Composition** - Transform structure before creation
2. **✅ Reusability** - Render same structure multiple times
3. **✅ Validation** - Check structure before committing
4. **✅ Declarative M2M** - ResolveElement enables order-independent transformations
5. **✅ Conditional Creation** - Decide what to create at runtime
6. **✅ Inspection** - Debug and analyze before creation
7. **✅ Builder Patterns** - Construct models programmatically

### One phase would be:

- **✅ Simpler** - Fewer concepts
- **✅ Faster** - One pass
- **✅ Less memory** - No Element tree
- **❌ Less flexible** - Lose all composition and transformation capabilities
- **❌ Brittle** - Manual dependency management for M2M
- **❌ Not reusable** - Cannot render structure multiple times

### Design Decision:

The two-phase design **prioritizes flexibility and expressiveness** over simplicity and performance. This is the right trade-off for model synthesis because:

1. Model creation is **not performance-critical** (happens once, not in tight loops)
2. **Flexibility is critical** for complex model transformations
3. **Declarative M2M** transformations are a core use case
4. **Reusability** is essential for model template libraries

The additional complexity of maintaining both Element trees and model elements is justified by the capabilities it enables, particularly for Model-to-Model transformations where ResolveElement provides declarative, order-independent cross-referencing.

---

*Document Version: 1.0*
*Last Updated: 2026-02-27*
