import exp from "constants"
import { Context } from "./context"
import { ModelStore } from "./ModelsStore"

describe ("It should import namespaces and models", ()=> {
    it("should import namespace", async ()=> {
        const store:ModelStore = new ModelStore()
        const ctx:Context = new Context()
        ctx.pushStore(store)
        const res = await store.importNamespace("./model-for-import-1.tsx", ctx)
        expect (res).toBeDefined()
    })

    
    it("should throw error when importing an element not a model or namespace", async ()=> {
        const store:ModelStore = new ModelStore()
        const ctx:Context = new Context()
        ctx.pushStore(store)
        expect (store.importNamespace("./model-for-import-2.tsx", ctx)).rejects.toThrowError(Error)

   })

    // it("should throw error when importing an element not a model or namespace", async ()=> {
    //     const store:ModelStore = new ModelStore()
    //     const ctx:Context = new Context()
    //     ctx.pushStore(store)
    //     expect (async ()=>await store.importNamespace("./model-for-import-2.tsx", ctx)).toThrowError(Error)
    // })

    // async () => {
    //     expect.assertions(1);
    //     try {
    //       await user.getUserName(1);
    //     } catch (e) {
    //       expect(e).toEqual({
    //         error: 'User with 1 not found.',
    //       });
    //     }
    //   }
})