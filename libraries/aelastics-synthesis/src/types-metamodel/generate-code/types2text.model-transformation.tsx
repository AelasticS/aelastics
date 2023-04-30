/** @jsx hm */
import { hm } from "./../../jsx/handle";
import { M2T, Dir, Doc, P, Sec } from "./../../m2t/m2t-model/m2t.jsx";
import * as m2tmm from "./../../m2t/m2t-model/m2t.meta.model";
import * as tmm from "./../types-meta.model";
import { ModelStore, Context, Element } from "./../../index";
import { abstractM2M } from "./../../transformations/abstractM2M";
import { SpecPoint, SpecOption } from "./../../transformations/spec-decorators";

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

  transformType(t: tmm.IType): Element<m2tmm.IM2T_Item> {
    if (this.mappedTypes.has(t.id)) {
      return <Sec></Sec>;
    }

    this.mappedTypes.add(t.id);

    const typeOfElement = this.context.store.getTypeOf(t);

    let typeDefinitionSection = null;
    switch (typeOfElement.name) {
      case tmm.Object.name:
      case tmm.Subtype.name:
        typeDefinitionSection = this.transformObject(t as tmm.IObject);
      // TODO add other types
    }

    return (
      <Doc $refByName={t.parentModel.name + "_textModel.ts"}>
        {/* <Sec> */}
        <Sec $refByName="typeExports">
          <P>{`export type I${t.name} = t.TypeOf<typeof ${t.name}>;`}</P>
        </Sec>
        <Sec $refByName="typeDefinition">{typeDefinitionSection}</Sec>
        {/* </Sec> */}
      </Doc>
    );
  }

  @SpecPoint()
  transformObject(t: tmm.IObject): Element<m2tmm.IM2T_Item> {
    return (
      <Sec name={t.name + "_type_sec"}>
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

  transformProperty(t: tmm.IProperty): Element<m2tmm.IParagraph> {
    return <P>{t.name + "_prop"}</P>;
  }
}
