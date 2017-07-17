import SurBTC from "../src";

describe("SurBTC", () => {
  it("exists", async () => {
    expect(SurBTC).toBeTruthy();
    const mkt = new SurBTC();
    let candle = null;
    candle = await mkt.getCandle("BTC", "CLP");
    expect(candle).toBeTruthy();
    candle = await mkt.getCandle("ETH", "CLP");
    expect(candle).toBeTruthy();
  });
});
