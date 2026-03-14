import {VarOption, VarPoint} from "./var-decorators"
import { Option } from "./eval-operators"

describe("Test  variability decorators", () => {

    it("tests VarPoint and VarOption", () => {
        class MyClass {

            // constructor(readonly fmConfig:any){

            // }

            @VarPoint('Issue')
            myVarMethod(a:number) {
                return a+1;
            }

            @VarOption("myVarMethod", Option('nekiOption'))
            myOption1(a:number) {
                return a+1;
            }   

            @VarOption("myVarMethod",Option('nekiOption2'))
            myOption2(a:number) {
                return a*100;
            } 
        }
        let m = new MyClass()
        let b = m.myVarMethod(2)
        expect(b===200).toBeTruthy()
    })
  
 })

 const genTransform = (f1:()=>boolean, f2:()=>boolean) => {
    return class MyClass {

        // @VarOption("myVarMethod",()=>true, false)
        myVarMethod(a:number) {
            return f1();
        }
    }
 }

 let novaKlasa = genTransform(()=>false,()=>false)
 let o = new novaKlasa()

 o.myVarMethod
