import SurBTC from "../src";

describe("SurBTC", () => {
  it("exists", async () => {
    expect(SurBTC).toBeTruthy();
    const mkt = new SurBTC();
    const candle = await mkt.getCandle();
    expect(candle).toBeTruthy();
  });
});
