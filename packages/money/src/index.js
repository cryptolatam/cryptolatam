"use strict";

import numeral from "numeral";

import CryptoLATAMError from "@cryptolatam/error";

const reg0 = /0/g;
const reg$ = /\$/g;

export function parse(input, currency = "USD") {
  return [numeral(input).value(), currency.toUpperCase()];
}

export function render(input = null, options = {}) {
  const unitless = Boolean(options.unitless);
  const symbol = options.symbol || "";

  let format = null;
  if (options.format) {
    format = options.format;
  } else if (options.digits > 0) {
    format = "$0,0." + "0".repeat(options.digits);
  } else if (options.type === "coin") {
    format = "$0,0.0000";
  } else {
    format = "$0,0";
  }

  let number = "";
  if (input === undefined || input === null) {
    const missing = options.missing || "-";
    number = `${numeral(null).format(format)}`.replace(reg0, missing);
  } else if (input.length > 0 && (input[0] === undefined || input[0] === null)) {
    const missing = options.missing || "-";
    number = `${numeral(null).format(format)}`.replace(reg0, missing);
  } else if (input.length > 0) {
    number = `${numeral(input[0]).format(format)}`;
  } else {
    throw new CryptoLATAMError(`Invalid money object: ${input}`, { input, options });
  }
  number = number.replace(reg$, symbol);

  if (unitless) {
    return number;
  } else if (options.unit) {
    return `${number} ${options.unit}`;
  } else if (input && input[1]) {
    return `${number} ${input[1].toUpperCase()}`;
  } else {
    return number;
  }
}
