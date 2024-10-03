/** @jsx hm */
/*
 * Copyright (c) AelasticS 2022.
 */

// const EER = getEER({} as IModel, null)

import * as fmt from "../feature-model/fm-metamodel/fm-meta.model.type";
import { FM2TypesTransformations } from "../feature-model/fm2types-transformation/fm2types-transformation";
import { ModelStore } from "../index";
import { Context } from "../jsx/context";
import { Element } from "../jsx/element";
import { hm } from "../jsx/handle";
import * as m2tmm from "../m2t/m2t-model/m2t.meta.model";
import { generate } from "../m2t/text-generation/generate";
import { Types2TextModelTransformations } from "../types-metamodel/generate-code/types2text.model-transformation";
import { Property, PropertyDomain, TypeModel, TypeObject } from "../types-metamodel/types-components";
import * as t from "../types-metamodel/types-meta.model";
import { domainFMDiagram } from "./domain-fm-model";

const generateText = async (
    store: ModelStore,
    m: m2tmm.M2T_Model,
    testNumber: number
) => {
    const res = await generate(store, m, {
        rootDir: `FM2Types2Text_${testNumber}`,
        mode: "real",
    });
};

describe('test', () => {
    it('test', async () => {
        const testStore = new ModelStore();
        const ctx = new Context();
        ctx.pushStore(testStore);

        const domainFM: fmt.IFeatureDiagram = domainFMDiagram.render(ctx);

        const fm2tTransformation = new FM2TypesTransformations(testStore);
        const fmTypes = fm2tTransformation.transform(domainFM);

        const t2tmTransfomration = new Types2TextModelTransformations(testStore);
        const textModel = t2tmTransfomration.transform(fmTypes);

        generateText(testStore, textModel, 1);

        expect(true).toBeTruthy();
    })

});

