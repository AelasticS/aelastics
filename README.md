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
- Graph cyclic data structures are transformed to/from Data Transfer Objects (JSON tree data structures)
- Inheritance (subtyping) supported
- Graph cyclic data structures are supported as an out-of-the-box feature
- No decorators/annotations are needed
- Support for types not supported by JSON such as maps, unions, dates, object references, etc.

#### Structure Traversal/Processing
- Traversal of graph cyclic structures in a depth-first manner
- A user supplied function is invoked exactly once at each element of the input with a rich meta information about the element's role and position in the structure (e.g. an array element on a specific index position)
- 
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

