"use strict";

import axios from "axios";
import ms from "millisecond";
import Rx from "rxjs";

import CryptoLATAMError from "@cryptolatam/error";
import { parse } from "@cryptolatam/money";

import currencies from "./data/currencies";

export default class FiatService {
  static get defaults() {
    return {
      baseURL: "http://apilayer.net/api/",
      timeout: 3000,
    };
  }

  static get currencies() {
    return currencies;
  }

  constructor({ apiKey, key, store } = {}, options) {
    this.apiKey = apiKey;
    this.key = key || "fiatservice:currencies";
    this.store = store;
    this.options = Object.assign(this.constructor.defaults, options);
    this.client = axios.create(this.options);
  }

  async fetch(options = {}) {
    const params = {
      access_key: this.apiKey,
      source: options.from || "USD",
      currencies: Object.keys(options.to || currencies).join(","),
      format: 1,
    };
    const { data } = await this.client.get("/live", {
      params,
    });
    return data;
  }

  observe(interval, options = {}) {
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
