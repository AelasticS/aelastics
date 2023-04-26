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
  constructor(store: ModelStore) {
    super(store);
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
        {m.elements.map((e) => this.transformType(e as tmm.IType))}
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

  @SpecPoint()
  transformType(t: tmm.IType): Element<m2tmm.IM2T_Item> {
    return (
      <Doc $refByName={t.parentModel.name + "_textModel.ts"}>
        <Sec $refByName="typeExports">
          <P>{`export type I${t.name} = t.TypeOf<typeof ${t.name}>;`}</P>
        </Sec>
      </Doc>
    );
  }

  @SpecOption("transformType", tmm.Object)
  transformObject(t: tmm.IObject): Element<m2tmm.IM2T_Item> {
    return (
      <Doc $refByName={t.parentModel.name + "_textModel.ts"}>
        <Sec $refByName="typeDefinition">
          <P>
            {`export const ${t.name} = t.subtype(
      ModelElement,
      {},
      "${t.name}",
      ${t.parentModel.name}_Schema  
      );        
      `}
          </P>
        </Sec>
      </Doc>
    );
  }

  // @SpecOption("transformType", tmm.Array)
  // transformArray(t: tmm.IArray): Element<m2tmm.IM2T_Item> {
  //   return <Sec $refByName="typeDefinition"></Sec>;
  // }

  @SpecOption("transformType", tmm.Subtype)
  transformSubtype(t: tmm.ISubtype): Element<m2tmm.IM2T_Item> {
    return (
      <Doc $refByName={t.parentModel.name + "_textModel.ts"}>
        <Sec $refByName="typeDefinition">
          <P>
            {`export const ${t.name} = t.subtype(
      ${t.superType.name},
      {},
      "${t.name}",
      ${t.parentModel.name}_Schema  
      );        
      `}
          </P>
        </Sec>
      </Doc>
    );
  }

  // @SpecOption("transformType", tmm.Optional)
  // transformOptional(t: tmm.IOptional): Element<m2tmm.IM2T_Item> {
  //   return <Sec $refByName="typeDefinition"></Sec>;
  // }

  // @SpecOption("transformType", tmm.Union)
  // transformUnion(t: tmm.IUnion): Element<m2tmm.IM2T_Item> {
  //   return <Sec $refByName="typeDefinition"></Sec>;
  // }

  // transformProperty(t: tmm.IProperty): Element<m2tmm.IM2T_Item> {
  //   return <Sec $refByName="typeDefinition"></Sec>;
  // }
}
