"use strict";

import axios from "axios";

import Rx from "rxjs";

import { parse } from "@cryptolatam/money";

export default class SurBTC {
  constructor() {
    this.client = axios.create({
      baseURL: "https://www.surbtc.com/api/v2/",
      timeout: 3000,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
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
