/** @jsx hm */


import { hm } from "../../jsx/handle";
import { Element } from "../../jsx/element";
import * as gdmT from "../1.design-decision/design-decision-meta.model";
import { CompositeOption, DecisionModel, Issue, Option, SimpleOption, SubIssue } from "../1.design-decision/design-decision-meta.model-components";


import { Context } from "../../jsx/context";
import { ModelStore } from '../../index';
import * as t from "aelastics-types";
import { TypeObject, Property, PropertyDomain } from "../../types-metamodel/types-components";
import { importPredefinedTypes } from "../../types-metamodel/predefined-model";
import { TypeString } from "../../types-metamodel/predefined-types";

const testStore = new ModelStore();
const context = new Context();

export const NamingConventionGDM: Element<gdmT.IDecisionModel> = (
    <DecisionModel
        name="Naming convention-gdm"
        description="This is a generic decision model for naming convention"
        store={testStore}
    >
        {importPredefinedTypes("../Namingconvention-gdm")}
        <Issue name="PK Naming convention" description="Primary Key Naming convention" >
            <Option name="Add prefix" description="Add prefix"
                optionType={<SimpleOption name="SimpleOptionForAddPrefix" />} />
            <Option name="No prefix or suffix" description="No prefix or suffix" isDefault={true}
                optionType={<SimpleOption name="SimpleOptionForNoPrefixOrSuffix" />} />
            <Option name="Add suffix" description="Add suffix"
                optionType={<SimpleOption name="SimpleOptionForAddSuffix" valueType={<TypeString></TypeString>}></SimpleOption>} />
        </Issue>
        <Issue name="FK Naming convention" description="Foreign Key Naming convention" >
            <Option name="ByRole" description="Named After Role Name " isDefault={true} optionType={<SimpleOption name="SimpleOptionForByRole" />} />
            <Option name="ByPK" description="Named After Primary Key from Origin Table" optionType={<SimpleOption name="SimpleOptionForByPK" />} />
        </Issue>
        <Issue name="Foreign key or Separate Table" description="Foreign key or Separate Table" >

            <Option name="Foreign Key" description="Use Foreign Key" optionType={<SimpleOption name="SimpleOptionForForeignKey" />} />

            <Option name="Separate Table" description="Use Separate Table for many to many relationships" isDefault={true}
                optionType={
                    <CompositeOption name="SeparateTableCompositeOption" >
                        <SubIssue name="Naming convention for 01.0M relationships" description="Naming convention for 0,1:0,M relationships" >
                            <Option name="Use Role Names" description="Use Role Names for 0,1:0,M relationships" isDefault={true}
                                optionType={<SimpleOption name="SimpleOptionForUseRoleNames" />} />
                            <Option name="Use entities names" description="Use entities names for 0,1:0,M relationships"
                                optionType={<SimpleOption name="SimpleOptionForUseEntitiesNames" />} />
                        </SubIssue>
                    </CompositeOption>
                }>
            </Option>
        </Issue>

    </DecisionModel>);

export const PerformanceOptimizationGMD: Element<gdmT.IDecisionModel> = (
    <DecisionModel
        name="Performance optimization - gdm"
        description="This is a generic decision model for performance optimization"
        store={testStore}
    >
        <Issue name="Indexing strategies for FK" description="Indexing strategies for FK" >
            <Option name="No index" description="No index" isDefault={true} />
            <Option name="Create indexes" description="Create indexes on FK"                 >
                <SubIssue name="PK Naming convention" description="Primary Key Naming convention" >
                    <Option name="No prefix or suffix" description="No prefix or suffix" isDefault={true} />
                    <Option name="Add prefix" description="Add prefix" />
                    <Option name="Add suffix" description="Add suffix" />
                </SubIssue>,
                <SubIssue name="FK Naming convention" description="Foreign Key Naming convention" >
                    <Option name="ByRole" description="Named After Role Name " isDefault={true} />
                    <Option name="ByPK" description="Named After Primary Key from Origin Table" />
                </SubIssue>
            </Option>
        </Issue>
    </DecisionModel>
);

// const m1: gdmT.IGenericDecisionModel = NamingConventionGDM.render(context);
// const m2: gdmT.IGenericDecisionModel = PerformanceOptimizationGMD.render(context);

// console.log("m1", m1);