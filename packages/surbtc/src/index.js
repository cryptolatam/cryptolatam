"use strict";

import axios from "axios";
import ms from "millisecond";
import Rx from "rxjs";

import CryptoLATAMError from "@cryptolatam/error";
import { parse } from "@cryptolatam/money";

export default class SurBTC {
  static get defaults() {
    return {
      baseURL: "https://www.surbtc.com/api/v2/",
      timeout: 3000,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };
  }

  constructor({ key, store } = {}, options) {
    this.name = "SurBTC";
    this.key = key || "surbtc:data";
    this.store = store;
    this.options = Object.assign(this.constructor.defaults, options);
    this.client = axios.create(this.options);
  }

  async fetch(options = {}) {
    const exchanges = options.exchanges || [["BTC", "CLP"], ["BTC", "COP"], ["ETH", "CLP"]];

    const promises = exchanges.map(async pairs => {
      const exchange = pairs.join("-").toLowerCase();
      const { data } = await this.client.get(`/markets/${exchange}/ticker`);
      data["exchange"] = pairs;
      return data;
    });
    return Promise.all(promises);
  }

  observe(interval, options = {}) {
    return Rx.Observable
      .interval(interval)
      .startWith(0)
      .mergeMap(() => this.fetch(options))
      .map(response => {
        if (response.every(res => res["ticker"])) {
          return response;
        } else {
          throw new CryptoLATAMError("Error quering SurBTC.", response);
        }
      })
      .map(response => {
        const data = {
          name: this.name,
          markets: { result: [], data: {} },
        };
        for (const market of response) {
          const [coin, fiat] = market["exchange"];
          if (!data.markets.result.includes(coin)) {
            data.markets.result.push(coin);
            data.markets.data[coin] = { result: [], data: {} };
          }

          const ticker = market["ticker"];
          const current = {
            ask: parse(...ticker["min_ask"]),
            bid: parse(...ticker["max_bid"]),
            volume: parse(...ticker["volume"]),
          };
          const candle = null;

          data.markets.data[coin].result.push(fiat);
          data.markets.data[coin].data[fiat] = { current, candle };
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
