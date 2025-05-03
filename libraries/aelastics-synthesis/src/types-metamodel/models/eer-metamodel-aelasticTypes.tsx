/** @jsx hm */

import { ModelStore } from "../../index"
import { Element } from "../../jsx/element"
import { hm } from "../../jsx/handle"
import { TypeString } from "../predefined-types"
import {
    InverseProperty,
    Property,
    PropertyDomain,
    TypeArray,
    TypeLink,
    TypeModel,
    TypeObject,
    TypeOptional,
    TypeSubtype
} from "../types-components"
import * as t from "../types-meta.model"
import { importPredefinedTypes } from "./../predefined-model"

const store = new ModelStore();

const EERModel: Element<t.ITypeModel> = (

    <TypeModel name="EERModel" store={store}>
        {importPredefinedTypes("../EERModel")}

        <TypeObject name="ERConcept">
            <Property name="conceptType">
                <PropertyDomain $refByName="string" />
            </Property>
        </TypeObject>

        <TypeSubtype name="Submodel" superType={<TypeObject $refByName="ERConcept" />} >
            <Property name="concepts"
                domain={<TypeArray name="ArrayOfConcepts" elementType={<TypeObject $refByName="ERConcept" />} />}
            />
        </TypeSubtype>

        <TypeObject name="EERSchema">
            <Property name="submodels"
                domain={<TypeArray name="ArrayOfSubmodels" elementType={<TypeObject $refByName="Submodel" />} />}
            />
        </TypeObject>

        <TypeSubtype name="Attribute" superType={<TypeObject $refByName="ERConcept" />} >
            <Property name="attrDomain"
                domain={<TypeSubtype name="Domain" superType={<TypeObject $refByName="ERConcept" />} />}
            />
            <Property name="isKey">
                <PropertyDomain $refByName="boolean" />
            </Property>
            <Property name="defaultValue"
                domain={<TypeOptional name="OptionalString" optionalType={<TypeString $refByName="string" />} />}
            />
            <Property name="attrEntity" domain={<TypeLink schema={<TypeModel $refByName="EERModel" />} path="Entity" />} />
        </TypeSubtype>

        <TypeSubtype name="Entity" superType={<TypeObject $refByName="ERConcept" />} >
            <Property name="attributes"
                domain={<TypeArray name="ArrayOfAttributes"
                    elementType={<TypeObject $refByName="Attribute" />} />}
            />
            <Property name="mappings"
                domain={<TypeArray name="ArrayOfMappings"
                    elementType={<TypeLink schema={<TypeModel $refByName="EERModel" />} path="Mapping" />} />}
            />
        </TypeSubtype>

        <TypeSubtype name="Kernel" superType={<TypeSubtype $refByName="Entity" />} />

        <TypeSubtype name="Weak" superType={<TypeSubtype $refByName="Entity" />}>
            <Property name="weakMap"
                domain={<TypeOptional name="OptionalWeakMapping"
                    optionalType={<TypeLink schema={<TypeModel $refByName="EERModel" />} path="WeakMapping" />} />}
            />
        </TypeSubtype>

        <TypeSubtype name="Aggregation" superType={<TypeSubtype $refByName="Entity" />}>
            <Property name="agrMapp"
                domain={<TypeArray name="ArrayOfAggregationMappings"
                    elementType={<TypeLink schema={<TypeModel $refByName="EERModel" />} path="AggregationMapping" />} />}
            />
        </TypeSubtype>

        <TypeSubtype name="Subtype" superType={<TypeSubtype $refByName="Entity" />}>
            <Property name="supertype"
                domain={<TypeLink schema={<TypeModel $refByName="EERModel" />} path="Specialization" />}
            />
            <Property name="cnSupertype" domain={<TypeString $refByName="string" />} />
            <Property name="dcnSupertype" domain={<TypeString $refByName="string" />} />
            <Property name="cnSubtype" domain={<TypeString $refByName="string" />} />
            <Property name="dcnSubtype" domain={<TypeString $refByName="string" />} />
        </TypeSubtype>

        <TypeSubtype name="Mapping" superType={<TypeObject $refByName="ERConcept" />} >
            <Property name="domain" domain={<TypeSubtype $refByName="Entity" />} />
            <Property name="lowerBound" domain={<TypeString $refByName="string" />} />
            <Property name="upperBound" domain={<TypeString $refByName="string" />} />
            <Property name="cnMapp" domain={<TypeString $refByName="string" />} />
            <Property name="dcnMapp" domain={<TypeString $refByName="string" />} />
        </TypeSubtype>

        <TypeSubtype name="WeakMapping" superType={<TypeObject $refByName="Mapping" />} >
            <Property name="codomain" domain={<TypeSubtype $refByName="Weak" />} />
            <Property name="cnWeakOwner" domain={<TypeString $refByName="string" />} />
            <Property name="dcnWeakOwner" domain={<TypeString $refByName="string" />} />
        </TypeSubtype>

        <TypeSubtype name="AggregationMapping" superType={<TypeObject $refByName="Mapping" />} >
            <Property name="codomain" domain={<TypeSubtype $refByName="Aggregation" />} />
            <Property name="cnAggrOwner" domain={<TypeString $refByName="string" />} />
            <Property name="dcnAggrOwner" domain={<TypeString $refByName="string" />} />
        </TypeSubtype>

        <TypeSubtype name="OrdinaryMapping" superType={<TypeObject $refByName="Mapping" />} >
            <Property name="relationship"
                domain={<TypeLink schema={<TypeModel $refByName="EERModel" />} path="Relationship" />} />
        </TypeSubtype>

        <TypeSubtype name="Relationship" superType={<TypeObject $refByName="ERConcept" />} >
            <Property name="ordinaryMappings"
                domain={<TypeArray name="ArrayOfOrdinaryMappings"
                    elementType={<TypeSubtype $refByName="OrdinaryMapping" />} />} />
        </TypeSubtype>

        <TypeSubtype name="Specialization" superType={<TypeObject $refByName="ERConcept" />} >
            <Property name="mapping"
                domain={<TypeOptional name="OptionalSpecializationMapping"
                    optionalType={<TypeLink schema={<TypeModel $refByName="EERModel" />} path="SpecializationMapping" />} />}
            />
            <Property name="subtypes"
                domain={<TypeArray name="ArrayOfSubtypes"
                    elementType={<TypeSubtype $refByName="Subtype" />} />}
            />
        </TypeSubtype>

        <TypeSubtype name="SpecializationMapping" superType={<TypeObject $refByName="Mapping" />} >
            <Property name="specialization"
                domain={<TypeOptional name="OptionalSpecialization"
                    optionalType={<TypeSubtype $refByName="Specialization" />} />}
            />
        </TypeSubtype>

        <InverseProperty
            firstType={<TypeSubtype $refByName="Attribute" />}
            firstProperty="attrEntity"
            secondType={<TypeSubtype $refByName="Entity" />}
            secondProperty="attributes"
        />

        <InverseProperty
            firstType={<TypeSubtype $refByName="Relationship" />}
            firstProperty="ordinaryMapping"
            secondType={<TypeSubtype $refByName="OrdinaryMapping" />}
            secondProperty="relationship"
        />

        <InverseProperty
            firstType={<TypeSubtype $refByName="Entity" />}
            firstProperty="mappings"
            secondType={<TypeSubtype $refByName="Mapping" />}
            secondProperty="domain"
        />

        <InverseProperty
            firstType={<TypeSubtype $refByName="Weak" />}
            firstProperty="weakMap"
            secondType={<TypeSubtype $refByName="WeakMapping" />}
            secondProperty="codomain"
        />

        <InverseProperty
            firstType={<TypeSubtype $refByName="Aggregation" />}
            firstProperty="agrMapp"
            secondType={<TypeSubtype $refByName="AggregationMapping" />}
            secondProperty="codomain"
        />

        <InverseProperty
            firstType={<TypeSubtype $refByName="Subtype" />}
            firstProperty="supertype"
            secondType={<TypeSubtype $refByName="Specialization" />}
            secondProperty="subtypes"
        />

        <InverseProperty
            firstType={<TypeSubtype $refByName="Specialization" />}
            firstProperty="mapping"
            secondType={<TypeSubtype $refByName="SpecializationMapping" />}
            secondProperty="specialization"
        />

    </TypeModel>
);