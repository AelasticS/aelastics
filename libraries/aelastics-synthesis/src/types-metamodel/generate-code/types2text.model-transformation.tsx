/** @jsx hm */
import { E2E, Element, M2M, ModelStore } from "./../../index"
import { hm } from "../../jsx/handle"
import {
  Doc,
  M2T,
  P,
  Sec,
  SecParent,
} from "../../m2t"
import * as m2tmm from "./../../m2t/m2t-model/m2t.meta.model"
import { abstractM2M } from "../../transformations/abstractM2M"
import { SpecOption, SpecPoint } from "../../transformations/spec-decorators"
import * as tmm from "./../types-meta.model"


@M2M({
  input: tmm.TypeModel,
  output: m2tmm.M2T_Model,
})
export class Types2TextModelTransformations extends abstractM2M<
  tmm.ITypeModel,
  m2tmm.M2T_Model
> {
  constructor(store: ModelStore) {
    super(store)
  }

  private manageSortTypes(typeModel: tmm.ITypeModel): Array<tmm.IType> {

    let types = typeModel.elements.filter((e) => {
      return this.context.store.isTypeOf(e, tmm.Type)
    },
    ) as Array<tmm.IType>

    let sortedTypes: Array<tmm.IType> = [] as Array<tmm.IType>

    let { sortedTypes: newSortedTypes, unsortedTypes } = this.sortTypes(types, sortedTypes)
    sortedTypes = newSortedTypes

    while (unsortedTypes.size > 0) {

      const type = this.brakeCircularDependency(unsortedTypes)
      if (type === null) {
        break
      }

      sortedTypes.push(type)

      const unsortedTypesArray: Array<tmm.IType> = new Array<tmm.IType>()

      unsortedTypes.forEach((depsByPriority) => {
        depsByPriority.forEach((arrayOfDeps) => {
          unsortedTypesArray.push(...arrayOfDeps)
        })
      })

      let {
        sortedTypes: newSortedTypes,
        unsortedTypes: newUnsortedTypes,
      } = this.sortTypes(unsortedTypesArray, sortedTypes)

      sortedTypes = newSortedTypes
      unsortedTypes = newUnsortedTypes
    }

    return sortedTypes
  }

  private sortTypes(types: Array<tmm.IType>, sortedTypes: Array<tmm.IType>): {
    sortedTypes: Array<tmm.IType>,
    unsortedTypes: Map<tmm.IType, Map<number, Array<tmm.IType>>>
  } {

    // create array with type dependencies
    const typesWithDependenciesMap: Map<tmm.IType, Map<number, Array<tmm.IType>>> = new Map()

    types.forEach((e) => {
      if (!typesWithDependenciesMap.has(e)) {
        const map = new Map()
        map.set(10, new Array<tmm.IType>()) // low priority
        map.set(20, new Array<tmm.IType>()) // medium priority
        map.set(30, new Array<tmm.IType>()) // high priority
        map.set(40, new Array<tmm.IType>()) // highest priority

        typesWithDependenciesMap.set(e, map)
      }

      if (this.context.store.isTypeOf(e, tmm.Subtype)) {
        typesWithDependenciesMap.get(e)?.get(40)?.push((e as tmm.ISubtype).superType);

        (e as tmm.ISubtype).properties?.forEach((p) => {
          if (p.domain.name == tmm.findBaseType(p.domain).name) typesWithDependenciesMap.get(e)?.get(10)?.push(p.domain)
        })

      } else if (this.context.store.isTypeOf(e, tmm.Object)) {

        (e as tmm.IObject).properties?.forEach((p) => {
          if (p.domain.name == tmm.findBaseType(p.domain).name) typesWithDependenciesMap.get(e)?.get(10)?.push(p.domain)
        })

      } else if (this.context.store.isTypeOf(e, tmm.Union)) {
        (e as tmm.IUnion).unionTypes.forEach((ut) => typesWithDependenciesMap.get(e)?.get(30)?.push(ut))
      } else if (this.context.store.isTypeOf(e, tmm.Optional)) {
        // todo find base type of optional types
        typesWithDependenciesMap.get(e)?.get(20)?.push((e as tmm.IOptional).optionalType)
      } else if (this.context.store.isTypeOf(e, tmm.Array)) {
        // todo find base type of array type
        typesWithDependenciesMap.get(e)?.get(20)?.push((e as tmm.IArray).elementType)
      }
    })

    let typeTransformed = true

    while (typesWithDependenciesMap.size > 0 && typeTransformed) {
      typeTransformed = false

      typesWithDependenciesMap.forEach((depsByPriority, type) => {

        for (const [key, arrayOfDeps] of depsByPriority) {
          if (arrayOfDeps.length === 0) {
            depsByPriority.delete(key)
            continue
          }

          for (let i = 0; i < arrayOfDeps.length; i++) {
            if (sortedTypes.includes(arrayOfDeps[i])) {
              arrayOfDeps.splice(i, 1)
              i--
            }
          }

          if (arrayOfDeps.length === 0) {
            depsByPriority.delete(key)
          }
        }

        if (depsByPriority.size === 0) {
          typesWithDependenciesMap.delete(type)
          sortedTypes.push(type)
          typeTransformed = true
        }
      })
    }

    return { sortedTypes: sortedTypes, unsortedTypes: typesWithDependenciesMap }
  }

  template(m: tmm.ITypeModel) {
    let types = this.manageSortTypes(m)

    return (
      <M2T name={m.name + "_textModel"}>
        <Doc name={m.name + "_textModel.ts"}>
          <Sec name="imports"></Sec>
          <Sec name="typesDefinition"></Sec>
          <P>// Exports type</P>
          <Sec name="typesExport"></Sec>
        </Doc>
        {this.initialImports()}
        {this.createModelSchema(m)}
        {types.map((e) => this.transformType(e as tmm.IType, <Sec $refByName="typesExport"></Sec>))}
      </M2T>
    )
  }

  private initialImports() {
    return (
      <Sec $refByName="imports">
        <P>import * as t from "aelastics-types";</P>
        <P>{`import { Model, ModelElement } from "generic-metamodel";`}</P>
      </Sec>
    )
  }

  private createModelSchema(m: tmm.ITypeModel) {
    return (
      <Sec $refByName="typesDefinition">
        <P>{`export const ${m.name}_Schema = t.schema("${m.name}_Schema");`}</P>
        <P>{`export const ${m.name}_Model = t.subtype(Model, {}, "${m.name}_Model", ${m.name}_Schema);`}</P>
        <P></P>
      </Sec>
    )
  }

  @E2E({
    input: tmm.Type,
    output: m2tmm.Section,
  })
  private transformType(t: tmm.IType, exportTypeSection?: Element<m2tmm.ISection>) {
    try {
      const jsxElement = this.context.resolveJSXElement(t)
      if (this.context.resolveJSXElement(t)) {
        return null
      }
    } catch (error: any) {
      return null
    }

    if (this.context.store.isTypeOf(t, tmm.SimpleType)) {
      // TODO How to map simple types
      this.context.makeTrace(t, { target: undefined, ruleName: "transformType" })

      return null
    }

    const typeOfElement = this.context.store.getTypeOf(t)
    let exportParagraph: Element<m2tmm.IParagraph>

    let typeDefinitionSection: Element<m2tmm.ISection> | null =
      {} as Element<m2tmm.ISection>
    switch (typeOfElement.name) {
      case tmm.Object.name:
      case tmm.Subtype.name:
        typeDefinitionSection = this.transformObject(t as tmm.IObject)
        exportTypeSection?.children.push(<P>{`export type I${t.name} = t.TypeOf<typeof ${t.name}>;`}</P>)
        break
      case tmm.Union.name:
        typeDefinitionSection = this.transformUnion(t as tmm.IUnion)
        exportTypeSection?.children.push(<P>{`export type I${t.name} = t.TypeOf<typeof ${t.name}>;`}</P>)
        break
      case tmm.Optional.name:
        typeDefinitionSection = this.transformOptional(t as tmm.IOptional)
        break
      default:
        // other types are not entities
        return null
    }

    return typeDefinitionSection

  }

  handleComplexType(t: tmm.IType): string {
    const typeOfElement = this.context.store.getTypeOf(t)

    switch (typeOfElement.name) {
      // case tmm.Optional.name:
      //   return this.returnOptionalTypeForType(t as tmm.IOptional);
      case tmm.Array.name:
        return this.returnTypeForArrayType(t as tmm.IArray)
      default:
        if (!this.context.resolveJSXElement(t)) {
          return `t.link(${t.parentModel.name}_Schema, '${t.name}')`
        }

        return `${t.name}`
    }
  }

  private transformUnion(t: tmm.IUnion) {
    let types = t.unionTypes.map((e) => this.transformType(e))
    // let types = t.unionTypes.map((e) => `${e.name}: ` + this.transformType(e));

    return (
      <Sec name={t.name + "_type_sec"}>
        <SecParent $refByName="typesDefinition" />
        <P>{`export const ${t.name} = t.taggedUnion(`}</P>
        <P>{`{`}</P>
        <P>{t.unionTypes.map((e) => `${e.name}: ${e.name}`)}</P>
        <P>{`},`}</P>
        <P>{`'${t.descriminator}', "${t.name}", ${t.parentModel.name}_Schema);`}</P>
        <P />

      </Sec>
    )
  }

  @SpecPoint()
  transformObject(t: tmm.IObject) {
    return (
      <Sec name={t.name + "_type_sec"}>
        <SecParent $refByName="typesDefinition" />
        <Sec name={t.name + "_type_def_sec"} />
        <P>{`{`}</P>
        <Sec name={t.name + "_attr_sec"}>
          {t.properties?.map((prop) => this.transformProperty(prop as tmm.IProperty))}
        </Sec>
        <P>{`},`}</P>
        <P>{`"${t.name}", ${t.parentModel.name}_Schema);`}</P>
        <P></P>
        <P>{`export type I${t.name} = t.TypeOf<typeof ${t.name}>;`}</P>
        <P></P>
      </Sec>
    )
  }

  // todo add variability for object or subtype of ModelElement
  @SpecOption("transformObject", tmm.Object)
  public transformObj(t: tmm.IObject) {
    return (
      <Sec>
        <Sec $refByName={t.name + "_type_def_sec"}>
          <P>{`export const ${t.name} = t.object(`}</P>
        </Sec>
      </Sec>
    )
  }

  @SpecOption("transformObject", tmm.Subtype)
  transformSubtype(t: tmm.ISubtype) {
    return (
      <Sec>
        <Sec $refByName={t.name + "_type_def_sec"}>
          <P>{`export const ${t.name} = t.subtype(${t.superType.name},`}</P>
        </Sec>
      </Sec>
    )
  }

  transformOptional(t: tmm.IOptional) {
    const optionalType = this.transformType(t.optionalType)
    const baseType = tmm.findBaseType(t.optionalType)
    const type = tmm.getTypeName(t.optionalType)

    return (
      <Sec>
        <P>{`t.optional(`}</P>
        <Sec $refByName="typesDefinition">
          {optionalType}
        </Sec>

        if (type === baseType.name) {
          <P>{t.optionalType.name}</P>
        }

        <P>{`, "${t.name}", ${t.parentModel.name}_Schema);`}</P>
        <P></P>
      </Sec>
    )
  }

  // returnOptionalTypeForType(t: tmm.IOptional): string {
  //   let type = this.handleComplexType(t.optionalType);

  //   return `t.optional(${type})`;
  // }

  returnTypeForArrayType(t: tmm.IArray): string {
    let type = this.handleComplexType(t.elementType)

    return `t.arrayOf(${type})`
  }

  returnTypeForUnion(t: tmm.IUnion): string {
    let types = t.unionTypes.map((e) => `${e.name}: ` + this.handleComplexType(e))
    return `t.taggedUnion({` + types.join(", ") + `}, '${t.descriminator}' , "${t.name}", ${t.parentModel.name}_Schema)`
  }

  @E2E({
    input: tmm.Property,
    output: m2tmm.Paragraph,
  })
  transformProperty(p: tmm.IProperty) {

    // if type is not transformed, try to transform it
    // let domainType: [Element<m2tmm.ISection>, Element<m2tmm.IParagraph>] | null = this.transformType(p.domain as tmm.IType);

    // if domain type is null, type is already transformed, or it is simple type. In that case, try to resolve it
    // if (domainType === null) {
    const domainType = this.context.resolveJSXElement(p.domain, "transformType")
    // }

    const domainName = domainType ? `${p.domain.name}` : `t.link(${p.domain?.parentModel.name}_Schema, '${p.domain?.name}')`

    return (
      <P>
        {/* {domainType} */}
        <P>{`${p.name}_prop: ${domainName},`}</P>
      </P>)
  }

  // @SpecOption("transformType", tmm.Union)
  // transformUnion(t: tmm.IUnion): Element<m2tmm.IM2T_Item> {
  //   return <Sec $refByName="typesDefinition"></Sec>;
  // }

  private brakeCircularDependency(unsortedTypes: Map<tmm.IType, Map<number, Array<tmm.IType>>>): tmm.IType | null {
    if (unsortedTypes.size === 0) return null

    let typesByPriority: Array<{ maxPriority: number, type: tmm.IType }> = Array<{
      maxPriority: number,
      type: tmm.IType
    }>()

    unsortedTypes.forEach((depsByPriority, type) => {

      let maxPriority = 0

      for (const [priority, arrayOfDeps] of depsByPriority) {
        if (priority > maxPriority && arrayOfDeps.length > 0) {
          maxPriority = priority
        }
      }

      typesByPriority.push({ maxPriority: maxPriority, type: type })
    })

    return typesByPriority.sort((a, b) => b.maxPriority - a.maxPriority).pop()?.type as tmm.IType
  }
}




