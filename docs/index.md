# AelasticS Framework

AelasticS is a functional TypeScript framework for type-safe data modeling, state management, and model transformation.

## Overview

The framework is organized as a Rush.js monorepo with the following core libraries:

| Library | Description |
|---------|-------------|
| [aelastics-result](libraries/aelastics-result) | Base Result/error type |
| [aelastics-types](libraries/aelastics-types) | Dynamic type system — objects, entities, arrays, unions, refs |
| [aelastics-store](libraries/aelastics-store) | Immutable graph/state management (MobX-based) |
| [generic-metamodel](libraries/generic-metamodel) | Reusable metamodel elements |
| [aelastics-synthesis](libraries/aelastics-synthesis) | M2M and M2T transformation DSL |
| [aelastics-gjsx](libraries/aelastics-gjsx) | JSX-based generic component layer |

## Quick Start

```bash
npm install -g @microsoft/rush
git clone https://github.com/AelasticS/aelastics.git
cd aelastics
rush update
rush build
```

## Key Concepts

### Type-Safe Data Modeling — `aelastics-types`

Define dynamic data types at runtime with full validation and serialization support:

```typescript
import * as t from "aelastics-types"

const FileSchema = t.schema("FileSchema")

const Item = t.object(
  { name: t.string, parentDirectory: t.optional(t.link(FileSchema, "Directory")) },
  "Item",
  FileSchema
)

const File = t.subtype(Item, { fileType: t.string }, "File", FileSchema)
const Directory = t.subtype(Item, { items: t.arrayOf(Item, "Items") }, "Directory", FileSchema)

type IFile = t.TypeOf<typeof File>
```

### Immutable State Management — `aelastics-store`

Decompose object graphs into interconnected immutable trees using MobX observables.

### Model Transformations — `aelastics-synthesis`

A DSL for expressing model-to-model (M2M) and model-to-text (M2T) transformations. Transformations are defined as classes extending `abstractM2M`, with a `template()` method that returns JSX:

```tsx
/** @jsx createExprNode */
import { createExprNode } from "aelastics-synthesis"
import { abstractM2M, M2M, E2E } from "aelastics-synthesis"

@M2M()
class Org2WorkflowTransformation extends abstractM2M<IOrganization, IWorkflowModel> {
  template(source: IOrganization) {
    return (
      <WorkflowModel name="Approval">
        <Process name={`ApprovalFor${source.name}`}>
          <Sequence name="ApprovalSequence">
            <Task name="WriteDocument" performer={source.name} />
          </Sequence>
        </Process>
      </WorkflowModel>
    )
  }
}

// Usage:
const result = new Org2WorkflowTransformation(store).transform(orgModel)
```

## License

[MIT](https://github.com/AelasticS/aelastics/blob/master/LICENSE)
