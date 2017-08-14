import dotenv from "dotenv";

import FiatService from "../src";

import * as money from "@cryptolatam/money";

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
    expect(data["CLP"]["rate"][1]).toEqual("USD");
  });

  it("converts", async () => {
    const fiatService = createService();
    await fiatService.start("1 sec").first().toPromise();

    const results = money.convert(await fiatService.get(), [1000, "CLP"], ["USD", "BRL", "CLP"]);
    expect(results[2]).toEqual([1000, "CLP"]);
  });
});
