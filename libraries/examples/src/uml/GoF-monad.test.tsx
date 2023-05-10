/*
 * Author: Sinisa Neskovic
 * Copyright (c) 2023 Aelastics
 */
/** @jsx hm */

import { MonadicFunction, ModelM, makeMonadic, hm } from "aelastics-synthesis"
import {Go4Monad} from "./GoF-monad"
import * as uml from "./uml.jsx-comp"
import * as umlT from "./uml.meta.model.type"
import { IAbstractFactoryParams, IObserverParams, ISingletonParams } from "./GoF-patterns"

const initCD = (
    <uml.ClassDiagram name="TestUmlCD">
        <uml.Class name = "Subject"></uml.Class>
        <uml.Class name = "Subject1"></uml.Class>
        <uml.Class name = "Observer"></uml.Class>
        <uml.Class name = "Observer1"></uml.Class>
    </uml.ClassDiagram>
)
describe("Test GoF monad", () => { 
    let model:ModelM<umlT.IClassDiagram>
    let f:MonadicFunction<umlT.IClassDiagram>
    let gof:Go4Monad
    let parO:IObserverParams = {
        subject:"",
        observer:"",
        concreteObservers:[],
        concreteSubjects:[]
    }   
    let parAF:IAbstractFactoryParams = {
        subject:"",
        observer:"",
        concreteObservers:[],
        concreteSubjects:[]
    }   

    let parS:ISingletonParams = {
        subject:"",
        observer:"",
        concreteObservers:[],
        concreteSubjects:[]
    }  

    beforeEach(()=> {
        model = new ModelM(umlT.ClassDiagram, {name:"TestModel"}) 
        f = makeMonadic(<uml.Class name="Person"/>)
    })
    test ("test a sequence of patterns", ()=>{ 
        const m = Go4Monad.of(model, initCD)
            .observer(parO)
            .abstractFactory(parAF)
            .singleton(parS)
            .get()
            
        expect(m.elements).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: "Subject" }), 
            expect.objectContaining({ name: "Observer" }),
        ])
    )
    })

})
