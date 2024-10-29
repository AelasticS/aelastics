/** @jsx hm */

import { Element, Resolve } from "../../jsx/element";
import { hm } from "../../jsx/handle";
import { ModelStore } from "../../model-store/ModelsStore";
import { abstractM2M } from "../../transformations/abstractM2M";
import {
  Property,
  PropertyDomain,
  TypeArray,
  TypeModel,
  TypeObject,
  TypeOptional,
  TypeUnion
} from "../../types-metamodel/types-components";
import * as tmm from "../../types-metamodel/types-meta.model";
import * as fm from "../fm-metamodel/fm-meta.model.type";

import { E2E, M2M } from "../../transformations/trace-decorators";
import { importPredefinedTypes } from "../../types-metamodel/predefined-model";

@M2M({
  input: fm.FeatureDiagram,
  output: tmm.TypeModel,
})
export class FM2TypesTransformations extends abstractM2M<
  fm.IFeatureDiagram,
  tmm.ITypeModel
> {
  constructor(store: ModelStore) {
    super(store);
  }

  template(fd: fm.IFeatureDiagram) {
    return (
      <TypeModel name={fd.name + "_type_model"} MDA_level="M2">
        {importPredefinedTypes(`../${fd.name}_type_model`)}
        {this.Feature2Type(fd.rootFeature)}
      </TypeModel>
    );
  }

  @E2E({
    input: fm.Feature,
    output: tmm.Type,
  })
  Feature2Type(f: fm.IFeature): Element<tmm.IType> {
    if (!f) {
      return null as any;
    }

    let type = undefined;

    if (f.maxCardinality === 1 && this.context.store.isTypeOf(f, fm.GroupFeature)) {
      type = this.Feature2ExclusiveUnion(f);
    } else if (f.maxCardinality > 1 && this.context.store.isTypeOf(f, fm.GroupFeature)) {
      type = this.Feature2InclusiveUnion(f);
    } else if (
      (f.maxCardinality == 1 && this.context.store.isTypeOf(f, fm.SolitaryFeature))
    ) {
      type = this.Feature2Object(f as fm.ISolitaryFeature);
    } else {
      type = this.Feature2Array(f);
    }

    if (f.minCardinality === 0) {
      type = (
        <TypeOptional
          name={f.name + "_optional"}
          // @ts-ignore
          optionalType={type}
        ></TypeOptional>
      );
    }

    return type;
  }

  // @SpecPoint()
  Feature2Object(f: fm.ISolitaryFeature): Element<tmm.IType> {
    return (
      <TypeObject name={f.name + "_type"}>
        {f.attributes?.map((e) => this.Attribute2Property(e as fm.IAttribute))}
        {f.subfeatures?.map((e) => {
          return (
            <Property
              name={e.name + "_prop"}
              // @ts-ignore
              domain={this.Feature2Type(e as fm.IFeature)}
            ></Property>
          );
        })}
      </TypeObject>
    );
  }

  // @SpecOption("Feature2Object", fm.SolitaryFeature)
  // Solitary2Object(f: fm.ISolitaryFeature): Element<tmm.IObject> {
  //   return (
  //     <TypeObject>

  //     </TypeObject>
  //   );
  // }

  // @SpecOption("Feature2Object", fm.GroupFeature)
  // Group2Object(f: fm.IGroupFeature): Element<tmm.IObject> {
  //   return <TypeObject></TypeObject>;
  // }

  // todo Finish this method
  // todo this can be VarOption (maxCardinality == 1)
  Feature2ExclusiveUnion(f: fm.IGroupFeature): Element<tmm.IUnion> {

    const types: Array<Element<tmm.IType>> = f.subfeatures?.map((e) => this.Feature2Type(e as fm.IFeature));
    const unionDescriminator = f.name + "_desc";

    const descriminatorProperties = f.subfeatures?.map((feature) => {
      return (
        <Resolve input={feature}>
          {(resolvedType: tmm.IType) => {
            if (this.context.store.isTypeOf(resolvedType, tmm.Object)) {
              return (
                <TypeObject $refByName={resolvedType.name}>
                  <Property name={unionDescriminator}>
            <PropertyDomain $refByName="string"></PropertyDomain>
          </Property>
        </TypeObject>
      );
            } else if (this.context.store.isTypeOf(resolvedType, tmm.Array)) {
              return null;
            } else {
              //@ts-ignore
              if (tmm.findBaseType(resolvedType) === tmm.Object.name) {
                return (
                  <TypeObject $refByName={resolvedType.name}>
                    <Property name={unionDescriminator}>
                      <PropertyDomain $refByName="string"></PropertyDomain>
                    </Property>
                  </TypeObject>
                );
              }

              return null;
            }
          }}
        </Resolve>)

    });

    return (
      // TODO desc name should be the same as the name of the property of types in union, but it is not possible to get the name of the property, because it is created during the transformation
      // @ts-ignore
      <TypeUnion name={f.name + "_union"} unionTypes={types} descriminator={unionDescriminator} >
        {descriminatorProperties}
      </TypeUnion>
    );
  }

  // todo this can be VarOption (maxCardinality > 1)
  Feature2InclusiveUnion(f: fm.IGroupFeature): Element<tmm.IObject> {
    return (
      <TypeObject name={f.name + "_exUnionType"} >
        {
          f.subfeatures?.map((e) => {
            // artificialy make all features optional
            e.minCardinality = 0;
            return (
              <Property
                name={e.name + "_prop"}
                // @ts-ignore
                domain={this.Feature2Type(e)}
              ></Property>
            );
          })
        }
      </TypeObject>
    );
  }

  @E2E({
    input: fm.Attribute,
    output: tmm.Property,
  })
  Attribute2Property(a: fm.IAttribute): Element<tmm.IProperty> {
    return (
      <Property name={a.name + "_attr"} >
        <PropertyDomain $refByName={a.type}></PropertyDomain>
      </Property>
    );
  }

  Feature2Array(f: fm.IFeature): Element<tmm.IType> {
    return (
      <TypeArray
        name={f.name + "_array"}
        // @ts-ignore
        elementType={this.Feature2Object(f)}
      ></TypeArray>
    );

    // TODO method 2 - working
    // return (
    //   <TypeArray>
    //     {typeOfElement}
    //     <ArrayElementType
    //       $refByName={typeOfElement.props.name}
    //     ></ArrayElementType>
    //   </TypeArray>
    // );
  }
}
