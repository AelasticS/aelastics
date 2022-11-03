import * as r from "../aelastics-result"

/**
 * Test Failure
 */
describe("Test instanceof 2", () => {

/*
  let m = () => {
    // @ts-ignore
    throw new r.MyError('ValidationError')
  }
  it("works if true extends Error", () => {
    // @ts-ignore
    expect(m).toThrowError(r.MyError)
  })
*/

  const f = ():void => {
    throw new r.ServiceError('ValidationError' , "test validation")
  }
  it("should recognize instance of ServiceError", () => {
    expect(f).toThrowError(r.ServiceError)
  })


})
