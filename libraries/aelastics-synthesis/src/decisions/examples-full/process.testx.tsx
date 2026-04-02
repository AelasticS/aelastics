/** @jsx createExprNode */

import { createExprNode } from "../../jsx/handle"
import { Context } from "../../jsx/context"
import { ModelStore } from "../../index"

// Import our newly created models
import { createUniversityModel } from "./01-source-model"
import { createPersistenceDesignSpace } from "./02-design-space"
import { createBindingModel } from "./03-binding-model"

// Import transformation logic
import * as sm2ddm
  from "../4.source-model-2-default-configuration-model/SourceModel2DefaultConfigurationModel"
import * as dbmT from "../2.binding-model/binding-meta.model"

// Metamodel imports (needed for type assertions or store loading)
import * as eerM from "../../types-metamodel/models/eer-metamodel-aelasticTypes"
import * as etT from "../../types-metamodel/types-meta.model"
import * as eerT from "../../test/eer-model/EER.meta.model.type"

describe("Decision Process Example", () => {

  // Setup environment
  const testStore = new ModelStore()
  const context = new Context()

  // 1. Load the EER Metamodel into the store (essential so we can reference it)
  // In a real app this might be pre-loaded. Here we render the metamodel definition.
  // (Wait, is EERM.EERModel an element or a type? In existing tests it's rendered)
  // Based on `transofmation-proces.test.tsx`:
  // (eerM.EERModel.props as any).store = testStore;
  // const eerMM_et = eerM.EERModel.render(context);

  // However, existing tests seem to patch the store property. Let's try to be Cleaner.
  // Ideally we pass store in props.

  test("Full Decision Process Flow", () => {

    // --- PREPARATION ---

    // A. Render Metamodels (if needed dynamic registration)
    // For EER Metamodel
    // We need to ensure 'aelastic-EERModel' exists in the store for binding to work.
    // Assuming eerM.EERModel is the definition.

    // Use the existing pattern from `transofmation-proces.test.tsx` for safety
    const smm = eerM.EERModel(testStore)
    const eerMetaModel = smm.render(context)

    // --- STEP 1: DEFINE DESIGN SPACE (GDM) ---
    // Create the generic decisions (Persistence strategies)
    const persistenceGDM = createPersistenceDesignSpace(testStore).render(context)
    expect(persistenceGDM).toBeDefined()
    // Register in store if not auto-registered? (render usually returns the object, handled by store?)
    // The `store={testStore}` prop on the element should handle registration.

    // --- STEP 2: DEFINE SOURCE MODEL (EER Schema) ---
    // Create the specific university model
    const universityModelEl = createUniversityModel(testStore)
    const universitySchema = universityModelEl.render(context) as eerT.IEERSchema
    expect(universitySchema.elements.length).toBeGreaterThan(0)

    // --- STEP 3: DEFINE BINDING MODEL ---
    // Map EER Types to Persistence Decisions
    const bindingModelEl = createBindingModel(testStore)
    const bindingModel = bindingModelEl.render(context) as dbmT.IBindingModel
    expect(bindingModel).toBeDefined()

    // --- STEP 4: GENERATE DECISION DOCUMENT (Configuration) ---
    // This transformation takes the Source Model (University) and the Binding Model
    // and produces a "Decision Document" which lists all the specific questions
    // that need to be answered for this specific university model.

    const transformation = new sm2ddm.SourceModelToDefaultConfigurationModel(testStore, { "bindingModel": bindingModel })

    // Transform the University Schema
    const decisionDocument = transformation.transform(universitySchema)

    expect(decisionDocument).toBeDefined()
    // expect(decisionDocument.items.length).toBeGreaterThan(0); (Depends on structure)

    // Log results to see what happened (in a real test we'd inspect assertions)
    // console.log("Generated Decision Document:", JSON.stringify(decisionDocument, null, 2));

    // --- STEP 5: SIMULATE ANSWERING (Optional / Future) ---
    // User would iterate over `decisionDocument.items` and select options.
    // Then another transformation would take (Source + Answers) -> Code / SQL.
  })
})
