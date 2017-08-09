import CryptoMKT from "../src";

describe("CryptoMKT", () => {
  it("subscribes", async () => {
    expect(CryptoMKT).toBeTruthy();
    const service = new CryptoMKT({
      store: new Map(),
    });
    const data = await service.start().first().toPromise();
    expect(data).toBeTruthy();
  });
});
