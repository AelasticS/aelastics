# Aelastics  Monorepo


Aelastics is a functional TypeScript framework  designed to facilitate various data processing with a focus on dynamic types (defined at runtime) along with corresponding metadata. This framework comprises three main packages:

1. **aelastics-schemas**: This package provides functionality for defining dynamic types, including both simple and complex structures such as objects and collections. It allows for the description of data structures, meta annotations, and traversal algorithms over these defined schemas. Additionally, it supports the handling of concrete data structures based on these schemas.

2. **aelastics-store**: The immutable stores package offers tools for implementing immutable application states. Immutability is crucial for ensuring predictable state management and facilitating easier debugging and reasoning about application behavior.

3. **aelastics/synthesis**: This is a domain-specific language (DSL), implemented as TypeScript package, which facilitates flexible data structure transformations based on rules. By leveraging this DSL, developers can express transformation logic concisely and efficiently, enabling them to manipulate data structures according to specific requirements or business rules.

Overall, this TypeScript framework provides a comprehensive suite of tools and utilities for managing dynamic data types, immutable application states, and flexible data transformations, thereby enhancing the robustness and maintainability of data processing applications.