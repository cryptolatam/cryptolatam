import SurBTC from "../src";

describe("SurBTC", () => {
  it("subscribes", async () => {
    expect(SurBTC).toBeTruthy();
    const service = new SurBTC({
      store: new Map(),
    });
    const data = await service.start().first().toPromise();
    expect(data).toBeTruthy();
  });
});
