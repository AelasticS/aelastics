/** @jsx hm */
import { E2E, Element, M2M, ModelStore } from "./../../index";
import { hm } from "./../../jsx/handle";
import {
  Doc,
  M2T,
  P,
  Sec,
  SecParent
} from "./../../m2t/m2t-model/m2t.jsx";
import * as m2tmm from "./../../m2t/m2t-model/m2t.meta.model";
import { abstractM2M } from "./../../transformations/abstractM2M";
import { SpecOption, SpecPoint } from "./../../transformations/spec-decorators";
import * as tmm from "./../types-meta.model";


export class Types2TextModelTransformations extends abstractM2M<
  tmm.ITypeModel,
  m2tmm.M2T_Model
> {
  constructor(store: ModelStore) {
    super(store);
  }

  sortTypes(m: tmm.ITypeModel): Array<tmm.IType> {
    let sortedTypes: Array<tmm.IType> = [] as Array<tmm.IType>;

    let types = m.elements.filter((e) => {
      return this.context.store.isTypeOf(e, tmm.Type)
    }
    ) as Array<tmm.IType>;

    // create array with type dependencies
    let depTypes = types.map((e) => {
      if (this.context.store.isTypeOf(e, tmm.Subtype)) {
        return { type: e, dependecy: (e as tmm.ISubtype).superType };
      }

      return { type: e, dependecy: null };
    });



    let typeTransformed = true;

    while (depTypes.length > 0 && typeTransformed) {
      typeTransformed = false;

      depTypes.forEach((e, i) => {
        if (
          e.dependecy &&
          depTypes.find((element) => {
            let a = element.type.name == e.dependecy?.name;
            return a;
          })
        ) {
          return;
        }

        depTypes.splice(i, 1);
        sortedTypes.push(e.type);
        typeTransformed = true;
      });
    }

    if (depTypes.length > 0) {
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

  transformType(
    t: tmm.IType
  ): [Element<m2tmm.ISection>, Element<m2tmm.IParagraph>] | null {

    try {
      if (this.context.resolveJSXElement(t)) {
        return null;
      }
    } catch (error: any) {
      return null;
    }

    if (this.context.store.isTypeOf(t, tmm.SimpleType)) {
      // TODO How to map simple types
      this.context.makeTrace(t, { target: undefined, ruleName: 'transformType' });

      return null;
    }

    const typeOfElement = this.context.store.getTypeOf(t);

    let typeDefinitionSection: Element<m2tmm.ISection> | null =
      {} as Element<m2tmm.ISection>;
    switch (typeOfElement.name) {
      case tmm.Object.name:
      case tmm.Subtype.name:
        typeDefinitionSection = this.transformObject(t as tmm.IObject);
        break
      case tmm.Union.name:
        typeDefinitionSection = this.transformUnion(t as tmm.IUnion);
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

  transformUnion(t: tmm.IUnion): Element<m2tmm.ISection> {
    return (
      <Sec name={t.name + "_type_sec"}>
        <SecParent $refByName="typeDefinition"></SecParent>
        <Sec name={t.name + "_type_export_sec"}>
          <P>{`export const ${t.name} = ` + this.returnTypeForUnion(t)}</P>
        </Sec>
        <P></P>
      </Sec>
    );
  }

  @SpecPoint()
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

  // todo add varibility for object or subtype of ModelElement
  @SpecOption("transformObject", tmm.Object)
  public transformObj(t: tmm.IObject): Element<m2tmm.ISection> {
    return (
      <Sec>
        <Sec $refByName={t.name + "_type_export_sec"}>
          <P>{`export const ${t.name} = t.object(`}</P>
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
        return this.returnOptionalTypeForType(t as tmm.IOptional);
      case tmm.Array.name:
        return this.returnTypeForArrayType(t as tmm.IArray);
      case tmm.Union.name:
        return this.returnTypeForUnion(t as tmm.IUnion);
      default:
        if (!this.context.resolveJSXElement(t)) {
          return `t.link(${t.parentModel.name}_Schema, '${t.name}')`;
        }

        return `${t.name}`;
    }
  }

  returnOptionalTypeForType(t: tmm.IOptional): string {
    let type = this.handleComplexType(t.optionalType);

    return `t.optional(${type})`;
  }

  returnTypeForArrayType(t: tmm.IArray): string {
    let type = this.handleComplexType(t.elementType);

    return `t.arrayOf(${type})`;
  }

  returnTypeForUnion(t: tmm.IUnion): string {
    let types = t.unionTypes.map((e) => `${e.name}: ` + this.handleComplexType(e));
    return `t.taggedUnion({` + types.join(", ") + `}, '${t.descriminator}' , "${t.name}", ${t.parentModel.name}_Schema)`;
  }

  // @SpecOption("transformType", tmm.Union)
  // transformUnion(t: tmm.IUnion): Element<m2tmm.IM2T_Item> {
  //   return <Sec $refByName="typeDefinition"></Sec>;
  // }
}
