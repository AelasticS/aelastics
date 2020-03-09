# AelasticS Types

> Types dynamically created at run time 
> - tree and graph data structures 
> - data validation and serialization

## Highlights

#### Types 

- Simple types (number, string, boolean, literal)
- Complex types (object types, subtypes, array, map, date type, union, tagged union, intersection)
- Special types (optional, object reference, link)
- Type schemas (subschemas) as containers of type definitions
- Special type operators for interface declarations  
- Support for Intellisence/typechecking in code editors similar to React prop-types library


#### Validation
- Lots of built-in validations
- Supports custom complex validations
- Chainable API
- Extensive error reports

#### Serialization
- Conversion into/from Data Transfer Objects
- Support for date type, map, unions, object references
- Optional automatic object ID generation
- Graph data structures are supported via generated object IDs 

## Example

```ts
import * as t from "aelastics-types";

export const AgeType = t.number.derive('Human age').int8.positive.inRange(1, 120);

export const WorkerType = t.object({
    name: t.string,
    age: t.optional(AgeType),
    sex: t.unionOf([t.literal('male'), t.literal("female")],"sexType"),
    birthPlace:  t.object({name: t.string, state: t.string}),
    children: t.listOf(t.object({name: t.string}, "Child"))
}, 'WorkerType');
```

##Introduction

## Simple types

## Complex types

## Special types

## Type schemas

## Static typechecking 

## Conversion and serialization
