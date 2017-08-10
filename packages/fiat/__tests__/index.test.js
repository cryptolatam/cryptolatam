import dotenv from "dotenv";

import FiatService from "../src";

function createService() {
  return new FiatService({
    store: new Map(),
    apiKey: process.env["CURRENCYLAYER__KEY"],
  });
}

describe("FiatService", () => {
  beforeAll(() => {
    dotenv.config();
  });

  it("subscribes", async () => {
    const fiatService = createService();

    const data = await fiatService.start("1 sec").first().toPromise();
    expect(data).toBeTruthy();
    expect(data["USD"]["rate"]).toEqual([1, "USD"]);
  });

  it("converts", async () => {
    const fiatService = createService();
    await fiatService.start("1 sec").first().toPromise();
    let results;

    results = await fiatService.convert([1000, "CLP"], ["USD", "BRL", "CLP"]);
    expect(results[2]).toEqual([1000, "CLP"]);

    results = await FiatService.convert(await fiatService.get(), [1000, "CLP"], ["USD", "BRL", "CLP"]);
    expect(results[2]).toEqual([1000, "CLP"]);
  });
});
