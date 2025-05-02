/** @jsx hm */

import { hm } from "../../jsx/handle"
import { Element } from "../../jsx/element"
import * as t from "../types-meta.model"
import {
    TypeObject,
    Property,
    TypeSupertype,
    TypeModel,
    TypeSubtype,
    TypeOptional,
    TypeOfOptional,
    PropertyDomain, TypeObjectReference, TypeArray, ArrayElementType,
    TypeEntity,
} from "../types-components"
import { Context } from "../../jsx/context"
import { ModelStore, P } from "../../index"

const store = new ModelStore();

const aelasticsTypesModel: Element<t.ITypeModel> = (

    <TypeModel name="AelasticsTypes" store={store}>
        <TypeObject name="Type" />

        <TypeObject name="Optional">
            <Property name="optionalType">
                <PropertyDomain $refByName="Type" />
            </Property>
        </TypeObject>

    </TypeModel>
);