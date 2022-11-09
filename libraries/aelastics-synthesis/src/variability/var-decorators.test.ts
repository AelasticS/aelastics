import {VarOption, VarPoint} from "./var-decorators"

describe("Test  variability decorators", () => {

    it("tests VarPoint and VarOption", () => {
        class MyClass {

            // constructor(readonly fmConfig:any){

            // }

            @VarPoint("one")
            myVarMethod(a:number) {
                return a+1;
            }

            @VarOption("myVarMethod",()=>false, true)
            myOption1(a:number) {
                return a+1;
            }   

            @VarOption("myVarMethod",(a)=>true, false)
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
