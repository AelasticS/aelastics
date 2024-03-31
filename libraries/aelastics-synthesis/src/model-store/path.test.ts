import { doParseURL, PathType } from "./path";


describe("should correctly parse URL strings", ()=>{

    it("should correctly parse absolute path with protocol", ()=> {
        const path = "jsx-file://www.aelastics.com/n1/n2"; // absolute path with protocol
        const [type, segments] = doParseURL(path)
        expect( type === PathType.ABS_PROTOCOL)
    })

    it("should correctly parse absolute path without protocol", ()=> {
        const path = "//aelastics.com/n1/n2"; // absolute path without protocol
        const [type, segments] = doParseURL(path)
        expect( type === PathType.ABS_NO_PROTOCOL)
    })

    it("should correctly parse relative path with name", ()=> {
        const path = "../../n2"; // relative path with name
        const [type, segments] = doParseURL(path)
        expect( type === PathType.REL_NAME)
    })

    it("should correctly parse relative path with name", ()=> {
        const path = "n0/n1/n2"; // 
        const [type, segments] = doParseURL(path)
        expect( type === PathType.REL_NAME)
    })

    it("should correctly parse relative path with point", ()=> {
        const path = "./n0/n1/n2"
        const [type, segments] = doParseURL(path)
        expect( type === PathType.REL_POINT)
    })

    it("should correctly parse relative path with slash", ()=> {
        const path = "/n1/n2";
        const [type, segments] = doParseURL(path)
        expect( type === PathType.REL_SLASH)
    })
})

describe("should detect bad URL strings", ()=>{
    it("should throw error on emty url", ()=> {
        const path = " "; // empty path
        expect(()=>doParseURL(path)).toThrow(Error)
    })
})