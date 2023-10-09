/** @jsx hm */
import { hm } from "./../../jsx/handle";
import {
  M2T,
  Dir,
  Doc,
  P,
  Sec,
  SecParent,
} from "./../../m2t/m2t-model/m2t.jsx";
import * as m2tmm from "./../../m2t/m2t-model/m2t.meta.model";
import * as tmm from "./../types-meta.model";
import { ModelStore, Context, Element, E2E, M2M } from "./../../index";
import { abstractM2M } from "./../../transformations/abstractM2M";
import { SpecPoint, SpecOption } from "./../../transformations/spec-decorators";

@M2M({
  input: tmm.TypeModel,
  output: m2tmm.M2T_Model,
})
export class Types2TextModelTransformations extends abstractM2M<
  tmm.ITypeModel,
  m2tmm.M2T_Model
> {
  constructor(store: ModelStore) {
    super(store);
  }

  sortTypes(m: tmm.ITypeModel): Array<tmm.IType> {
    let sortedTypes: Array<tmm.IType> = [] as Array<tmm.IType>;

    // create array with type dependencies
    let types = m.types.map((e) => {
      if (this.context.store.isTypeOf(e, tmm.Subtype)) {
        return { type: e, dependecy: (e as tmm.ISubtype).superType };
      }

      return { type: e, dependecy: null };
    });

    let typeTransformed = true;

    while (types.length > 0 && typeTransformed) {
      typeTransformed = false;

      types.forEach((e, i) => {
        if (
          e.dependecy &&
          types.find((element) => {
            let a = element.type.name == e.dependecy?.name;
            return a;
          })
        ) {
          return;
        }

        types.splice(i, 1);
        sortedTypes.push(e.type);
        typeTransformed = true;
      });
    }

    if (types.length > 0) {
      throw new Error("There are a circular dependencies!");
    }

    return sortedTypes;
  }

  template(m: tmm.ITypeModel) {
    let types = this.sortTypes(m);

    return (
      <M2T name={m.name + "_textModel"}>
        <Doc name={m.name + "_textModel.ts"}>
          <Sec name="imports"></Sec>
          <Sec name="typeDefinition"></Sec>
          <P>// Exports type</P>
          <Sec name="typeExports"></Sec>
        </Doc>
        {this.initialImpors(m)}
        {this.transformToModel(m)}
        {types.map((e) => this.transformType(e as tmm.IType))}
      </M2T>
    );
  }

  initialImpors(m: tmm.ITypeModel): Array<Element<m2tmm.IParagraph>> {
    return [
      <P parentSection={<Sec $refByName="imports"></Sec>}>
        import * as t from "aelastics-types";
      </P>,
      <P parentSection={<Sec $refByName="imports"></Sec>}>
        {`import { Model, ModelElement } from "generic-metamodel";`}
      </P>,
    ];
  }

  transformToModel(m: tmm.ITypeModel): Array<Element<m2tmm.IParagraph>> | null {
    return [
      <P parentSection={<Sec $refByName="typeDefinition"></Sec>}>
        {`export const ${m.name}_Schema = t.schema("${m.name}_Schema");`}
      </P>,
      <P parentSection={<Sec $refByName="typeDefinition"></Sec>}>
        {`export const ${m.name}_Model = t.subtype(Model, {}, "${m.name}_Model", ${m.name}_Schema);`}
      </P>,
      <P parentSection={<Sec $refByName="typeDefinition"></Sec>}></P>,
    ];
  }

  @E2E({
    input: tmm.Type,
    output: m2tmm.M2T_Item,
  })
  transformType(
    t: tmm.IType
  ): [Element<m2tmm.ISection>, Element<m2tmm.IParagraph>] | null {
    if (this.context.resolve(t)) {
      return null;
    }

    if (this.context.store.isTypeOf(t, tmm.SimpleType)) {
      // TODO How to map simple types
      this.context.makeTrace(t, undefined);

      return null;
    }

    const typeOfElement = this.context.store.getTypeOf(t);

    let typeDefinitionSection: Element<m2tmm.ISection> | null =
      {} as Element<m2tmm.ISection>;
    switch (typeOfElement.name) {
      case tmm.Object.name:
      case tmm.Subtype.name:
        typeDefinitionSection = this.transformObject(t as tmm.IObject);
        break;
      default:
        // other types are not entites
        return null;
    }

    return [
      typeDefinitionSection,
      <P parentSection={<Sec $refByName="typeExports"></Sec>}>
        {`export type I${t.name} = t.TypeOf<typeof ${t.name}>;`}
      </P>,
    ];
  }

  @SpecPoint()
  @E2E({
    input: tmm.Object,
    output: m2tmm.Section,
  })
  transformObject(t: tmm.IObject): Element<m2tmm.ISection> {
    return (
      <Sec name={t.name + "_type_sec"}>
        <SecParent $refByName="typeDefinition"></SecParent>
        <Sec name={t.name + "_type_export_sec"}></Sec>
        <Sec name={t.name + "_attr_sec"}>
          <P>{`{`}</P>
          {t.properties?.map((prop) =>
            this.transformProperty(prop as tmm.IProperty)
          )}
          <P>{`},`}</P>
        </Sec>
        <P>{`"${t.name}", ${t.parentModel.name}_Schema);`}</P>
        <P></P>
      </Sec>
    );
  }

  @SpecOption("transformObject", tmm.Object)
  public transformObj(t: tmm.IObject): Element<m2tmm.ISection> {
    return (
      <Sec>
        <Sec $refByName={t.name + "_type_export_sec"}>
          <P>{`export const ${t.name} = t.subtype(ModelElement,`}</P>
        </Sec>
      </Sec>
    );
  }

  @SpecOption("transformObject", tmm.Subtype)
  transformSubtype(t: tmm.ISubtype): Element<m2tmm.ISection> {
    return (
      <Sec name={t.name + "_type_sec"}>
        <Sec $refByName={t.name + "_type_export_sec"}>
          <P>{`export const ${t.name} = t.subtype(${t.superType.name},`}</P>
        </Sec>
      </Sec>
    );
  }

  @E2E({
    input: tmm.Object,
    output: m2tmm.M2T_Item,
  })
  transformProperty(p: tmm.IProperty): Element<m2tmm.IParagraph> {
    const domainText: string = this.context.store.isTypeOf(
      p.domain,
      tmm.SimpleType
    )
      ? `t.${p.domain?.name}`
      : this.handleComplexType(p.domain);

    return <P>{`${p.name}_prop: ${domainText},`}</P>;
  }

  handleComplexType(t: tmm.IType): string {
    const typeOfElement = this.context.store.getTypeOf(t);

    switch (typeOfElement.name) {
      case tmm.Optional.name:
        return this.returnTypeForOptionalType(t as tmm.IOptional);
      case tmm.Array.name:
        return this.returnTypeForArrayType(t as tmm.IArray);
      case tmm.Union.name:
        // TODO Add transformUnion
        return ``;
      default:
        if (!this.context.resolve(t)) {
          return `t.link(${t.parentModel.name}_Schema, '${t.name}')`;
        }

        return `${t.name}`;
    }
  }

  returnTypeForOptionalType(t: tmm.IOptional): string {
    let type = this.handleComplexType(t.optionalType);

    return `t.optional(${type})`;
  }

  returnTypeForArrayType(t: tmm.IArray): string {
    let type = this.handleComplexType(t.elementType);

    return `t.arrayOf(${type})`;
  }

  // @SpecOption("transformType", tmm.Union)
  // transformUnion(t: tmm.IUnion): Element<m2tmm.IM2T_Item> {
  //   return <Sec $refByName="typeDefinition"></Sec>;
  // }
}
