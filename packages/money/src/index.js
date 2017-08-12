"use strict";

import numeral from "numeral";

export function parse(input, currency = "USD") {
  return [numeral(input).value(), currency.toUpperCase()];
}

export function render(input = [], options = {}) {
  const [value, currency] = input;
  const format = options.format || "0,0";
  return `${numeral(value).format(format)} ${currency.toUpperCase()}`;
}
