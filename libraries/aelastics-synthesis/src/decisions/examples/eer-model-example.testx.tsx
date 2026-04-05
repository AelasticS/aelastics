/** @jsx createExprNode */


import { createExprNode } from "../../jsx/handle";
import { ExprNode } from "../../jsx/element";
import * as et from "../../test/eer-model/EER.meta.model.type";
import { EERSchema, Kernel, Attribute, Domain, Relationship, OrdinaryMapping, Weak, WeakMapping } from "../../test/eer-model/EER-components";


import { Context } from "../../jsx/context";
import { ModelStore } from '../../index';

const testStore = new ModelStore();
const context = new Context();


export const eerSchema1: ExprNode<et.IEERSchema> = (
    <EERSchema name="Persons" MDA_level="M1" store={testStore}>
        <Kernel name="Person">
            <Attribute name="personId" isKey={true}>
                <Domain name="number" />
            </Attribute>
            <Attribute name="personName" isKey={false}>
                <Domain name="string" />
            </Attribute>
        </Kernel>
        <Kernel name="Organization">
            <Attribute name="organizationId" isKey={true}>
                <Domain $refByName="number" />
            </Attribute>
            <Attribute name="organizationName" isKey={false}>
                <Domain $refByName="string" />
            </Attribute>
        </Kernel>
        <Relationship name="worksIn">
            <OrdinaryMapping
                name="works_in"
                lb="0"
                ub="1"
                domain={<Kernel $refByName="Person"></Kernel>}
            ></OrdinaryMapping>
            <OrdinaryMapping
                name="has_employees"
                lb="0"
                ub="M"
                domain={<Kernel $refByName="Organization"></Kernel>}
            ></OrdinaryMapping>
        </Relationship>
        <Kernel name="City">
            <Attribute name="cityId" isKey={true}>
                <Domain $refByName="number" />
            </Attribute>
            <Attribute name="cityName" isKey={false}>
                <Domain $refByName="string" />
            </Attribute>
        </Kernel>
        <Relationship name="livesIn">
            <OrdinaryMapping
                name="lives_in"
                lb="1"
                ub="1"
                domain={<Kernel $refByName="Person"></Kernel>}

            ></OrdinaryMapping>
            <OrdinaryMapping
                name="has_residents"
                lb="0"
                ub="M"
                domain={<Kernel $refByName="City"></Kernel>}
            ></OrdinaryMapping>
        </Relationship>
        <Weak name="Child">
            <Attribute name="ChildID" isKey={true}>
                <Domain $refByName="number" />
            </Attribute>
            <Attribute name="ChildName" isKey={false}>
                <Domain $refByName="string" />
            </Attribute>
        </Weak>
        <WeakMapping
            name="PersonToChild"
            domain={<Kernel $refByName="Person"></Kernel>}
            codomain={<Weak $refByName="Child"></Weak>}
        ></WeakMapping>
    </EERSchema>
);

const m: et.IEERSchema = eerSchema1.render(context);