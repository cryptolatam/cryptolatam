"use strict";

import axios from "axios";
import ms from "millisecond";
import Rx from "rxjs";

// import CryptoLATAMError from "@cryptolatam/error";
import { parse } from "@cryptolatam/money";

export default class CoinService {
  static get defaults() {
    return {
      baseURL: "https://www.coincap.io/",
      timeout: 3000,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };
  }

  constructor({ key, store } = {}, options) {
    this.name = "CoinCap";
    this.key = key || "coincap:data";
    this.store = store;
    this.options = Object.assign(this.constructor.defaults, options);
    this.client = axios.create(this.options);
  }

  async fetch() {
    const result = {};

    const { data } = await this.client.get("/front");
    for (const object of data) {
      const code = object["short"].toUpperCase();
      result[code] = {
        code,
        name: object["long"],
        supply: parse(object["supply"], code),
        volume: parse(object["volume"], code),
        rate: parse(object["price"], "USD"),
        cap: parse(object["mktcap"], "USD"),
        change: object["perc"],
      };
    }
    return result;
  }

  observe(interval, options = {}) {
    return Rx.Observable.interval(interval).startWith(0).mergeMap(() => this.fetch(options));
  }

  start(interval = "10 minutes", options = {}) {
    return this.observe(ms(interval), options).do(data => this.store.set(this.key, data));
  }

  async get() {
    return await this.store.get(this.key);
  }
}
