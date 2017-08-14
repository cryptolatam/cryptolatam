import CryptoLATAMError from "@cryptolatam/error";

import * as money from "../src";

describe("render", () => {
  it("renders null money", () => {
    expect(money.render(null)).toEqual("-");
    expect(money.render(undefined)).toEqual("-");
    expect(money.render(null, { unit: "USD" })).toEqual("- USD");
    expect(money.render([null, "USD"])).toEqual("- USD");
  });

  it("renders money", () => {
    expect(money.render([10, "USD"])).toEqual("10 USD");
    expect(money.render([10, "USD"], { format: "$0,0.000", symbol: "$" })).toEqual("$10.000 USD");
    expect(money.render([10, "USD"], { format: "$0,0.000", symbol: null })).toEqual("10.000 USD");
    expect(money.render([10, "USD"], { format: "$0,0.000" })).toEqual("10.000 USD");
    expect(money.render([10.001, "USD"], { digits: 3 })).toEqual("10.001 USD");
  });

  it("throws", () => {
    expect(() => {
      money.render({});
    }).toThrow(CryptoLATAMError);
    expect(() => {
      money.render(NaN);
    }).toThrow(CryptoLATAMError);
  });
});
