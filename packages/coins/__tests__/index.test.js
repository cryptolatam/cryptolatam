import CoinService from "../src";

describe("CoinService", () => {
  it("subscribes", async () => {
    const coinService = new CoinService({
      store: new Map(),
    });

    const data = await coinService.start("1 sec").first().toPromise();
    expect(data).toBeTruthy();
    expect(data["BTC"]).toBeTruthy();
  });
});
