

## 4.1 Implementation

The approach presented in this section is based on the AelasticS framework, which uses a functional paradigm for model-driven engineering and is implemented in the standard programming language TypeScript. AelasticS provides a flexible and extensible foundation for model representation and transformation, leveraging TypeScript and JSX to represent, compose, and transform models as first-class functions. In contrast to traditional graph-based or imperative transformation languages, models in AelasticS are constructed as hierarchical compositions of element-creation functions, with JSX syntax serving as a declarative layer for both model definition and transformation logic.


A detailed explanation of the AelasticS framework and its full capabilities is beyond the scope of this paper.

### Functional Model Representation with JSX

Models are defined as trees of composable functions, where each domain concept (e.g., Entity, Attribute, Table, Column) is mapped to a corresponding JSX component. This approach enables models to be expressed as nested JSX markup, which is compiled to function calls that instantiate model elements and their relationships. For example, an entity-relationship (ER) schema is represented as:

```typescript
const eerSchema: ExprNode<IEERSchema> = (
    <EERSchema name="Persons">
        <Kernel name="Person">
            <Attribute name="PersonName">
                <Domain name="string" />
            </Attribute>
        </Kernel>
        <Weak name="Child">
            <Attribute name="ChildID">
                <Domain name="number" />
            </Attribute>
            <Attribute name="ChildName">
                <Domain name="string" />
            </Attribute>
        </Weak>
    </EERSchema>
);
```

This functional representation supports parameterization and template-based model construction, allowing reusable fragments and higher-order templates to be defined and instantiated dynamically.

### Model Templates and Embedded TypeScript in JSX

Model templates in AelasticS leverage the expressive power of TypeScript embedded within JSX markup. Templates are defined as parameterized functions or components, allowing developers to generate families of models or model fragments by passing arguments and embedding logic directly in JSX. This approach enables dynamic model generation, supports higher-order templates, and facilitates reuse of modeling patterns.

For example, a template for a generic document pattern can be defined as a function that takes the document name as a parameter and returns a JSX model structure:

```typescript
function DocumentPattern(documentName: string): ExprNode<IEERSchema> {
  return (
    <EERSchema name={`${documentName}-Schema`}>
      <Kernel name={documentName}>
        <Attribute name={documentName}>
          <Domain name="string" />
        </Attribute>
        <Attribute name={`${documentName}ID`}>
          <Domain name="string" />
        </Attribute>
        <Weak name={`${documentName}Item`}>
          <Attribute name={`${documentName}ItemID`}>
            <Domain name="string" />
          </Attribute>
          <Attribute name={`${documentName}ItemDescription`}>
            <Domain name="string" />
          </Attribute>
        </Weak>
      </Kernel>
    </EERSchema>
  );
}
```

Instantiating the template for a specific document type:

```typescript
const invoiceFeed = DocumentPattern("Invoice");

```

This invocation produces the following ERM schema in JSX form:

```typescript
<EERSchema name="Invoice-Schema">
  <Kernel name="Invoice">
    <Attribute name="Invoice">
      <Domain name="string" />
    </Attribute>
    <Attribute name="InvoiceID">
      <Domain name="string" />
    </Attribute>
    <Weak name="InvoiceItem">
      <Attribute name="InvoiceItemID">
        <Domain name="string" />
      </Attribute>
      <Attribute name="InvoiceItemDescription">
        <Domain name="string" />
      </Attribute>
    </Weak>
  </Kernel>
</EERSchema>
```

Templates can also accept other templates or model fragments as parameters, enabling composition and customization. TypeScript logic—such as loops, conditionals, and data manipulation—can be seamlessly embedded within JSX, making model construction both flexible and expressive. This pattern is analogous to how React components use embedded JavaScript to generate dynamic user interfaces, but here it is applied to model generation and transformation.

Importantly, AelasticS also supports higher-order model templates. These are templates that can accept other templates as arguments, return new templates, or generate families of related model fragments. Higher-order templates enable advanced composition, reuse, and abstraction, allowing developers to encode complex modeling patterns and transformation strategies as parameterized functions. For example, a generic list template could accept an item template as a parameter, or a workflow template could generate specialized process templates based on input parameters. This capability makes the modeling framework highly extensible and adaptable to a wide range of domains and requirements.

By embedding TypeScript code in JSX, AelasticS supports:
- Parameterized and reusable model templates
- Dynamic generation of model structures
- Composition of templates and fragments
- Expression of design patterns and transformation strategies as code

This technique provides a powerful mechanism for managing variability, automating repetitive modeling tasks, and formalizing model construction in a way that is both developer-friendly and mathematically rigorous.

### Transformation Templates and Rule Specialization

