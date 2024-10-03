/** @jsx hm */

import { hm } from "../jsx/handle";
import { Element } from "../jsx/element";
import * as fm from "../feature-model/fm-metamodel/fm-meta.model.type";
import {
    Attribute,
    FeatureDiagram,
    GroupFeature,
    RootFeature,
    SolitaryFeature,
} from "../feature-model/fm-metamodel/fm-components";

export const entityFMDiagram: Element<fm.IFeatureDiagram> = (
    <FeatureDiagram name="EER2Rel Entity FM">
        <RootFeature name="EER2Rel Entity Root" minCardinality={1} maxCardinality={1}></RootFeature>
    </FeatureDiagram>
);

export const attributeFMDiagram: Element<fm.IFeatureDiagram> = (
    <FeatureDiagram name="EER2Rel Attribute FM">
        <RootFeature name="EER2Rel Attr Root" minCardinality={1} maxCardinality={1}></RootFeature>

    </FeatureDiagram>
);

// if size smaller then 10, use given domain, otherwise text
export const domainFMDiagram: Element<fm.IFeatureDiagram> = (
    <FeatureDiagram name="EER2Rel Domain FM">
        <RootFeature name="EER2Rel Domain Root" minCardinality={1} maxCardinality={1}>
            <Attribute name="size" type="number"></Attribute>
        </RootFeature>
    </FeatureDiagram>
);

export const relationshipFMDiagram: Element<fm.IFeatureDiagram> = (
    <FeatureDiagram name="EER2Rel Relationship FM">
        <RootFeature name="EER2Rel Relationship Root" minCardinality={1} maxCardinality={1}>
            <Attribute name="numberOfInstances" type="number"></Attribute>
        </RootFeature>
    </FeatureDiagram>
);