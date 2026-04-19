

4.4 Transformation Implementation

Opening paragraph — the rule-based decomposition rationale (current text: Section 3 formalizes... through ...conforming to Σ_T)
Class structure — abstractM2M base class, template method as entry point, rules as methods
Decorator mechanism — the two concerns (dispatch and tracing), why class/method structure is required, the two categories explained (@SpecPoint/@SpecOption for dispatch, @M2M/@E2E for tracing)

That is it. No listings, or at most one small schematic listing showing the skeleton of a transformation class to make it concrete without going into the full example.

4.5 Transformation Example: OrgModel to ApprovalWorkflow

Brief intro sentence — what this section demonstrates
Source metamodel — Listing 6 (OrgSchema)
Source model — Listing 7 (CompanyOrg JSX)
Transformation specification — Listing 8 (Org2Workflow class with all rules), with commentary on each rule
Execution — prose walkthrough of dispatch sequence
Target model — Listing 9 (resulting JSX)
Dispatch correctness — Properties 10, 11, 12
Execution trace — brief paragraphyes



---

# Model-to-Model Transformation Developer Guide

This guide explains how to use the aelastics-synthesis transformation framework to define Model-to-Model (M2M) transformations using JSX templates and decorators.

## Table of Contents

1. [Overview](#overview)
2. [Basic Concepts](#basic-concepts)
3. [Decorators and Tracing](#decorators-and-tracing)
4. [Complete Example: Organization to Workflow](#complete-example-organization-to-workflow)
5. [Advanced Patterns](#advanced-patterns)
6. [Best Practices](#best-practices)

---

## Overview

### What is a Transformation?

A **transformation** is a class that converts models from one metamodel to another. The transformation:

1. **Inherits from `abstractM2M`** - An abstract base class providing transformation infrastructure
2. **Consists of transformation rules** - Methods that map source model concepts to target model concepts
3. **Uses JSX notation** - Rules are written using JSX with embedded computations to implement transformation logic
4. **Supports rule invocation** - Rules can invoke other rules (subrules) to handle nested structures
5. **Starts from a template method** - The top-level rule inherited as an abstract method from the base class

```tsx
import { abstractM2M } from "aelastics-synthesis";
import { ModelStore } from "aelastics-synthesis";

class MyTransformation extends abstractM2M<ISourceModel, ITargetModel> {
  constructor(store: ModelStore) {
    super(store);
  }

  // Top-level rule: defines overall transformation structure
  template(source: ISourceModel): Element<ITargetModel> {
    return (
      <TargetModel name={source.name}>
        {source.elements.map(elem => this.SourceElement2TargetElement(elem))}
      </TargetModel>
    );
  }

  // Transformation rule: maps source concept to target concept
  SourceElement2TargetElement(elem: ISourceElement): Element<ITargetElement> {
    return (
      <TargetElement name={elem.name}>
        {/* Embedded computation */}
        {elem.children?.map(child => this.SourceElement2TargetElement(child))}
      </TargetElement>
    );
  }
}
```

### How Transformations Work

```
METAMODEL LEVEL (M2):

    Source Metamodel ─────── Transformation Definition ─────> Target Metamodel
    (Entity, Attribute)      (Entity→Table, Attr→Column)      (Table, Column)
           ▲                                                          ▲
           │                                                          │
    conforms to                                                conforms to
           │                                                          │
           │                                                          │

MODEL LEVEL (M1):

    Source Model ──────────── transform() ──────────────────> Target Model
    (User entity,            [executes transformation]        (User table,
     name attribute)                                           name column)
```

**Key points:**
- Transformation **rules** are defined using **metamodel element types** (e.g., "Entity→Table")
- Transformation **execution** operates on **model instances** (e.g., specific User entity)
- Source and target models conform to their respective metamodels

---

## Basic Concepts

### The Abstract Metamodel

All metamodels extend from a base abstract metamodel that defines common concepts:

```typescript
import * as t from "aelastics-types";

export const AbstractSchema = t.schema("Abstract-Schema");

// Base element in any model
export const ModelElement = t.entity({
    name: t.string,
}, ["name"], "ModelElement", AbstractSchema);

// Model contains elements
export const Model = t.subtype(ModelElement, {
    elements: t.arrayOf(ModelElement),
}, "Model", AbstractSchema);

export type IModelElement = t.TypeOf<typeof ModelElement>;
export type IModel = t.TypeOf<typeof Model>;
```

### Transformation Class Structure

A transformation class has the following structure:

```tsx
class MyTransformation extends abstractM2M<ISourceModel, ITargetModel> {

  // 1. Constructor: receives ModelStore for creating target elements
  constructor(store: ModelStore) {
    super(store);
  }

  // 2. Template method: top-level rule (abstract method from base class)
  template(source: ISourceModel): Element<ITargetModel> {
    // Defines overall transformation structure
  }

  // 3. Transformation rules: methods that transform elements
  SourceConcept2TargetConcept(src: ISourceConcept): Element<ITargetConcept> {
    return (
      <TargetConcept name={src.name}>
        {/* JSX with embedded computations */}
        {src.property ? this.SubRule(src.property) : null}
      </TargetConcept>
    );
  }
}
```

### Transformation Rules

**Rules** are methods that:
- Take a **source model element** as input
- Return a **JSX Element** (not rendered yet - Phase 1)
- Can contain **embedded computations** (conditionals, loops, calculations)
- Can **invoke other rules** to handle nested structures

```tsx
// Rule with embedded computation and subrule invocation
SourceElement2TargetElement(src: ISourceElement): Element<ITargetElement> {
  // Embedded computation: conditional logic
  const targetType = src.isComplex ? "ComplexTarget" : "SimpleTarget";

  return (
    <TargetElement name={src.name} type={targetType}>
      {/* Embedded computation: iteration */}
      {src.children.map(child =>
        // Subrule invocation
        this.SourceElement2TargetElement(child)
      )}
    </TargetElement>
  );
}
```

### The Template Method

The **template method** is the entry point for transformation. It:
- Is declared as **abstract** in `abstractM2M` base class
- Must be **implemented** by concrete transformation classes
- Receives the **source model** as parameter
- Returns a **JSX Element** representing the **target model structure**
- Typically invokes other rules to transform nested elements

```tsx
template(source: ISourceModel): Element<ITargetModel> {
  return (
    <TargetModel name={`${source.name}_transformed`}>
      {source.elements.map(elem => this.Rule1(elem))}
      {source.relations.map(rel => this.Rule2(rel))}
    </TargetModel>
  );
}
```

---

## Decorators and Tracing

### Why Do We Need Decorators?

When transforming complex models, you often need to:

1. **Trace which target elements came from which source elements** - For debugging, understanding provenance, and creating trace models
2. **Cross-reference transformed elements** - Rules processing associations/relationships need to reference elements created by other rules
3. **Handle type hierarchies** - Different transformation logic for subtypes (e.g., Kernel vs Weak entities)

Decorators provide these capabilities automatically.

### @E2E Decorator: Element-to-Element Tracing

The `@E2E` decorator creates automatic trace links between source and target elements.

```tsx
@E2E({
  input: SourceElementType,   // Source metamodel element type
  output: TargetElementType   // Target metamodel element type
})
SourceElement2TargetElement(src: ISourceElement): Element<ITargetElement> {
  return <TargetElement name={src.name} />;
}
```

**What @E2E does:**
1. Records the source element before the rule executes
2. Records the returned target Element after the rule executes
3. Creates a trace link in `context.traceMap`
4. Enables other rules to look up "which TargetElement was created from this SourceElement?"

**Why it's needed:**
- Cross-referencing: When processing relationships, you need to find transformed elements
- Tracing: Understanding transformation provenance
- Debugging: Tracking which rules created which elements

### @SpecPoint and @SpecOption: Rule Specialization

When your source metamodel has type hierarchies, you need different logic for subtypes.

```tsx
// General rule for all source elements
@SpecPoint()
@E2E({ input: SourceBase, output: TargetBase })
SourceBase2TargetBase(src: ISourceBase): Element<ITargetBase> {
  return <TargetBase name={src.name} />;
}

// Specialized rule for SourceTypeA (subtype of SourceBase)
@SpecOption('SourceBase2TargetBase', SourceTypeA)
SourceTypeA2TargetA(src: ISourceTypeA): Element<ITargetBase> {
  return <TargetBase extraProp={src.specificProperty} />;
}

// Specialized rule for SourceTypeB (subtype of SourceBase)
@SpecOption('SourceBase2TargetBase', SourceTypeB)
SourceTypeB2TargetB(src: ISourceTypeB): Element<ITargetBase> {
  return <TargetBase name={`Special_${src.name}`} />;
}
```

**How specialization works:**
1. Framework checks the actual runtime type of the input element
2. Finds matching `@SpecOption` based on the type
3. Calls **both** the general rule and the specialized rule
4. **Merges** the results (specialized properties override general properties)

**Why it's needed:**
- Handles inheritance hierarchies in source metamodels
- Avoids complex conditional logic in rules
- Keeps code clean and maintainable

### @M2M Decorator: Transformation Metadata

The `@M2M` decorator records transformation metadata:

```tsx
@M2M({
  input: SourceModelType,    // Source metamodel
  output: TargetModelType    // Target metamodel
})
class MyTransformation extends abstractM2M<ISourceModel, ITargetModel> {
  // ...
}
```

**What @M2M does:**
- Records which metamodels are involved
- Creates transformation type information
- Used for generating transformation models and documentation

---

## Complete Example: Organization to Workflow

Let's walk through a complete transformation that converts organizational structures into workflow processes.

### Step 1: Define Source Metamodel (Organizational Structure)

```typescript
import * as t from "aelastics-types";
import { ModelElement, Model } from "aelastics-synthesis";

export const OrgSchema = t.schema("Org-Schema");

// Base organizational unit
export const OrgUnit = t.subtype(ModelElement, {}, "OrgUnit", OrgSchema);

// Department contains nested units
export const Department = t.subtype(OrgUnit, {
    units: t.arrayOf(OrgUnit),
}, "Department", OrgSchema);

// Work position with a level
export const WorkPosition = t.subtype(OrgUnit, {
    level: t.string,
}, "WorkPosition", OrgSchema);

// Organization is the root model
export const Organization = t.subtype(Model, {
    units: t.arrayOf(OrgUnit),
}, "Organization", OrgSchema);

export type IOrgUnit = t.TypeOf<typeof OrgUnit>;
export type IDepartment = t.TypeOf<typeof Department>;
export type IWorkPosition = t.TypeOf<typeof WorkPosition>;
export type IOrganization = t.TypeOf<typeof Organization>;
```

**Metamodel structure:**
```
Organization (Model)
  └─ units: OrgUnit[]
       ├─ Department (OrgUnit)
       │    └─ units: OrgUnit[]
       └─ WorkPosition (OrgUnit)
            └─ level: string
```

### Step 2: Define Target Metamodel (Workflow)

```typescript
import * as t from "aelastics-types";
import { ModelElement, Model } from "aelastics-synthesis";

export const WF_Schema = t.schema("Workflow-Schema");

// Base workflow step
export const Step = t.subtype(ModelElement, {}, "Step", WF_Schema);

// Task - atomic work unit
export const Task = t.subtype(Step, {
    performer: t.optional(t.string),
}, "Task", WF_Schema);

// Sequence - sequential execution
export const Sequence = t.subtype(Step, {
    steps: t.arrayOf(Step),
}, "Sequence", WF_Schema);

// Parallel - concurrent execution
export const Parallel = t.subtype(Step, {
    steps: t.arrayOf(Step),
}, "Parallel", WF_Schema);

// Process is the root workflow model
export const Process = t.subtype(Model, {
    flow: Step,
}, "Process", WF_Schema);

export type IStep = t.TypeOf<typeof Step>;
export type ITask = t.TypeOf<typeof Task>;
export type ISequence = t.TypeOf<typeof Sequence>;
export type IParallel = t.TypeOf<typeof Parallel>;
export type IProcess = t.TypeOf<typeof Process>;
```

**Metamodel structure:**
```
Process (Model)
  └─ flow: Step
       ├─ Task (Step)
       │    └─ performer?: string
       ├─ Sequence (Step)
       │    └─ steps: Step[]
       └─ Parallel (Step)
            └─ steps: Step[]
```

### Step 3: Create Source Model Instance

```tsx
/** @jsx hm */
import { hm } from "aelastics-synthesis";
import { Organization, Department, WorkPosition } from "./OrgMetamodel";

export const CompanyOrg =
  <Organization name="CompanyOrg">
    <Department name="Engineering">
      <WorkPosition name="Engineer" level="regular" />
      <WorkPosition name="Director" level="VIP" />
    </Department>
  </Organization>;
```

**This creates:**
```
CompanyOrg (Organization)
  └─ Engineering (Department)
       ├─ Engineer (WorkPosition, level="regular")
       └─ Director (WorkPosition, level="VIP")
```

### Step 4: Define Transformation

```tsx
/** @jsx hm */
import { hm, abstractM2M, M2M, E2E, SpecPoint, SpecOption } from "aelastics-synthesis";
import * as t from "aelastics-types";
import {
  Organization, OrgUnit, Department, WorkPosition,
  IOrganization, IDepartment, IWorkPosition, OrgSchema
} from "./OrgMetamodel";
import {
  Process, Sequence, Parallel, Task, IProcess, WF_Schema
} from "./WorkflowMetamodel";

@M2M({ input: OrgSchema, output: WF_Schema })
class Org2Workflow extends abstractM2M<IOrganization, IProcess> {

  // Top-level rule: Organization → Process
  @E2E({ input: Organization, output: Process })
  template(src: IOrganization): Element<IProcess> {
    return (
      <Process name={src.name}>
        <Sequence name="main">
          {src.units.map(u => this.OrgUnit2Step(u))}
        </Sequence>
      </Process>
    );
  }

  // General rule: OrgUnit → Task (default mapping)
  @SpecPoint()
  OrgUnit2Step(src: IOrgUnit): Element<IStep> {
    return <Task name={src.name} />;
  }

  // Specialized rule: Department → Sequence
  @SpecOption('OrgUnit2Step', Department)
  Department2Sequence(src: IDepartment): Element<ISequence> {
    return (
      <Sequence name={src.name}>
        {src.units.map(u => this.OrgUnit2Step(u))}
      </Sequence>
    );
  }

  // Specialized rule: WorkPosition → Approval Flow
  @SpecOption('OrgUnit2Step', WorkPosition)
  WorkPosition2Flow(src: IWorkPosition): Element<IStep> {
    // VIP positions require 3 approvals, regular positions require 2
    const n = src.level === "VIP" ? 3 : 2;
    const approvers = Array.from({ length: n }, (_, i) =>
      <Task name={`Approve ${src.name} stage ${i + 1}`} />
    );

    // VIP approvals run in parallel, regular approvals run sequentially
    return src.level === "VIP"
      ? <Parallel name={`${src.name}-approval`}>{approvers}</Parallel>
      : <Sequence name={`${src.name}-approval`}>{approvers}</Sequence>;
  }
}
```

### Step 5: Execute Transformation

```tsx
import { ModelStore, Context } from "aelastics-synthesis";

// Create source model instance
const sourceModel = CompanyOrg.render(new Context());

// Create transformation with target store
const targetStore = new ModelStore();
const transformation = new Org2Workflow(targetStore);

// Execute transformation
const targetModel = transformation.transform(sourceModel);

console.log(`Created process: ${targetModel.name}`);
```

### Step 6: Resulting Target Model

The transformation produces the following workflow:

```
CompanyOrg (Process)
  └─ main (Sequence)
       └─ Engineering (Sequence)              // From Department2Sequence
            ├─ Engineer-approval (Sequence)   // From WorkPosition2Flow (level="regular")
            │    ├─ Approve Engineer stage 1 (Task)
            │    └─ Approve Engineer stage 2 (Task)
            └─ Director-approval (Parallel)   // From WorkPosition2Flow (level="VIP")
                 ├─ Approve Director stage 1 (Task)
                 ├─ Approve Director stage 2 (Task)
                 └─ Approve Director stage 3 (Task)
```

### Execution Flow

1. **template()** is called with `CompanyOrg` organization
   - Creates a `Process` with a `Sequence` named "main"
   - Iterates over `units` array (contains `Engineering` department)
   - Calls `OrgUnit2Step(Engineering)`

2. **Dispatch selects Department2Sequence** because:
   - `Engineering` is of type `Department`
   - `Department ⊑ OrgUnit` (Department is subtype of OrgUnit)
   - A specialized rule exists for `Department`

3. **Department2Sequence()** executes:
   - Creates a `Sequence` named "Engineering"
   - Iterates over department's `units` (contains `Engineer` and `Director`)
   - Calls `OrgUnit2Step(Engineer)` and `OrgUnit2Step(Director)`

4. **For Engineer WorkPosition**, dispatch selects **WorkPosition2Flow**:
   - `Engineer` has `level="regular"`
   - Creates `n=2` approval tasks
   - Returns a `Sequence` (sequential approval flow)

5. **For Director WorkPosition**, dispatch selects **WorkPosition2Flow**:
   - `Director` has `level="VIP"`
   - Creates `n=3` approval tasks
   - Returns a `Parallel` (parallel approval flow)

---

## Advanced Patterns

### Template Functions for Reusability

You can define reusable template functions that generate model fragments:

```tsx
import { Template } from "aelastics-synthesis";

interface IApprovalConfig {
  name: string;
  n: number;
  mode: "parallel" | "sequential";
}

// Reusable template for creating approval processes
export const ApprovalFamily: Template<IProcess> =
  ({ name, n, mode }: IApprovalConfig) => {
    const approvers = Array.from({ length: n }, (_, i) =>
      <Task name={`Approve ${i + 1}`} />
    );
    return (
      <Process name={name}>
        <Sequence name="main">
          <Task name="Write proposal" />
          {mode === "parallel"
            ? <Parallel name="reviews">{approvers}</Parallel>
            : <Sequence name="reviews">{approvers}</Sequence>
          }
        </Sequence>
      </Process>
    );
  };

// Usage
const reviewProcess = ApprovalFamily({ name: "Document Review", n: 3, mode: "parallel" });
const model = reviewProcess.render(new Context());
```

### Higher-Order Templates

Templates can be parameterized by other templates:

```tsx
// Higher-order template: accepts a template as parameter
export const GenericApproval =
  (WorkerTask: Template<ITask>) =>
  ({ name, n, mode }: IApprovalConfig) => {
    const approvers = Array.from({ length: n }, (_, i) =>
      <Task name={`Approve ${i + 1}`} />
    );
    return (
      <Process name={name}>
        <Sequence name="main">
          <WorkerTask name="work item" />
          {mode === "parallel"
            ? <Parallel name="reviews">{approvers}</Parallel>
            : <Sequence name="reviews">{approvers}</Sequence>
          }
        </Sequence>
      </Process>
    );
  };

// Usage with custom worker task
const CustomWorker: Template<ITask> = (props) =>
  <Task {...props} performer="specialist" />;

const process = GenericApproval(CustomWorker)({
  name: "Custom Process",
  n: 2,
  mode: "sequential"
});
```

### Cross-Referencing with ResolveElement

When transforming relationships, use `ResolveElement` to reference elements created by other rules:

```tsx
// Transform associations to foreign keys
Association2ForeignKey(assoc: IAssociation): Element<IForeignKey> {
  return (
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
  );
}
```

---

## Best Practices

### 1. Structure Rules by Source Metamodel Hierarchy

Organize transformation rules to mirror the source metamodel structure:

```tsx
class MyTransformation extends abstractM2M<ISource, ITarget> {
  // Model-level transformation
  template(src: ISourceModel): Element<ITargetModel> { ... }

  // Entity-level transformations
  @SpecPoint()
  Entity2Element(src: IEntity): Element<ITargetElement> { ... }

  @SpecOption('Entity2Element', KernelEntity)
  KernelEntity2Element(src: IKernelEntity): Element<ITargetElement> { ... }

  // Attribute-level transformations
  Attribute2Property(src: IAttribute): Element<IProperty> { ... }
}
```

### 2. Use Descriptive Rule Names

Rule names should clearly indicate the transformation mapping:
- ✅ `Entity2Table`, `Attribute2Column`, `Department2Sequence`
- ❌ `transform1`, `rule2`, `processEntity`

### 3. Always Use @E2E for Rules That Will Be Referenced

If other rules need to look up transformed elements, use `@E2E`:

```tsx
@E2E({ input: Entity, output: Table })
Entity2Table(e: IEntity): Element<ITable> { ... }

// Later, in another rule:
<Resolve input={entity} ruleName="Entity2Table">
  {(table) => /* use table here */}
</Resolve>
```

### 4. Use @SpecPoint for Type Hierarchies

When source metamodel has subtypes with different behaviors:

```tsx
@SpecPoint()
BaseType2Target(src: IBaseType): Element<ITarget> { ... }

@SpecOption('BaseType2Target', SubTypeA)
SubTypeA2Target(src: ISubTypeA): Element<ITarget> { ... }
```

### 5. Handle Optional Properties

Always check for optional properties:

```tsx
Rule(src: ISource): Element<ITarget> {
  return (
    <Target name={src.name}>
      {src.optionalChildren?.map(child => this.ChildRule(child))}
    </Target>
  );
}
```

### 6. Document Complex Transformation Logic

Add comments explaining non-obvious transformation decisions:

```tsx
WorkPosition2Flow(src: IWorkPosition): Element<IStep> {
  // VIP positions require 3 parallel approvals
  // Regular positions require 2 sequential approvals
  const n = src.level === "VIP" ? 3 : 2;
  // ...
}
```

### 7. Test with Different Source Models

Create test cases covering:
- Simple cases: Single elements without nesting
- Complex cases: Deeply nested structures
- Edge cases: Empty collections, optional properties
- Type hierarchy cases: Different subtypes

```tsx
describe("Org2Workflow Transformation", () => {
  it("transforms simple department", () => { ... });
  it("transforms VIP positions with parallel approval", () => { ... });
  it("handles empty departments", () => { ... });
});
```

---

## Summary

The aelastics-synthesis transformation framework enables **declarative Model-to-Model transformations**:

1. **Class-based transformations** extending `abstractM2M`
2. **Template method** as entry point defining overall structure
3. **Transformation rules** as methods using JSX with embedded computations
4. **Automatic tracing** with `@E2E` decorator for provenance and cross-referencing
5. **Rule specialization** using `@SpecPoint` and `@SpecOption` for type hierarchies
6. **Reusable templates** and higher-order templates for composability
7. **Two-phase rendering** enabling declarative, order-independent transformations

By following this guide, you can create maintainable, type-safe transformations that clearly express mappings between metamodels.

---

*Document Version: 2.0*
*Last Updated: 2026-02-27*
