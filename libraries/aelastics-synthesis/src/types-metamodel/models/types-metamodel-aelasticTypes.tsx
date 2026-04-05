/** @jsx createExprNode */

import { createExprNode } from "../../jsx/handle"
import { ExprNode } from "../../jsx/element"
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

export const aelasticsTypesModel: ExprNode<t.ITypeModel> = (

    <TypeModel name="AelasticsTypes" store={store}>
        <TypeObject name="Type" />

        <TypeObject name="Optional">
            <Property name="optionalType">
                <PropertyDomain $refByName="Type" />
            </Property>
        </TypeObject>

    </TypeModel>
);