/** @jsx hm */
/*
 * Copyright (c) AelasticS 2022.
 */

import { hm } from "../jsx/handle";
import * as t from "aelastics-types";
import * as g from "generic-metamodel";
import {
  M2M_Transformation,
  E2E_Transformation,
  M2M_Trace,
  E2E_Trace,
} from "./transformation.model.components_v2";
import { abstractM2M, IM2M } from "./abstractM2M";
import { IModel } from "generic-metamodel";
import { CpxTemplate, Element } from "../jsx/element";
import { AnySchema } from "aelastics-types/lib/annotations/Annotation";
import { Sec } from "../m2t";

export interface IM2MDecorator {
  input: t.Any;
  output: t.Any;
}
export interface IE2EDecorator {
  input: t.Any;
  output: t.Any;
}

type M2M_Ctor = {
  new (s: string): abstractM2M<any, any>;
};

// type Class<T = any> =  abstract new (...args: any[]) => T;

// function DecoratorName(attr: any) {
//     return function _DecoratorName<T extends Class<abstractM2M<any, any>>>(constr: T){
//       return abstract class extends constr {
//         public transform(): STX.Child<any> {
//             throw new Error('Method not implemented.')
//         }
//         constructor(...args: any[]) {
//           super(...args)
//           console.log('Did something after the original constructor!')
//           console.log('Here is my attribute!', attr.attrName)
//         }
//       }
//     }
//   }

type Class<T = any> = new (...args: any[]) => T;

export const M2M = ({ input, output }: IM2MDecorator) => {
  return function <T extends Class<IM2M<any, any>>>(target: T) {
    //return function _M2M<T extends new (...args:any[]) => abstractM2M<any, any>>(target: T){
    return class extends target {
      constructor(...args: any[]) {
        super(...args);
        // remember input and output model schemas
        this.context.input.type = input;
        this.context.output.type = output;
      }
    };
  };
};

// // class descriptor  { input, output }: IM2MDecorator
export const M2M_v0 = ({ input, output }: IM2MDecorator) => {
  return function <T extends abstractM2M<any, any>>(
    target: new (...args: any[]) => T
  ): new (...args: any[]) => T {
    // save a reference to the original constructor
    const original = target;
    // a utility function to generate instances of a class
    function construct(constructor: new (...args: any[]) => T, args: any[]): T {
      const c: any = function () {
        // @ts-ignore
        return constructor.apply(this, args);
      };
      c.prototype = constructor.prototype;
      let obj = new c();
      return obj;
    }
    // the new constructor behaviour
    const f: any = function (...args: any[]) {
      let tr = construct(original, args);
      // remeber input and output model schemas
      tr.context.input.type = input;
      tr.context.output.type = output;
      return tr;
    };

    // copy prototype so instanceof operator still works
    f.prototype = original.prototype;

    // return new constructor (will override original)
    return f;
  };
};
// // class descriptor v2
// // export const M2M = ({ input, output }: IM2MDecorator) => {
// //    return function (target: Function) {
// //     console.log(`New transformation "${target['name']}" from "${input}" to "${output}" is created`);

// //     let tr = <M2M_Transformation from={input.name} to={output.name} />

// //   }
// // }

// export const M2M_v1 = ({ input, output }: IM2MDecorator) => {
//     return function<T extends abstractM2M<any,any>> (target: new (...args:any[]) => T): new (...args:any[]) => T {
//         // save a reference to the original constructor
//         const original = target;
//         // a utility function to generate instances of a class
//         function construct(constructor: new (...args:any[]) => T, args: any[]):T {
//             const c: any = function () {
//                 // @ts-ignore
//                 return constructor.apply(this, args);
//             }
//             c.prototype = constructor.prototype;
//             let obj = new c();
//             return obj
//         }
//         // the new constructor behaviour
//         const f: any = function (...args: any[]) {
//             // console.log(`New transformation "${original['name']}" from "${input.name}" to "${output.name}" is created`);
//             console.log(`New transformation "${original['name']}" from "${input}" to "${output}" is created`);

//             let tr = construct(original, args);
//             return tr
//         }

//         // copy prototype so instanceof operator still works
//         f.prototype = original.prototype;

//         // return new constructor (will override original)
//         return f;
//     }
// }

// method descriptor
export const E2E = function ({ input, output }: IE2EDecorator) {
  return function (
    target: abstractM2M<IModel, IModel>,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    // find or create E2E_Transformation
    let trE2E = (
      <E2E_Transformation fromType={input.name} toType={output.name} />
    );
    // set transformation type
    target.m2mTRansformation = trE2E;
    // save a reference to the original function
    const original = descriptor.value;
    // set the new function
    descriptor.value = function (this: abstractM2M<any, any>, ...args: any[]) {
      let a = args[0];
      let r = original.apply(this, args) as Element<any>;
      // r.create
      // let tr =
      // <E2E_Transformation $ref_id={trE2E.id}>
      //     <E2E_Trace from={a.id} to={ a.id /*r.id*/}/>
      // </E2E_Transformation>

      this.context.makeTrace(a.name, { type: r.type, name: r.name });

      return r;
    };
    return descriptor;
  };
};

// export const Polymorphic = 1
// @Rule("rule1", "card is") @Extends()

// export const ExtendsE2E = (m:Function, type:string) =>{
//     return function  (target:any, key: string, value: any) {
//         return {
//           value: function (...args: any[]) {
//             let a = args.map(a => JSON.stringify(a)).join();
//             let result = value.value.apply(this, args);
//             let r = JSON.stringify(result);
//             console.debug(`"${key}": (${a}) => ${r}`);
//             return result;
//           }
//         // };
//       }
// }

//   const M2M = (method, { kind, name }) => {
//     if (kind === "method") {
//         return  (...args) => {
//             console.log(`Called ${name} (${args[0].name})`);
//             try {
//                 const result = method.apply(this, args);
//                 console.log(`Return value ${result.name}`);
//                 return result;
//             } catch (e) {
//                 console.log(`Error: ${e}`);
//                 throw e;
//             }
//         }
//     }
// }

// const deprecated = (deprecationReason: string) => {
//     return (target: any, memberName: string, propertyDescriptor: PropertyDescriptor) => {
//       return {
//         get() {
//           const wrapperFn = (...args: any[]) => {
//             console.warn(`Method ${memberName} is deprecated with reason: ${deprecationReason}`);
//             propertyDescriptor.value.apply(this, args)
//           }

//           Object.defineProperty(this, memberName, {
//               value: wrapperFn,
//               configurable: true,
//               writable: true
//           });
//           return wrapperFn;
//         }
//       }
//     }
//   }
