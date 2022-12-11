/** @jsx hm */

import { Element } from "../../jsx/element";
import { hm } from "../../jsx/handle";
import { ModelStore } from "../../jsx/ModelsStore";
import { abstractM2M } from "../../transformations/abstractM2M";
import * as fm from "../FM_MetaModel/fm-meta.model-V2.type";
import { SpecPoint, SpecOption } from "../../transformations/spec-decorators";
import {
  Array,
  ArrayType,
  Optional,
  Property,
  TypeModel,
  Union,
} from "../Types_MetaModel/types-components";
import * as t from "../Types_MetaModel/types-meta.model";

export class FM2TypesTransformations extends abstractM2M<
  fm.IFeatureDiagram,
  t.ITypeModel
> {
  constructor(store: ModelStore) {
    super(store);
  }

  template(fd: fm.IFeatureDiagram) {
    return (
      <TypeModel name={fd.name} MDA_level="M2">
        {fd.elements.map((e) => this.Feature2Type(e as fm.IFeature))}
      </TypeModel>
    );
  }

  Feature2Type(f: fm.IFeature): Element<t.IType> {
    let type = undefined;
    if (
      f.maxCardinality == 1 ||
      this.context.store.isTypeOf(f, fm.GroupFeature)
    ) {
      type = this.Feature2Object(f);
    } else {
      type = this.Feature2Array(f);
    }

    if (f.minCardinality === 0) {
      type = <Optional>{type}</Optional>;
    }

    return type;
  }

  @SpecPoint()
  Feature2Object(f: fm.IFeature): Element<t.IType> {
    return (
      <Object name={f.name}>
        {f.subfeatures?.map((e) => this.Feature2Type(e as fm.IFeature))}
      </Object>
    );
  }

  @SpecOption("Feature2Object", fm.SolitaryFeature)
  Solitary2Object(f: fm.ISolitaryFeature): Element<t.IObject> {
    return (
      <Object>
        {f.attributes?.map((e) => this.Attribute2Property(e as fm.IAttribute))}
      </Object>
    );
  }

  @SpecOption("Feature2Object", fm.GroupFeature)
  Group2Object(f: fm.IGroupFeature): Element<t.IObject> {
    return <Object></Object>;
  }

  Attribute2Property(a: fm.IAttribute): Element<t.IProperty> {
    return <Property name={a.name}></Property>;
  }

  Feature2ArrayType(f: fm.IFeature): Element<t.IType> {
    return <ArrayType></ArrayType>;
  }

  Feature2Array(f: fm.IFeature): Element<t.IType> {
    // ovde je dovoljno da se napravi jedan tip (taj konkretan)
    let type = this.Feature2ArrayType(f);

    return <Array>{this.Feature2ArrayType(f)}</Array>;
  }

  //unija nije potrebna

  //   Feature2Union(f: fm.IFeature): Element<t.IUnion> {
  //     return (
  //       <Union>
  //         {f.subfeatures?.map((e) => this.Feature2Type(e as fm.IFeature))}
  //       </Union>
  //     );
  //   }
}
