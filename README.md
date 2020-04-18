# AelasticS Types

> Types dynamically created at run time - Alpha version
> - tree and graph data structures 
> - data validation and serialization/deserialization

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
- Lots of built-in standard validations for string and number types
- Custom complex validations and object/data value constrains can be defined
- User defined error message specifications for violated constrains
- Extensive error reports collected during data validations

#### Serialization/Deserialization
- Transformation to/from Data Transfer Objects (tree data structures) which can be directly used by JSON.stringify and JSON.parse functions
- Graph cyclic data structures are supported as an out-of-the-box feature
- Support for types not supported by JSON stringify and parse functions: maps, unions, date type, object references, etc.

#### Structure Traversal/Processing
- Input data structure is traversed in a depth-first manner and user supplied function is invoked exactly once at each element of the input 

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

