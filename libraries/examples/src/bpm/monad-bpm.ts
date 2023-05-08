import { Template } from "aelastics-synthesis"
import { IModelElement } from "generic-metamodel"


export class ModelM<T> {
   static of<T>():ModelM<T> {
       return new ModelM<T>
   }
   apply<E extends IModelElement>(f:()=> Template<E>):ModelM<T> {
       return this
   }
}


export class ModelE<T> {
    static of<T>():ModelE<T> {
        return new ModelE<T>
    }
    apply<E extends IModelElement>(t:Template<E>):ModelE<E> {
        return this
    }
 }

