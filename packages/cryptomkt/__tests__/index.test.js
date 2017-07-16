import CryptoMKT from "../src";

describe("CryptoMKT", () => {
  it("exists", async () => {
    expect(CryptoMKT).toBeTruthy();
    const mkt = new CryptoMKT();
    const candle = await mkt.getCandle();
    expect(candle).toBeTruthy();
  });
});
