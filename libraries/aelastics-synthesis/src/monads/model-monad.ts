/*
 * Author: Sinisa Neskovic
 * Copyright (c) 2023 Aelastics
 */

import { Context } from "../jsx/context"
import { Element, Template } from "../jsx/element"
import { IModel, IModelElement } from "generic-metamodel"
import { ModelStore } from "../model-store/ModelsStore"
import * as t from "aelastics-types"

export class ModelM<M extends IModel> {
    context:Context = new Context() 
    constructor(type:t.AnyObjectType, model:Partial<M>) {
        let store = new ModelStore()
        this.context.pushStore(store)
        this.context.pushModel(store.newModel(type,model))
    }
}

export type MonadicFunction<M extends IModel> = (m:ModelM<M>) => ModelMonad<M>

export const makeMonadic = <M extends IModel, E extends IModelElement>(e:Element<E>):MonadicFunction<M> => {
    return (mm:ModelM<any>) => {
        e.render(mm.context)
        return new ModelMonad(mm)
    }
}

export class ModelMonad<T extends IModel> {
    constructor(readonly model:ModelM<T>) {
    }

   static of<T extends IModel>(mm:ModelM<T>):ModelMonad<T> {
       return new ModelMonad<T>(mm)
   }

   equal (mm:ModelMonad<T>) {return this.model === mm.model}

//    apply<E extends IModelElement>(e:Element<E>):ModelMonad<T> {
//        e.render(this.model.context)
//        return this
//    }

   apply(f:MonadicFunction<T>):ModelMonad<T> {
        return f(this.model)
}


}



/*
left-identity law:
          of(x).apply(f) == f(x)
right-identity law:
        m.apply(of) == m
associativity law:
    m.apply(f).apply(g) == m.apply(x ⇒ f(x).apply(g))


left-identity law:
    unit(x).flatMap(f) == f(x)
right-identity law:
    m.flatMap(unit) == m
associativity law:
    m.flatMap(f).flatMap(g) == m.flatMap(x ⇒ f(x).flatMap(g))

*/


