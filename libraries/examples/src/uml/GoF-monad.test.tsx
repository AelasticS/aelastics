/*
 * Author: Sinisa Neskovic
 * Copyright (c) 2023 Aelastics
 */
/** @jsx hm */

import { MonadicFunction, ModelM, makeMonadic, hm, ModelMonad } from "aelastics-synthesis"
import {Go4Monad} from "./GoF-monad"
import * as uml from "./uml.jsx-comp"
import * as umlT from "./uml.meta.model.type"
import { IAbstractFactoryParams, IObserverParams, ISingletonParams } from "./GoF-patterns"
import * as p from "./GoF-patterns"

const initCD = (
    <uml.ClassDiagram name="TestUmlCD">
        <uml.Class name = "Subject"></uml.Class>
        <uml.Class name = "Subject1"></uml.Class>
        <uml.Class name = "Subject2"></uml.Class>
        <uml.Class name = "Observer"></uml.Class>
        <uml.Class name = "Observer1"></uml.Class>
        <uml.Class name = "Observer2"></uml.Class>
        <uml.Class name = "Global"></uml.Class>
    </uml.ClassDiagram>
)

describe ("Test UML CD transformations", ()=>{
    let model:ModelM<umlT.IClassDiagram>
    let f:MonadicFunction<umlT.IClassDiagram>
    let gof:Go4Monad
    let parO:IObserverParams = {
        subject:"Subject",
        observer:"Observer",
        concreteObservers:["Observer1", "Observer2"],
        concreteSubjects:["Subject1", "Observer2"]
    }   
    let parS:ISingletonParams = {
        name:"Global",
    }  
    test ("sequence of patterns", ()=> {
        model = new ModelM(umlT.ClassDiagram, {name:"TestModel"}) 
        ModelMonad.of(model)
            .apply(makeMonadic(p.Observer(parO)))
            .apply(makeMonadic(p.Singleton(parS)))

    })

})

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
        name:"Subject"
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
