# AelasticS Types

> Types dynamically created at run time 
> - tree and graph data structures 
> - data validation and serialization

## Highlights

#### Types 

- Simple types (number, string, boolean, literal and user defined semantic domains/types)
- Chainable operators for user defined simple types
- Complex types (object types, subtypes, array, map, date type, union, tagged union, intersection)
- Special types (optional, object reference, link)
- Type schemas as containers of type definitions to manage complexity
- Special meta-type operators to deduce interface declarations used at compile time 
- Intellisence in code editors and typechecking in compile time, similar to React prop-types library


#### Validation
- Lots of built-in validations
- Custom complex validations and object/data value constrains
- User defined error message specifications
- Extensive error reports collected during data validations

#### Serialization
- Serialization/deserialization to/from Data Transfer Objects 
- Support for date type, map, union, object references
- Optional automatic object ID generation (version 1.1)
- Graph data structures are serialized/deserialized using generated object IDs (version 1.1) 

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

