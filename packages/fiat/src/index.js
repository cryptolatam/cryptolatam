import axios from "axios";
import ms from "millisecond";
import Rx from "rxjs";

import CryptoLATAMError from "@cryptolatam/error";
import { parse } from "@cryptolatam/money";

import currencies from "./data/currencies";

export default class FiatService {
  constructor({ apiKey, key, store } = {}) {
    this.key = key || "fiatservice:currencies";
    this.apiKey = apiKey;
    this.store = store;
    this.observer = null;
    this.client = axios.create({
      baseURL: "http://apilayer.net/api/",
    });
  }

  async fetch(options) {
    const params = Object.assign(
      {
        access_key: this.apiKey,
        source: "USD",
        currencies: Object.keys(currencies).join(","),
        format: 1,
      },
      options
    );
    const { data } = await this.client.get("/live", {
      params,
    });
    return data;
  }

  observe(interval, options) {
    return Rx.Observable
      .interval(interval)
      .startWith(0)
      .mergeMap(() => this.fetch(options))
      .map(response => {
        if (response["success"]) {
          return response;
        } else {
          throw new CryptoLATAMError("Error quering apilayer.net", response);
        }
      })
      .map(response => {
        const source = response["source"]; // equal to options["source"]
        const data = {};
        for (const [currency, value] of Object.entries(response["quotes"])) {
          const code = currency.replace(source, "");
          const rate = parse(value, code);
          const meta = currencies[code];
          if (meta) {
            data[code] = Object.assign({}, meta, { rate });
          }
        }
        return data;
      });
  }

  start(interval = "10 minutes", options = {}) {
    return this.observe(ms(interval), options).do(data => this.store.set(this.key, data));
  }

  async get() {
    return await this.store.get(this.key);
  }
}
