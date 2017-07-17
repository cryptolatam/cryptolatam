"use strict";

import axios from "axios";
import moment from "moment";
import get from "lodash/get";

import Rx from "rxjs";

import CryptoLATAMError from "@cryptolatam/error";
import { parse } from "@cryptolatam/money";

export default class CryptoMKT {
  constructor() {
    this.client = axios.create({
      baseURL: "https://www.cryptomkt.com/api/",
      timeout: 3000,
    });
  }

  watchCandle(interval = 1000, opts = {}) {
    return Rx.Observable.interval(interval).mergeMap(() => this.getCandle(opts));
  }

  async getCandle() {
    const response = await this.client.get("/ethclp/1440.json");
    const body = response.data;

    if (body["status"] !== "success") {
      throw new CryptoLATAMError("Error quering cryptomkt");
    }
    const timeline = {
      ask: body["data"]["prices_ask"]["values"],
      bid: body["data"]["prices_bid"]["values"],
    };

    const currency = "CLP";
    const candle = timeline.ask.map((asked, i) => {
      const bidded = timeline.bid[i];
      return {
        date: moment(asked["candle_date"]).format(),
        volume: parse(asked["volume_sum"], "ETH"),
        hight: {
          ask: parse(asked["hight_price"], currency),
          bid: parse(bidded["hight_price"], currency),
        },
        open: {
          ask: parse(asked["open_price"], currency),
          bid: parse(bidded["open_price"], currency),
        },
        close: {
          ask: parse(asked["close_price"], currency),
          bid: parse(bidded["close_price"], currency),
        },
        low: {
          ask: parse(asked["low_price"], currency),
          bid: parse(bidded["low_price"], currency),
        },
      };
    });
    const current = {
      ask: get(candle, [0, "close", "ask"], null),
      bid: get(candle, [0, "close", "bid"], null),
      volume: get(candle, [0, "volume"], null),
    };
    return { current, candle };
  }
}
