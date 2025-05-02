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
import { importPredefinedTypes } from "./../predefined-model"
import { TypeString } from "../predefined-types"

const EERModel: Element<t.ITypeModel> = (

    <TypeModel name="EERModel" store={store}>
        {importPredefinedTypes("../EERModel")}

        <TypeObject name="ERConcept">
            <Property name="conceptType">
                <PropertyDomain $refByName="string" />
            </Property>
        </TypeObject>

        <TypeOptional name="OptionalString" optionalType={<TypeString $refByName="string" />} />


        <TypeSubtype name="Domain" superType={<TypeObject $refByName="ERConcept" />} />

        <TypeArray name="ArrayOfConcepts" elementType={<TypeObject $refByName="ERConcept" />} />

        <TypeSubtype name="Submodel" superType={<TypeObject $refByName="ERConcept" />} >
            <Property name="concepts">
                <PropertyDomain $refByName="ArrayOfConcepts" />
            </Property>
        </TypeSubtype>

        <TypeArray name="ArrayOfSubmodels" elementType={<TypeObject $refByName="Submodel" />} />

        <TypeObject name="EERSchema">
            <Property name="submodels">
                <PropertyDomain $refByName="ArrayOfSubmodels" />
            </Property>
        </TypeObject>

        <TypeSubtype name="Attribute" superType={<TypeObject $refByName="ERConcept" />} >
            <Property name="attrDomain">
                <PropertyDomain $refByName="Domain" />
            </Property>
            <Property name="isKey">
                <PropertyDomain $refByName="boolean" />
            </Property>
            <Property name="defaultValue">
                <PropertyDomain $refByName="OptionalString" />
            </Property>
            <Property name="attrEntity">
                {/* TODO: nije definisan Entity type. Ovde mora link kada se definise*/}
                <PropertyDomain $refByName="Entity - NIJE DEFINISANO. MORA LINK" />
            </Property>
        </TypeSubtype>

        <TypeArray name="ArrayOfAttributes" elementType={<TypeObject $refByName="Attribute" />} />
        {/* TODO: nije definisan Mapping. Ovde mora link kada se definise*/}
        <TypeArray name="ArrayOfMappings" elementType={<TypeObject $refByName="Mapping NIJE DEFINISANO. MORA LINK" />} />

        <TypeSubtype name="Entity" superType={<TypeObject $refByName="ERConcept" />} >
            <Property name="attributes">
                <PropertyDomain $refByName="ArrayOfAttributes" />
            </Property>
            <Property name="mappings">
                <PropertyDomain $refByName="ArrayOfMappings" />
            </Property>
        </TypeSubtype>

        <TypeSubtype name="Kernel" superType={<TypeObject $refByName="Entity" />} />

        {/* TODO: nije definisan WeakMapping. Ovde mora link kada se definise*/}
        <TypeOptional name="OptionalWeakMapping" optionalType={<TypeObject $refByName="WeakMapping NIJE DEFINISANO. MORA LINK" />} />

        <TypeSubtype name="Weak" superType={<TypeObject $refByName="Entity" />}>
            <Property name="weakMap">
                <PropertyDomain $refByName="OptionalWeakMapping" />
            </Property>
        </TypeSubtype>

        {/* TODO: nije definisan AggregationMapping. Ovde mora link kada se definise*/}
        <TypeArray name="ArrayOfAggregationMappings" elementType={<TypeObject $refByName="AggregationMapping NIJE DEFINISANO. MORA LINK" />} />

        <TypeSubtype name="Aggregation" superType={<TypeObject $refByName="Entity" />}>
            <Property name="agrMapp">
                <PropertyDomain $refByName="ArrayOfAggregationMappings" />
            </Property>
        </TypeSubtype>

        {/* TODO: nije definisan Specialization. Ovde mora link kada se definise*/}
        <TypeSubtype name="Subtype" superType={<TypeObject $refByName="Entity" />}>
            <Property name="supertype">
                <PropertyDomain $refByName="Specialization" />
            </Property>
            <Property name="cnSupertype">
                <PropertyDomain $refByName="string" />
            </Property>
            <Property name="dcnSupertype">
                <PropertyDomain $refByName="string" />
            </Property>
            <Property name="cnSubtype">
                <PropertyDomain $refByName="string" />
            </Property>
            <Property name="dcnSubtype">
                <PropertyDomain $refByName="string" />
            </Property>
        </TypeSubtype>



    </TypeModel>
);