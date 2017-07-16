"use strict";

import numeral from "numeral";

export function parse(input, currency = "CLP") {
  return [numeral(input).value(), currency];
}

export function render(input = []) {
  const [value, currency] = input;
  return `${numeral(value).format("0,0")} ${currency}`;
}
