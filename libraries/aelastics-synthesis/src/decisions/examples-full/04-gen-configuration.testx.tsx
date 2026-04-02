/** @jsx createExprNode */

import { createExprNode } from "../../jsx/handle"
import { Context } from "../../jsx/context"
import { ModelStore } from "../../index"
import { IModel } from "generic-metamodel"
import * as dbmT from "../2.binding-model/binding-meta.model"
import * as sm2ddm
  from "../4.source-model-2-default-configuration-model/SourceModel2DefaultConfigurationModel"
import { DecisionModel } from "../1.decision-model/decision-meta.model"

// Import the specific examples
import { createUniversityModel } from "./01-source-model"
import { createPersistenceDesignSpace } from "./02-design-space"
import { createBindingModel } from "./03-binding-model"
import * as eerM from "../../types-metamodel/models/eer-metamodel-aelasticTypes"

const testStore = new ModelStore()
const context = new Context()

describe("Generate Default Configuration for University Model", () => {

  it("should generate a default decision model based on binding and design space", () => {
    // Debug: Check objectClassification
    console.log("GenericDecisionModel objectClassification:", (DecisionModel as any).objectClassification);

    const smm = eerM.EERModel(testStore);
    // 0. Render EER Metamodel (required by BindingModel references)
    const eerMetamodel = smm.render(context)
    expect(eerMetamodel).toBeDefined()

    // Debug: Check if EER model is registered in store
    console.log("EER Metamodel name:", eerMetamodel.name)
    console.log("EER Metamodel path:", (eerMetamodel as any).path)
    const eerFromStore = testStore.getByName("//aelastic-EERModel")
    console.log("EER from store by name //aelastic-EERModel:", eerFromStore ? "found" : "not found")
    // 1. Render Design Space (GDM)
    // We need to ensure types are loaded.
    // In the example files, they import types.

    const designSpace = createPersistenceDesignSpace(testStore).render(context)
    expect(designSpace).toBeDefined()

    // 2. Render Source Model (University)
    const universityModel = createUniversityModel(testStore).render(context)
    expect(universityModel).toBeDefined()

    // 3. Render Binding Model
    const bindingModel = createBindingModel(testStore).render(context)
    expect(bindingModel).toBeDefined()

    // 4. Run Transformation
    const sm2ddmTransformation = new sm2ddm.SourceModelToDefaultConfigurationModel(
      testStore,
      { "bindingModel": bindingModel as dbmT.IBindingModel },
    )

    const defaultDecisionModel = sm2ddmTransformation.transform(universityModel as IModel)

    expect(defaultDecisionModel).toBeDefined()

    // Optional: Verify some content
    // console.log(JSON.stringify(defaultDecisionModel, null, 2));

    // Check if there are decisions for Person, Student, etc.
    // The ID of elements in source model should match elementId in decision model
    // We can check if it has children
    expect(defaultDecisionModel.elements.length).toBeGreaterThan(0)
  })

})
