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
    GroupRootFeature,
} from "../feature-model/fm-metamodel/fm-components";

export const domainFMDiagram: Element<fm.IFeatureDiagram> = (
    <FeatureDiagram name="EER2Rel Domain FM">
        <GroupRootFeature name="Infrastructure" minCardinality={1} maxCardinality={1}>
            <SolitaryFeature name="Cloud" minCardinality={1} maxCardinality={1}></SolitaryFeature>
            <SolitaryFeature name="OnPremise" minCardinality={0} maxCardinality={1}></SolitaryFeature>
        </GroupRootFeature>
    </FeatureDiagram>
);