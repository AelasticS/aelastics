/** @jsx hm */

import {Element, ModelM, ModelMonad, makeMonadic} from "aelastics-synthesis"
import * as ut from "./uml.meta.model.type"
import * as p from "./GoF-patterns"
import { IModel } from "generic-metamodel"
import { IClassDiagram } from "./uml.meta.model.type"

export class Go4Monad {
    private genericMonad: ModelMonad<ut.IClassDiagram>
    
    static of(m:ModelM<ut.IClassDiagram>, initialCD:Element<ut.IClassDiagram>):Go4Monad {
            return new Go4Monad(m, initialCD)
    } 

    private constructor(m:ModelM<ut.IClassDiagram>, initialCD:Element<ut.IClassDiagram>) {
        this.genericMonad = ModelMonad.of(m)
        this.genericMonad.apply(makeMonadic(initialCD))
    }
    get():IClassDiagram {
        return this.genericMonad.get() as IClassDiagram
    }

    singleton(params:p.ISingletonParams) {
        let f = makeMonadic(p.Singleton(params))
        this.genericMonad.apply(f)
        return this
    }

    observer(params:p.IObserverParams) {
        let f = makeMonadic(p.Observer(params))
        this.genericMonad.apply(f)
        return this
    }

    abstractFactory (params:p.IAbstractFactoryParams) {
        let f = makeMonadic(p.AbstractFactory(params))
        this.genericMonad.apply(f)
        return this
    }

    factoryMethod (params:p.IAbstractFactoryParams) {
        let f = makeMonadic(p.AbstractFactory(params))
        this.genericMonad.apply(f)
        return this
    }
    
}