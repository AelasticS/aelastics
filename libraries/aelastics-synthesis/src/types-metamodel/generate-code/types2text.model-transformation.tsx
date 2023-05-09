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
  private mappedTypes: Set<string>;

  constructor(store: ModelStore) {
    super(store);
    this.mappedTypes = new Set<string>();
  }

  template(m: tmm.ITypeModel) {
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
        {m.types.map((e) => this.transformType(e as tmm.IType))}
      </M2T>
    );
  }

  initialImpors(m: tmm.ITypeModel) {
    return (
      <Sec $refByName="imports">
        <P>import * as t from "aelastics-types";</P>
        <P>{`import { Model, ModelElement } from "generic-metamodel";`}</P>
      </Sec>
    );
  }

  transformToModel(m: tmm.ITypeModel) {
    return (
      <Sec $refByName="typeDefinition">
        <P>{`export const ${m.name}_Schema = t.schema("${m.name}_Schema");`}</P>
        <P>{`export const ${m.name}_Model = t.subtype(Model, {}, "${m.name}_Model", ${m.name}_Schema);`}</P>
        <P></P>
      </Sec>
    );
  }

  @E2E({
    input: tmm.Type,
    output: m2tmm.M2T_Item,
  })
  transformType(
    t: tmm.IType
  ): [Element<m2tmm.ISection>, Element<m2tmm.IParagraph>] {
    if (this.mappedTypes.has(t.id)) {
      return <Sec></Sec>;
    }

    if (this.context.store.isTypeOf(t, tmm.SimpleType)) {
      return <Sec></Sec>;
    }

    this.mappedTypes.add(t.id);

    const typeOfElement = this.context.store.getTypeOf(t);

    let typeDefinitionSection: Element<m2tmm.ISection> =
      {} as Element<m2tmm.ISection>;
    switch (typeOfElement.name) {
      case tmm.Object.name:
      case tmm.Subtype.name:
        typeDefinitionSection = this.transformObject(t as tmm.IObject);
        break;
      case tmm.Array.name:
        // TODO add transformArray
        break;
      case tmm.Optional.name:
        // TODO add transformOptional
        break;
      case tmm.Union.name:
        // TODO Add transformUnion
        break;
    }

    return (
      // <Doc $refByName={t.parentModel.name + "_textModel.ts"}>
      [
        typeDefinitionSection,
        <P parentSection={<Sec $refByName="typeExports"></Sec>}>
          {`export type I${t.name} = t.TypeOf<typeof ${t.name}>;`}
        </P>,
      ]
      // </Doc>
    );
  }

  @SpecPoint()
  @E2E({
    input: tmm.Object,
    output: m2tmm.M2T_Item,
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
  @E2E({
    input: tmm.Object,
    output: m2tmm.M2T_Item,
  })
  public transformObj(t: tmm.IObject): Element<m2tmm.IM2T_Item> {
    return (
      <Sec>
        <Sec $refByName={t.name + "_type_export_sec"}>
          <P>{`export const ${t.name} = t.subtype(ModelElement,`}</P>
        </Sec>
      </Sec>
    );
  }

  @SpecOption("transformObject", tmm.Subtype)
  @E2E({
    input: tmm.Object,
    output: m2tmm.M2T_Item,
  })
  transformSubtype(t: tmm.ISubtype): Element<m2tmm.IM2T_Item> {
    let superType = null;
    if (!this.mappedTypes.has(t.superType.id)) {
      superType = this.transformType(t.superType);
    }

    return (
      <Sec>
        {superType}
        <Sec $refByName={t.name + "_type_export_sec"}>
          <P>{`export const ${t.name} = t.subtype(${t.superType.name},`}</P>
        </Sec>
      </Sec>
    );
  }

  // @SpecOption("transformType", tmm.Array)
  // transformArray(t: tmm.IArray): Element<m2tmm.IM2T_Item> {
  //   return <Sec $refByName="typeDefinition"></Sec>;
  // }

  // @SpecOption("transformType", tmm.Optional)
  // transformOptional(t: tmm.IOptional): Element<m2tmm.IM2T_Item> {
  //   return <Sec $refByName="typeDefinition"></Sec>;
  // }

  // @SpecOption("transformType", tmm.Union)
  // transformUnion(t: tmm.IUnion): Element<m2tmm.IM2T_Item> {
  //   return <Sec $refByName="typeDefinition"></Sec>;
  // }

  @E2E({
    input: tmm.Object,
    output: m2tmm.M2T_Item,
  })
  transformProperty(t: tmm.IProperty): Element<m2tmm.IParagraph> {
    // let domainType = null;
    // if (!this.mappedTypes.has(t.domain.id)) {
    //   domainType = this.transformType(t.domain);
    // }

    return (
      <Sec>
        {/* {domainType} */}
        <P>{`${t.name}_prop: ${t.domain?.name},`}</P>
      </Sec>
    );
  }
}
