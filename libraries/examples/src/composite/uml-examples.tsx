/** @jsx hm */
import { ModelStore, Template, hm } from "aelastics-synthesis";
import * as uml from "./uml.jsx-comp";
import { number } from "aelastics-types";

const m1 = (
  <uml.Class>
    <uml.Property multiplicity=""></uml.Property>
  </uml.Class>
);
const observer = (
  observer: string,
  subject: string,
  concreteObservers: string[],
  concreteSubjects: string[]
) => (m:ModelStore) => (
  <uml.Class $refByName={observer}>
    <uml.Property
      type={<uml.Class $refByName={subject} />}
      multiplicity="0..*"
    />
  </uml.Class>
);


type applyPattern = (f:(...args:any[]) => Template<any>) => (m:ModelStore) => Template<any>

const o = observer("", "", [], [])

// const makeMonadic:Monadic = (f) => (m) => {
//     const f1 = (m:ModelStore) => (...args: any[]) => {
//       return f(...args)
//     }
//     return f1
// }
// let c= makeMonadic(observer)


// Model.apply(observer, )


// const makeMonadic2:(f:(args:any[]) => Template<any>)=>(m:string)=> Template<any> = 
//     (f:(args:any[]) => Template<any>) => {

//     return f1
// }


const x1 = (a:number) => a

// const flip : (f:(a:number)=> number) => (m:ModelStore) => number = {
//     return (m:ModelStore) => {
//         return f(a)
//     }
// }
