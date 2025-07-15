/** @jsx hm */


import { hm } from "../../jsx/handle";
import { Element } from "../../jsx/element";

import { Context } from "../../jsx/context";
import { ModelStore } from '../../index';

import * as etT from "../../types-metamodel/types-meta.model";
import * as eerM from "../../types-metamodel/models/eer-metamodel-aelasticTypes";

import * as dbmT from "../2.decision-binding-model/decision-binding-meta.model";
import * as dbme from "./decision-binding-model-example";

import * as gdmM from "./generic-decision-model-example"

import * as sm2smwdbmT from "../3.source-model-2-decision-binding-for-source/sourceModelToSourceModelWithDecisionModelBinding";
import * as sm2ddm from "../5.source-model-2-decision-model/SourceModel2DefaultDecisionDocument";

import * as eerT from "../../test/eer-model/EER.meta.model.type";
import * as eerModel from "./eer-model-example.testx"

const testStore = new ModelStore();
const context = new Context();



describe("Transformation Process", () => {

    it("should create a transformation context", () => {

        (eerM.EERModel.props as any).store = testStore;
        (gdmM.NamingConventionGDM.props as any).store = testStore;
        (dbme.bindingModel(testStore).props as any).store = testStore;
        (eerModel.eerSchema1.props as any).store = testStore;

        const eerMM_et: etT.ITypeModel = eerM.EERModel.render(context);
        const namingConventionGDM = gdmM.NamingConventionGDM.render(context);

        const bindingModel = dbme.bindingModel(testStore).render(context);
        const eerSchema = eerModel.eerSchema1.render(context);



        const sm2smwdbmTransformation = new sm2smwdbmT.SourceModelToSourceModelWithDecisionModelBinding(testStore, { 'bindingModel': bindingModel as dbmT.IDecisionBindingModel });
        const sourceBindingModel = sm2smwdbmTransformation.transform(eerSchema as eerT.IEERSchema);

        const sm2ddmTransformation = new sm2ddm.SourceModelToDefaultDecisionDocument(testStore, { 'bindingModel': bindingModel });
        const defaultDecisionModel = sm2ddmTransformation.transform(eerSchema as eerT.IEERSchema);

        expect(sourceBindingModel).toBeDefined();



    });

});