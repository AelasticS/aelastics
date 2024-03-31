/** @jsx hm */
/*
 * Copyright (c) AelasticS 2022.
 */

// const EER = getEER({} as IModel, null)

import { hm } from '../index';
import * as et from "../test/eer-model/EER.meta.model.type";
import * as e from "../test/eer-model/EER-components";
import { Element } from '../index'

const eerSchema1 = (
    <e.Kernel name="Person">
      <e.Attribute name="PersonName">
        <e.Domain name="string" />
      </e.Attribute>
    </e.Kernel>

);

export default function f()  {
  return eerSchema1;
}
