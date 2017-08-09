"use strict";

import axios from "axios";
import ms from "millisecond";
import Rx from "rxjs";
import moment from "moment";
import get from "lodash/get";

import CryptoLATAMError from "@cryptolatam/error";
import { parse } from "@cryptolatam/money";

export default class CryptoMKT {
  static get defaults() {
    return {
      baseURL: "https://www.cryptomkt.com/api/",
      timeout: 3000,
    };
  }

  constructor({ key, store } = {}, options) {
    this.name = "CryptoMKT";
    this.key = key || "cryptomarket:data";
    this.store = store;
    this.options = Object.assign(this.constructor.defaults, options);
    this.client = axios.create(this.options);
  }

  async fetch(options = {}) {
    const exchanges = options.exchanges || [
      ["ETH", "ARS"],
      // ["ETH", "BRL"], // August
      ["ETH", "CLP"],
      // ["ETH", "EUR"], // September
    ];

    const promises = exchanges.map(async pairs => {
      const exchange = pairs.join("").toLowerCase();
      const { data } = await this.client.get(`/${exchange}/1440.json`);
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
        if (response.every(res => res["status"] === "success")) {
          return response;
        } else {
          throw new CryptoLATAMError("Error quering cryptomkt.", response);
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

          const timeline = {
            ask: market["data"]["prices_ask"]["values"],
            bid: market["data"]["prices_bid"]["values"],
          };

          const candle = timeline.ask.map((asked, i) => {
            const bidded = timeline.bid[i];
            return {
              date: moment(asked["candle_date"]).format(),
              volume: parse(asked["volume_sum"], coin),
              hight: {
                ask: parse(asked["hight_price"], fiat),
                bid: parse(bidded["hight_price"], fiat),
              },
              open: {
                ask: parse(asked["open_price"], fiat),
                bid: parse(bidded["open_price"], fiat),
              },
              close: {
                ask: parse(asked["close_price"], fiat),
                bid: parse(bidded["close_price"], fiat),
              },
              low: {
                ask: parse(asked["low_price"], fiat),
                bid: parse(bidded["low_price"], fiat),
              },
            };
          });
          const current = {
            ask: get(candle, [0, "close", "ask"], null),
            bid: get(candle, [0, "close", "bid"], null),
            volume: get(candle, [0, "volume"], null),
          };

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
