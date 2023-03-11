import * as jsx from "./jsx-elements"
import * as t from "aelastics-types"
import {Trans as tr} from "aelastics-types"

const builder = new tr.TransformerBuilder()

const transform2JSX = builder
.onInit(
    new tr.InitBuilder()
    .onTypeCategory("Object", (v, c) => { 
        v = new jsx.Complex_JSX_Element(c.type.name)
        return [v, "continue"];
    })
    .onTypeCategory("Array", (v, c) => { 
        // v = c.parent?.acc
        return [v, "continue"];
    })
    .build()
)
.onStep(
    new tr.StepBuilder()
    .onTypeCategory("Object", (v, i, c) => { 
        if(v instanceof jsx.Complex_JSX_Element) {
            v.addsubElement(i)
        }
        return [v, "continue"];
    })
    .onTypeCategory("Simple", (v, i, c) => { 
        if(v instanceof jsx.Complex_JSX_Element && c instanceof t.Node && c.extra.propName) {
            v.addProperty(c.extra.propName, new jsx.Simple_JSX_Element(i))
        }
        return [v, "continue"];
    })
    .onTypeCategory("Array", (v, i, c) => { 
        return [v, "continue"];
    })
    .build()
)
.onResult(
    new tr.ResultBuilder()
    .onTypeCategory("Object", (v, c) => { 
        return [v, "continue"];
    })
    .onTypeCategory("Array", (v, c) => { 
        return [v, "continue"];
    })
    .build()
)
.build() 



 export const make = (objType:t.ObjectType<any,any>, obj:t.ObjectLiteral): jsx.JSX_Element => {
        // create transformer to JSX model
        let transduser = tr.transducer()
        .recurse("makeItem")
        .do(transform2JSX)
        .doFinally(tr.identityReducer());
        // execute transformer
        return objType.transduce(transduser, obj)
    }
