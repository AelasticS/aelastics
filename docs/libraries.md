---
title: Libraries
---

# Libraries

## Dependency Order

```
aelastics-result
    ↓
aelastics-types
    ↓
├── aelastics-store
└── generic-metamodel
        ↓
    aelastics-synthesis
        ↓
    aelastics-gjsx
```

## aelastics-result

Base `Result<T, E>` type for functional error handling — no exceptions, explicit failure paths.

## aelastics-types

The foundational type definition layer. Supports:
- Simple types: `string`, `number`, `boolean`, `date`
- Composite types: `object`, `entity`, `array`, `map`, `set`, `union`, `intersection`
- Constraints and validation
- Annotations / metadata
- Generic traversal algorithms
- Serialization

## aelastics-store

Immutable graph/state management built on MobX. Decomposes object graphs into interconnected trees for predictable state management.

## generic-metamodel

Reusable metamodel components (named elements, typed elements) consumed by synthesis transformations.

## aelastics-synthesis

A transformation DSL. Transformations extend `abstractM2M<Source, Target>` and implement a `template()` method using JSX. Decorators control behavior:

- `@M2M()` — marks a class as a model-to-model transformation
- `@E2E()` — marks a method as an element-to-element rule
- `@SpecPoint()` / `@SpecOption()` — variability points with multiple implementations
- M2T transformations use `M2T`, `Doc`, `Sec`, `P` components to produce text output

## aelastics-gjsx

JSX-based generic component layer built on top of aelastics-synthesis.

## aelastics-observables

Independent observable utilities library.

## dyna-modules

Independent dynamic module system.
