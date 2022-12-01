// https://luckylibora.medium.com/typescript-method-decorators-in-depth-problems-and-solutions-74387d51e6a

import { Any } from "aelastics-types"
import { IModelElement } from "generic-metamodel"
import { abstractM2M } from "./abstractM2M"


// https://stackoverflow.com/questions/55179461/reflection-in-javascript-how-to-intercept-an-object-for-function-enhancement-d




const __SpecPoint = "__SpecPoint"

export interface ISpecOption {
  specMethod:string,
  inputType:Any,
}


// method decorator
export const SpecPoint = (name:string) => {
    return function  (target:abstractM2M<any, any>, propertyKey: string, descriptor: PropertyDescriptor) {
        descriptor.value = function (...args: any[]) {
              const a:IModelElement = args[0]
              const aType= target.context.store.getTypeOf(a)
              const options:ISpecOption[] = descriptor.value[name]
              const option = options.find((option)=>{
                return option.inputType.isOfType(aType)
              })
              if(!option) {
                throw new Error(`No specilized method found`)
              }
              let result = (target as any)[option.specMethod](...args);
              return result;
            }
        descriptor.value[__SpecPoint] = name
        descriptor.value[name] = []
        return descriptor
    }
}

// method decorator
export const SpecOption = (methodName:string, type:Any) =>{

    return function  (target:any, propertyKey: string, descriptor: PropertyDescriptor) {
        const method:Function = target[methodName]
        // @ts-ignore
        if (method[__SpecPoint])
        {
            let o:ISpecOption = {
                specMethod: propertyKey,
                inputType: type,
            }
            // @ts-ignore
            method[method[__SpecPoint]].push(o)
        }
        return descriptor;
      }
}

