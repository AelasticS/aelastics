### Task List

#### Decide about optimization of type definitions

#### Task
- In the original type definitions of aelastics-types in ZOD. There are several types. Which can be. Optimized in our internal structure of registry. One of these is optional. The optional type is  formaly a separate type. However, in our internal registry structure, we can optimize by replacing the optional type with a property of the PropertyMeta interface. Instead of having PropertyMeta point to an optional type, it should point to the type that is made optional, along with an attribute on the property indicating that its value is optional. The another one is. In case of elastic types link type.Links are not essential types. They are just useful for forward referencing. So when you import. A link. could be resolved, i.e. replaced by the name of the  coresponding frward referenced type. LIned type  has to be checked for existence of refrenced type,  Similar to link type. In Zod . There is a lazy type. The purpose of Lazy type is the same like Linqs to enable forward referencing, but the approach is different in the case that. Lazy type is actually a function which. Is evaluating at runtime to the concrete type. Yet. Typish can be optimized easily. Ere is of course  A collection consisting of elements, and. The early definition includes what is the type of array. So theoretically array points to another type. But in our internal structure it is optimized that we instead of having the two types we have 1 type. Instance where we specify both the array and the element of array. The same case is for maps and sets. So the question is. Where this optimizing are done? Since we have to  Export type definitions from elastic types and zod One option is to do this. During export. So that. Internal structure which was created from the export actually . Has already optimized. Types. The other option is that we do not optimize during export, but we do optimization during. Import. Of unoptimized. Types. Internal registry. Storage. In the first case, if you do. Optimization on export. Then our internal structure doesn't have to. Support links lazy and similar types because they will never. Occur. They will be removed during optimization in export. Process. in the second case. We need in our internal type definitions support for this unoptimized types, but actually during import they will be. Eliminated so during runtime of the. Store and registry such types will not actually occur in instances, but. We will have to keep it in the definitions. So what do you think? Which approach is better? To do optimization on export?
  
##### Answer
- Architecture Decision:

	- Export adapters will transform source type systems (aelastic-types, Zod, XML Schema, etc.) to our clean internal format.
    - The registry only handles optimized types—no complex transformation logic.
    - Future extensibility: new type systems just need their own export adapter.

	- This creates a clean separation where:

           - Each type system handles its own optimization during export.
           - The registry only deals with the optimized, clean internal format.
           - It is easy to add new type systems without changing registry code.

#### Resolve Links
- Links are not essential types. They are just useful for forward referencing. So when you import. A link. could be resolved, i.e. replaced by the name of the  coresponding frward referenced type. LIned type  has to be checked for existence of refrenced type, so it could be so this could be part of the import process and. Validation and. A resolution of types.
- create test cases for testing this functionality

#### Resolve Links Optional
  - The optional type is  formaly a separate type. However, in our internal registry structure, we can optimize by replacing the optional type with a property of the PropertyMeta interface. Instead of having PropertyMeta point to an optional type, it should point to the type that is made optional, along with an attribute on the property indicating that its value is optional.
  - create test cases for testing this functionality
  - 
####  Checko function resolveTypeReference

- Use inhertance chain (via extends) ?

#### Extnded ZOD type definitions
- Create transparent Zod wrapper with cyclic structure support
    - put it in a separate package
        - Coud be named @aelasics/extended-zod ?
    - make dependance on Zod package
- add functionality for namspaces
    - existing legacy code which is without namespaces, must be placeed in a default namespace (open how to define it, but namae confilcts must be avoided)
    - this probaly means that new classed should be added in the package
- enable suport for bi-directional relationships with inverse props specified
    - open question hwo excatly to suuport (maybe like aelastics type bia inverse() function, do anaylisys of options)
- 
- enable cyclic reference
    - allow that types (ZOD schemas) can refrence each other circulary
    - 
- provide support for cyclic validation
    - use maps of visited types to prevent infinitive loop?
    - 
- create test cases for testing this functionality
- 
### Convert extended ZOD type definitions
  - Convert extended ZOD type definitions to structuire used by eternal package defined in namespacemetadata.ts, typedefijistion.ts, etc.
  - create a separate package
        - Coud be named @aelastics/zod-convertor ?
        - make dependance on Zod package and extended ZOD?
    - Decide on strategy hwo to do the task
        - analyze (parse) ts files or
        - dynmic import of ts filesa and traverse internal Zod structure to do conversion
    - Optimize usasge of arrayes 
    - Optimize ZOD "and" chaining with arrays in internal strcutyre used by Registry  
    - create test cases for testing this functionality
    - 
### Convert aelastics types type definitions
  - Convert aelastics types type definitions to structure used by eternal package defined in namespacemetadata.ts, typedefijistion.ts, etc.
  - create a separate package
        - Coud be named @aelastics/types-convertor ?
    - make dependance on the package
    - decide on strategy hwo to do the task
        - analyze (parse) ts files or
        - dynamic import of ts files and traverse internal structure to do conversion
    - create test cases for testing this functionality