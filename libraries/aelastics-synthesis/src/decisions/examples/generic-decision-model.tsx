/** @jsx hm */


import { hm } from "../../jsx/handle";
import { Element } from "../../jsx/element";
import * as gdmT from "../generic-decision-model/generic-decision-meta.model";
import { GenericDecisionModel, Issue, Option } from "../generic-decision-model/generic-decision-meta.model-components";


import { Context } from "../../jsx/context";
import { ModelStore } from '../../index';

const testStore = new ModelStore();
const context = new Context();

export const NamingConventionGDM: Element<gdmT.IGenericDecisionModel> = (
    <GenericDecisionModel
        name="Naming convention - gdm"
        description="This is a generic decision model for naming convention"
        store={testStore}
    >
        <Issue name="PK Naming convention" description="Primary Key Naming convention" >
            <Option name="No prefix or suffix" description="No prefix or suffix" isDefault={true} />
            <Option name="Add prefix" description="Add prefix" />
            <Option name="Add suffix" description="Add suffix" />
        </Issue>
        <Issue name="FK Naming convention" description="Foreign Key Naming convention" >
            <Option name="ByRole" description="Named After Role Name " isDefault={true} />
            <Option name="ByPK" description="Named After Primary Key from Origin Table" />
        </Issue>
    </GenericDecisionModel>);

export const PerformanceOptimizationGMD: Element<gdmT.IGenericDecisionModel> = (
    <GenericDecisionModel
        name="Performance optimization - gdm"
        description="This is a generic decision model for performance optimization"
        store={testStore}
    >
        <Issue name="Indexing strategies for FK" description="Indexing strategies for FK" >
            <Option name="No index" description="No index" isDefault={true} />
            <Option name="Create indexes" description="Create indexes on FK"
                newIssues={[
                    <Issue name="PK Naming convention" description="Primary Key Naming convention" >
                        <Option name="No prefix or suffix" description="No prefix or suffix" isDefault={true} />
                        <Option name="Add prefix" description="Add prefix" />
                        <Option name="Add suffix" description="Add suffix" />
                    </Issue>,
                    <Issue name="FK Naming convention" description="Foreign Key Naming convention" >
                        <Option name="ByRole" description="Named After Role Name " isDefault={true} />
                        <Option name="ByPK" description="Named After Primary Key from Origin Table" />
                    </Issue>
                ]} />
        </Issue>
    </GenericDecisionModel>
);

const m1: gdmT.IGenericDecisionModel = NamingConventionGDM.render(context);
const m2: gdmT.IGenericDecisionModel = PerformanceOptimizationGMD.render(context);

console.log("m1", m1);