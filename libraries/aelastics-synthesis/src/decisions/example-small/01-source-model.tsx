/** @jsx hm */

import { hm } from "../../jsx/handle";
import { ModelStore } from '../../index';
import { EERSchema, Attribute, Domain, Relationship, Role, Entity } from "../../test/eer-model/EER-components";

export const createCompanyModel = (store: ModelStore) => {
    return (
        <EERSchema name="Company" MDA_level="M1" store={store}>
            <Entity name="Person">
                <Attribute name="personId" isKey={true}>
                    <Domain name="number" />
                </Attribute>
                <Attribute name="firstName" isKey={false}>
                    <Domain name="string" />
                </Attribute>
                <Attribute name="lastName" isKey={false}>
                    <Domain name="string" />
                </Attribute>
            </Entity>

            <Entity name="Company">
                <Attribute name="companyId" isKey={true}>
                    <Domain $refByName="number" />
                </Attribute>
                <Attribute name="companyName" isKey={false}>
                    <Domain $refByName="string" />
                </Attribute>
                <Attribute name="address" isKey={false}>
                    <Domain $refByName="string" />
                </Attribute>
            </Entity>

            {/* 0:1 to 0:M Relationship: Person works in Company */}
            <Relationship name="WorksIn">
                <Role
                    name="employees"
                    lowerBound="0"
                    upperBound="M"
                    domain={<Entity $refByName="Person"></Entity>}
                />
                <Role
                    name="company"
                    lowerBound="0"
                    upperBound="1"
                    domain={<Entity $refByName="Company"></Entity>}
                />
            </Relationship>

        </EERSchema>
    );
};
