import * as r from "../aelastics-result"

/**
 * Test Failure
 */
describe("Test aelastics-result framework", () => {

  test("success and isSuccess", () => {
    const res = r.success(1)
    expect(r.isSuccess(res)).toBeTruthy()
  })

  it("should confirm that this is a failure", () => {
    const res = r.failure(new r.ServiceError("ValidationError","test"))
    expect(r.isFailure(res)).toBeTruthy()
  })


})
