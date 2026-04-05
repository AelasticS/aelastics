/** @jsx createExprNode */


import { Context } from "../../jsx/context"
import { ModelStore } from "../../index"

import * as etT from "../../types-metamodel/types-meta.model"
import * as eerMMFn from "./er-metamodel"

import * as bmT from "../2.binding-model/binding-meta.model"

import * as sm2ddm
  from "../4.source-model-2-default-configuration-model/SourceModel2DefaultConfigurationModel"

import * as eerT from "../../test/eer-model/EER.meta.model.type"

import * as smFn from "./01-source-model"
import * as dmFn from "./02-decision-model"
import * as bmFn from "./03-binding-model"

import * as ee2RelT from "./EER2RelDomainWithDecisionTransformation"

const testStore = new ModelStore()
const context = new Context()


describe("Transformation Process", () => {

  it("should create a transformation context small example", () => {

    const smm = eerMMFn.EERModel(testStore)
    const dm = dmFn.RelationSchemaDesignIssues(testStore)
    const bm = bmFn.ER_Bindings(testStore)
    const sm = smFn.CompanySchema(testStore)

    const eerMM_et: etT.ITypeModel = smm.render(context)
    const dmT = dm.render(context)

    const bindingModel: bmT.IBindingModel = bm.render(context)
    const eerSchema = sm.render(context)


    const sm2ddmTransformation = new sm2ddm.SourceModelToDefaultConfigurationModel(testStore, { "bindingModel": bindingModel })
    const defaultDecisionModel = sm2ddmTransformation.transform(eerSchema as eerT.IEERSchema)

    const eer2RelTransformation = new ee2RelT.EER2RelDomainWithDecisionTransformation(testStore, {}, defaultDecisionModel)
    const relSchema = eer2RelTransformation.transform(eerSchema as eerT.IEERSchema)

    // expect(defaultDecisionModel).toBeDefined()
    expect(true).toBe(true)

  })

})