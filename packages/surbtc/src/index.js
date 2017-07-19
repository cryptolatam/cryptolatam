"use strict";

import axios from "axios";

import Rx from "rxjs";

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

  constructor(options = {}) {
    this.options = Object.assign(this.constructor.defaults, options);
    this.client = axios.create(this.options);
  }

  watchCandle(interval = 1000, opts = {}) {
    return Rx.Observable.interval(interval).mergeMap(() => this.getCandle(opts));
  }

  async getCandle(market = "BTC", currency = "CLP") {
    const id = [market, currency].map(string => string.toLowerCase()).join("-");
    const response = await this.client.get(`/markets/${id}/ticker`);

    const ticker = response.data["ticker"];
    const current = {
      ask: parse(...ticker["min_ask"]),
      bid: parse(...ticker["max_bid"]),
      volume: parse(...ticker["volume"]),
    };

    return { current };
  }
}