Model transformations in AelasticS are implemented as classes that extend a predefined abstract transformation base. This base class provides the core infrastructure for managing transformation context, rule dispatch, and traceability. Transformation classes define a set of transformation rules, each expressed as a method that returns a JSX fragment representing the target model element or structure. These methods are decorated with metadata (e.g., `@M2M`, `@E2E`, `@SpecPoint`, `@SpecOption`, `@VarPoint`, `@VarOption`) to specify their role, specialization, and variability within the transformation hierarchy. The use of abstract classes enables developers to define generic transformation logic and structure, while allowing concrete subclasses to implement specific rule variants and alternatives. Abstract rules correspond to design issues or variability points, and concrete rule variants implement specific design alternatives or specializations, supporting both polymorphism and explicit configuration of transformation behavior.

#### Transformation Decorators in AelasticS

- `@M2M`: Marks a class as a model-to-model transformation, specifying the source and target model types. This decorator is used at the class level to indicate the transformation context.
- `@E2E`: Marks a method as an element-to-element transformation, specifying the source and target element types. These methods define how individual elements from the source model are mapped to elements in the target model.
- `@SpecPoint` and `@SpecOption`: Used to define specialization points in transformation logic. `@SpecPoint` marks an abstract rule that can have multiple specialized implementations, while `@SpecOption` marks a concrete specialization for a particular type or condition. This enables polymorphic behavior, allowing different transformation logic to be applied based on the input type or context.
- `@VarPoint` and `@VarOption`: Used to define variability points in the transformation. `@VarPoint` marks an abstract rule that corresponds to a design issue or decision point in the design space model, while `@VarOption` marks a concrete variant or alternative for that variability point. This mechanism supports explicit modeling of design decisions and enables the transformation to be configured with different alternatives at runtime.

For example, a variable point in a transformation might be defined as:

```typescript
@VarPoint('RelationshipMapping')
RelationshipMapping(rel: et.IRelationship): ExprNode<rt.IRelSchema> {
  // abstract rule for relationship mapping
}


RelationshipAsForeignKey(rel: et.IRelationship): ExprNode<rt.IRelSchema> {
  // concrete variant: map relationship as foreign key
}

@VarOption('RelationshipMapping', 'JoinTable')
RelationshipAsJoinTable(rel: et.IRelationship): ExprNode<rt.IRelSchema> {

  // concrete variant: map relationship as join table
}
```

In the `@VarOption` decorator, the first argument is the name of the abstract rule (design issue) that this concrete rule provides an alternative for. The second argument specifies the selected alternative (design solution) for the given design issue. This allows the transformation engine to select the appropriate rule variant based on the configuration of design decisions in the Design Configuration Model (DCM).


The fundamental difference between specialization points and variable points is that variable points are tied to the Design Configuration Model (DCM), allowing transformation behavior to be configured based on explicit design decisions. In contrast, specialization points depend purely on conditions related to the input model elements, enabling polymorphic behavior based on the structure or type of the source model. While both mechanisms support alternative transformation logic, variable points are driven by external configuration, whereas specialization points are determined by the intrinsic properties of the input elements.

This approach enables explicit separation of design issues (abstract rules) and their alternatives (concrete variants), supporting flexible, configurable, and traceable model transformations.

For instance, the transformation from ER entities to relational tables is defined as:

```typescript
@E2E()
@SpecPoint()
Entity2Table(e: et.IEntity): ExprNode<rt.ITable> {
    return (
        <r.Table name={e.name}>
            {e.attributes.map((a) => this.Attribute2Column(a))}
        </r.Table>
    );
}
```

Specialized variants, such as `Kernel2Table` and `Week2Table`, override or extend the base rule to implement alternative mapping strategies, supporting polymorphism and variability in transformation logic.

### Execution and Traceability

Transformation execution is orchestrated by the transformation engine, which traverses the source model and applies the appropriate rule variants according to the configured design decisions. The use of JSX enables both full model generation and incremental updates, while transformation traces are automatically recorded to maintain provenance and support debugging.

### Benefits and Extensibility

This functional, JSX-based approach offers several advantages:

- **Declarative and composable syntax:** Models and transformations are readable, maintainable, and modular.
- **Type safety:** TypeScript integration ensures correctness and supports IDE tooling.
- **Template-based variability:** Transformation rules can be specialized and parameterized, enabling explicit management of design decisions.
- **Traceability:** Transformation traces link source elements, applied rules, and resulting target elements, supporting transparency and auditability.

By treating models and transformations as composable functions and templates, our implementation aligns with the principles of functional programming and model-driven engineering, providing a flexible, extensible, and formally grounded foundation for rule-based model transformations.


