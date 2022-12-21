/** @jsx hm */
/*
 * Copyright (c) AelasticS 2022.
 */

// const EER = getEER({} as IModel, null)

import { hm } from "../jsx/handle";
import * as et from "../test/eer-model/EER.meta.model.type";
import * as e from "../test/eer-model/EER-components";
import { Element } from "../jsx/element";

const eerSchema1: Element<et.IEERSchema> = (
  <e.EERSchema id="1" name="Persons" MDA_level="M1">
    <e.Kernel id="2" name="Person">
      <e.Attribute id="5" name="PersonName">
        <e.Domain id="6" name="string" />
      </e.Attribute>
    </e.Kernel>
    <e.Weak id="11" name="Child">
      <e.Attribute id="13" name="ChildID">
        <e.Domain id="14" name="number" />
      </e.Attribute>
      <e.Attribute id="15" name="ChildName">
        <e.Domain id="16" name="string" />
      </e.Attribute>
    </e.Weak>
  </e.EERSchema>
);

export default function () : Element<et.IEERSchema> {
  return eerSchema1;
}
