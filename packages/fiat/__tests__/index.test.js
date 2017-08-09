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

    // data = await fiatService.start("5 sec", { source: "CLP" }).first().toPromise();
    // expect(data).toBeTruthy();
    // expect(data["CLP"]["rate"]).toEqual([1, "CLP"]);
  });
});
