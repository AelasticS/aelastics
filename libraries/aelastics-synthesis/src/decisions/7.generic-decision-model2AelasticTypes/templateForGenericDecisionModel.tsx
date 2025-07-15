/** @jsx hm */

import { hm } from "../../jsx/handle"
import { Element } from "../../jsx/element"
import * as t from "../../types-metamodel/types-meta.model"
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
    TypeUnion,
} from "../../types-metamodel/types-components"

import { Context } from "../../jsx/context"
import { ModelStore, P } from "../../index"

const store = new ModelStore();

export const typesForDecisionModel = (condition1: boolean): Element<t.ITypeModel> => (

    <TypeModel name="AelasticsTypes" store={store}>
        <TypeUnion name="PK Naming convention Union" elements={[
            <TypeObject name="PK Naming convention No prefix or suffix">
                <Property name="No prefix or suffix">
                    <PropertyDomain $refByName="string" />
                </Property>
            </TypeObject>,
            <TypeObject name="PK Naming convention Add prefix">
                <Property name="Add prefix">
                    <PropertyDomain $refByName="string" />
                </Property>
            </TypeObject>,
            <TypeObject name="PK Naming convention Add suffix">
                <Property name="Add suffix">
                    <PropertyDomain $refByName="string" />
                </Property>
            </TypeObject>,
        ]} />

        <TypeUnion name="FK Naming convention Union" elements={[
            <TypeObject name="FK Naming convention ByRole">
                <Property name="ByRole">
                    <PropertyDomain $refByName="string" />
                </Property>
            </TypeObject>,
            <TypeObject name="FK Naming convention ByPK">
                <Property name="ByPK">
                    <PropertyDomain $refByName="string" />
                </Property>
            </TypeObject>,
        ]} />

        <TypeUnion name="Foreign key or Separate Table Union" elements={[
            <TypeObject name="Foreign key">
                <Property name="Foreign key">
                    <PropertyDomain $refByName="string" />
                </Property>
            </TypeObject>,
            <TypeObject name="Separate Table">
                <Property name="Separate Table">
                    <PropertyDomain $refByName="string" />
                </Property>
            </TypeObject>,
        ]} />



        <TypeObject name={`Relationship_${condition1}`}>
            <Property name="PK Naming convention">
                <PropertyDomain $refByName="PK Naming convention Union" />
            </Property>

            <Property name="FK Naming convention">
                <PropertyDomain $refByName="PK Naming convention Union" />
            </Property>

            {condition1 && (
                <Property name="Foreign key or Separate Table">
                    <PropertyDomain $refByName="Foreign key or Separate Table Union" />
                </Property>
            )}

        </TypeObject>
    </TypeModel >
);