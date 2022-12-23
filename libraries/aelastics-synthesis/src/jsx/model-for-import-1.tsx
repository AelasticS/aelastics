/** @jsx hm */
/*
 * Copyright (c) AelasticS 2022.
 */

// const EER = getEER({} as IModel, null)

import { hm } from "./handle";
import * as et from "../test/eer-model/EER.meta.model.type";
import * as e from "../test/eer-model/EER-components";
import { Element } from "./element";

const eerSchema1: Element<et.IEERSchema> = (
  <e.EERSchema name="Persons" MDA_level="M1">
    <e.Kernel name="Person">
      <e.Attribute name="PersonName">
        <e.Domain name="string" />
      </e.Attribute>
    </e.Kernel>
    <e.Weak id="11" name="Child">
      <e.Attribute  name="ChildID">
        <e.Domain name="number" />
      </e.Attribute>
      <e.Attribute name="ChildName">
        <e.Domain $refByName="string" />
      </e.Attribute>
    </e.Weak>
  </e.EERSchema>
);

export default function f() : Element<et.IEERSchema> {
  return eerSchema1;
}
