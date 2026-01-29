/** @jsx hm */

import { hm } from "../../jsx/handle"
import { Element } from "../../jsx/element"
import * as t from "../../types-metamodel/types-meta.model"
import {
    TypeObject,
    Property,
    TypeModel,
    TypeOptional,
    TypeOfOptional,
    PropertyDomain,
    TypeUnion,
    UnionElement,
} from "../../types-metamodel/types-components"

import { ModelStore } from "../../index"
import { IIssue, IOption } from "../1.design-decision/design-decision-meta.model"
import { IModelElement } from "generic-metamodel"
import { IModelingLanguageBindingElement } from "../2.modeling-language-binding/modeling-language-binding-meta.model"

const store = new ModelStore();

export const typeForDecisionModel = (store: ModelStore, element: IModelElement, bindings: IModelingLanguageBindingElement[]): Element<t.ITypeModel> => {

    const definedProperties: Map<string, boolean> = new Map(); // Map<propertyName, isOptional>

    return <TypeModel name="AelasticsTypes" store={store}>
        <TypeObject name={`${element.name}Type`}>
            {
                bindings.flatMap((binding: IModelingLanguageBindingElement) => {
                    const hasCondition: boolean = binding.condition !== undefined && binding.condition !== "";

                    return binding.decisionIssues.map((issue: IIssue) => {
                        if (!definedProperties.has(issue.name)) {
                            definedProperties.set(issue.name, hasCondition);

                            var propertyType: Element<t.IType> = getAllVariationsType(issue);
                            if (hasCondition) {
                                propertyType.props.name = `${issue.name}Base`;
                                propertyType =
                                    <TypeOptional name={`${issue.name}`}>
                                        {propertyType}
                                        <TypeOfOptional $refByName={propertyType.props.name} />;
                                    </TypeOptional>;
                            }
                            return (
                                <Property
                                    name={issue.name}
                                    description={issue.description}
                                >
                                    {propertyType}
                                    <PropertyDomain $refByName={propertyType.props.name} />
                                </Property>
                            );


                        } else {
                            console.warn(`Property ${issue.name} is already defined for ${element.name}Type`);
                        }
                    });
                })
            }
        </TypeObject>
    </TypeModel >
};

function getAllVariationsType(issue: IIssue): Element<t.IType> {
    return <TypeUnion name={`${issue.name}Union`}>
        {issue.possibleOptions.map((option: IOption) => {
            return <UnionElement>
                <PropertyDomain $refByName="false" />
                <PropertyDomain $refByName="true" />
                {/* <Type name="SomeType"></Type> */}
                <PropertyDomain $refByName="SomeType" />
            </UnionElement>
        })}

    </TypeUnion>;
};