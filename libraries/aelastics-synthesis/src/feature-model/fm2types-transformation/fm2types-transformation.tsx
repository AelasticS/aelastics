/** @jsx hm */

import { Element } from "../../jsx/element";
import { hm } from "../../jsx/handle";
import { ModelStore } from "../../model-store/ModelsStore";
import { abstractM2M } from "../../transformations/abstractM2M";
import * as fm from "../fm-metamodel/fm-meta.model.type";
import { SpecPoint, SpecOption } from "../../transformations/spec-decorators";
import {
  Property,
  PropertyDomain,
  TypeArray,
  TypeModel,
  TypeObject,
  TypeOptional,
  TypeUnion,
  TypeInUnion
} from "../../types-metamodel/types-components";
import * as tmm from "../../types-metamodel/types-meta.model";

import { importPredefinedTypes } from "../../types-metamodel/predefined-model";
import { M2M, E2E } from "../../transformations/trace-decorators";

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

  Feature2Type(f: fm.IFeature): Element<tmm.IType> {
    let type = undefined;

    if (f.maxCardinality === 1 && this.context.store.isTypeOf(f, fm.GroupFeature)) {
      type = this.Feature2ExclusiveUnion(f);
    } else if (f.maxCardinality > 1 && this.context.store.isTypeOf(f, fm.GroupFeature)) {
      type = this.Feature2InclusiveUnion(f);
    } else if (
      (f.maxCardinality == 1 && this.context.store.isTypeOf(f, fm.SolitaryFeature))
    ) {
      type = this.Feature2Object(f);
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

  @SpecPoint()
  Feature2Object(f: fm.IFeature): Element<tmm.IType> {
    return (
      <TypeObject name={f.name + "_type"}>
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

  @SpecOption("Feature2Object", fm.SolitaryFeature)
  Solitary2Object(f: fm.ISolitaryFeature): Element<tmm.IObject> {
    return (
      <TypeObject>
        {f.attributes?.map((e) => this.Attribute2Property(e as fm.IAttribute))}
      </TypeObject>
    );
  }

  @SpecOption("Feature2Object", fm.GroupFeature)
  Group2Object(f: fm.IGroupFeature): Element<tmm.IObject> {
    return <TypeObject></TypeObject>;
  }

  // todo Finish this method
  // todo this can be VarOption (maxCardinality == 1)
  Feature2ExclusiveUnion(f: fm.IGroupFeature): Element<tmm.IUnion> {

    const types = f.subfeatures?.map((e) => this.Feature2Type(e as fm.IFeature));

    return (
      <TypeUnion name={f.name + "_union"} unionTypes={types as []}/>
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
