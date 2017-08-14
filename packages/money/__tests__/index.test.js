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

describe("convert", () => {
  it("converts coins", () => {
    const data = {
      BTC: { rate: [4000, "USD"] },
      CLP: { rate: [0.0015429718207550128, "USD"] },
    };
    const result = money.convert(data, [2700000 * 2, "CLP"], "BTC");
    expect([Math.floor(result[0]), result[1]]).toEqual([2, "BTC"]); // Round result.
  });

  it("converts coins not using USD", () => {
    const data = {
      BTC: { rate: [2700000, "CLP"] },
      CLP: { rate: [0.0015429718207550128, "USD"] },
    };
    const result = money.convert(data, [2700000 * 2, "CLP"], "BTC");
    expect(result).toEqual([2, "BTC"]);
  });

  it("converts coins inverted", () => {
    const data = {
      BTC: { rate: [2700000, "CLP"] },
      CLP: { rate: [3.7037037037037036e-7, "BTC"] },
    };
    const result = money.convert(data, [2700000 * 2, "CLP"], "BTC");
    expect(result).toEqual([2, "BTC"]);
  });
});
