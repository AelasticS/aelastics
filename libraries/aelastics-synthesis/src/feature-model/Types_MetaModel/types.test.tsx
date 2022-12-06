/** @jsx hm */

import { Element } from "../../jsx/element";
import { hm } from "../../jsx/handle";
import { Property, Subtype, TypeModel } from "./types-components";
import { ITypeModel } from "./types-meta.model";

const typeModel: Element<ITypeModel> = (
  <TypeModel name="prvi type model">
    <Object name="Objekat">
      <Property name="prop1" />
      <Property name="prop2" />
      <Property name="prop3" />
    </Object>
    <Subtype name="primer subtype objekta">
      <Property name="prop1 u subtype"></Property>
      <Property name="prop2 u subtype"></Property>
    </Subtype>
  </TypeModel>
);
