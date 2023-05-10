/*
 * Author: Sinisa Neskovic
 * Copyright (c) 2023 Aelastics
 */
/** @jsx hm */
import {  hm } from '../jsx/handle'
import { EERSchema, IEERSchema, Kernel } from "../test/eer-model/EER.meta.model.type"
import { ModelMonad, MonadicFunction, ModelM, makeMonadic } from "./model-monad"
import * as e from '../test/eer-model/EER-components'

describe("Test model monad", () => { 
    let model:ModelM<IEERSchema>
    let f:MonadicFunction<IEERSchema>

    beforeEach(()=> {
        model = new ModelM(EERSchema, {name:"TestModel"}) 
        f = makeMonadic(<e.Attribute name="PersonName"/>)
    })
    test ("left identity law", ()=>{ 
        let leftIdentity = () => ModelMonad.of(model).apply(f) === f(model)
        expect(leftIdentity).toThrowError("Duplicate name")
    })
    test ("right identity law", ()=>{
        let m = ModelMonad.of(model)
        expect(m.apply((m) => ModelMonad.of(m)).equal(m))
    })
    test ("associative law", ()=>{  // it shouldn’t matter how f and g are nested
        let f = makeMonadic(<e.Attribute name="Name"/>)
        let g = makeMonadic(<e.Attribute name="ID"/>)

        let m = ModelMonad.of(model)
        
        let assocLaw = () => m.apply(f).apply(g) === m.apply(m=> f(m).apply(g))
        
        expect(assocLaw).toThrowError("Duplicate name")
    })
})

