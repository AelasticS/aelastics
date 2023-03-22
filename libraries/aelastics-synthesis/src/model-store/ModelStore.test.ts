import exp from "constants"
import { Context } from '../index'
import { ModelStore, AccessProtocol } from "./ModelsStore"

describe ("It should import namespaces and models", ()=> {
    it("should import namespace", async ()=> {
        const store:ModelStore = new ModelStore()
        const ctx:Context = new Context()
        ctx.pushStore(store)
        const res = await store.importNamespace(AccessProtocol["jsx-file"] ,"./model-for-import-1.tsx", ctx)
        expect (res).toBeDefined()
        debugger;
        const resJSX = store.exportToJSX(res)
        expect (resJSX).toBeDefined()
    })

    
//     it("should throw error when importing an element not a model or namespace", async ()=> {
//         const store:ModelStore = new ModelStore()
//         const ctx:Context = new Context()
//         ctx.pushStore(store)
//         expect (store.importNamespace(AccessProtocol["jsx-file"] ,"./model-for-import-2.tsx", ctx)).rejects.toThrowError(Error)

//    })

})