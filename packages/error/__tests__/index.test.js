import CryptoLATAMError from "../src";

describe("CryptoLATAMError", () => {
  function throwError(msg, data) {
    throw new CryptoLATAMError(msg, data);
  }

  it("throws", async () => {
    expect(throwError).toThrowError(CryptoLATAMError);
  });
});
