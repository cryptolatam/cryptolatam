import dotenv from "dotenv";

import FiatService from "../src";

describe("SurBTC", () => {
  beforeAll(() => {
    dotenv.config();
  });

  it("subscribes", async () => {
    const fiatService = new FiatService({
      store: new Map(),
      apiKey: process.env["CURRENCYLAYER__KEY"],
    });

    const data = await fiatService.start("1 sec").first().toPromise();
    expect(data).toBeTruthy();
    expect(data["USD"]["rate"]).toEqual([1, "USD"]);

    const results = await fiatService.convert([1000, "CLP"], ["USD", "BRL", "CLP"]);
    expect(results[2]).toEqual([1000, "CLP"]);
  });
});
